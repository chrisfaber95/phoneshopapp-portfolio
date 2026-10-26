<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import Order from '@/components/AfhaalscannerScreen/Order.vue';
// @ is an alias to /src
import {HTTP} from '@/assets/services/http-common.js';
import basket from '@/assets/icons/shopping-basket-solid.svg'
import allicon from '@/assets/icons/everything.svg'
import check from '@/assets/icons/check.svg'

	const publicPath = ref(process.env.BASE_URL)
	const state = reactive({
		orders: [],
        currentTime: '',
        qrcode: ''
	})


    function orderStatus(order){
        switch (order.status) {
            case 'ordered':
                if(!order.picking_user) return {'label': 'Inkomende order', 'icon': allicon}
                return {'label': 'Wordt verzameld', 'icon': basket}
            case 'picked':
                return {'label': 'Verpakt', 'icon': basket}
            case 'scanned':
                return {'label': 'Gereed', 'icon': check}
            case 'payed':
                return {'label': 'Gereed', 'icon': check}
            default:
                return {'label': '', 'icon': ''}
        }
    }

    function formattedDate(date){
		console.log(new Date(date).toISOString())
		console.log(new Date(date).toISOString().split('T'))
		return new Date(date).toISOString().split('T')[0]
	}

    function getOrders(date) {
        console.log(date)
		if(date == ''){
			date = formattedDate(state.orderDate)
		}
		const params = {
			pickupDate: date
		}
		HTTP.get(`order`, {params})
		.then((response) => {
			console.log(response)
			state.orders = response.data
		})
		.catch((errors) => {
			console.log(errors)
		})
    }

    function updateOrder(){
        state.currentTime = new Date().toLocaleTimeString().split(':', 2).toString().replace(',', ':')
		getOrders(new Date().toISOString().split("T")[0])
    }
    onMounted(() => {
        state.currentTime = new Date().toLocaleTimeString().split(':', 2).toString().replace(',', ':')
		getOrders(new Date().toISOString().split("T")[0])
		setInterval(updateOrder, 30000);
    })

    const filteredOrders = computed(() => {
		var allOrders
		allOrders = state.orders.filter(e => e.status != "afgehaald" || e.status != "rejected");
		return allOrders;
	})

    function hide (){
          state.qrcode = ''
    }
</script>
<template>
    <div class="bestellingenscreen">
        <div id="header">
            <div class="logo">
                <router-link to="/">
                    <img class="img-fluid" :src="`${publicPath}img/logo-supermarkt-coop.png`"/>
                </router-link>
            </div>
            <div class="title" v-html="`Bestellingen`">
            </div>
            <div class="time">
                <div v-html="`${state.currentTime}`"></div>
            </div>
        </div>
        <div class="bonnen">
            <div class="order" v-for="order in filteredOrders" :key="order.id+'row'" @click="state.qrcode = order.id">
                <div class="orderid" v-html="`${order.id}`"></div>
                <div class="pickuptime" v-html="`${order.pickupTime}`"></div>
                <div class="status">
                    <p v-html="orderStatus(order).label"></p><img :src="orderStatus(order).icon" />
                </div>
            </div>
            <div class="sale">
                <img :src="publicPath + 'img/sales/82022/1.jpeg'" class="" >
            </div>
            
            <div class="modal-overlay" v-if="state.qrcode != ''">
                <button class="close-button" @click="hide()" >X</button>
                <Order 
                    v-if="state.qrcode != ''"
                    :orderId ="state.qrcode"/>
            </div>
        </div>
        <div id="footer">
            <div class="ads">					
                <!--<img class="img-fluid logo" :src="require(`@/assets/coop-groningen-lubbers-samen.jpg`)"/>-->
                <p>Demoscherm - Niet uitzetten</p>
            </div>
        </div>
    </div>
</template>


<style scoped>
.bestellingenscreen{
    width: 100vw;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    align-items: stretch;
    flex-wrap: wrap;
}

#header{
	background-color: var(--base-color);
	padding-top: 5px;
	border-bottom: 5px solid rgba(255,0,0,1);
	color: #ffffff;
    display: flex;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    height: 10vh;
}
#header .logo,
#header .time,
#header .title
{
	padding: 5px 0px;
    max-width: 30%;
	font-size: 1.5rem;
	font-weight: 600;
}
#header .title{
    width: fit-content;
}
#header .logo{
    height: 100%;
}
#header .logo a img{
    object-fit: contain;
}
#header .time{
    width: 30%;
    display: flex;
    justify-content: space-around;
}
#header .time div{
	display: inline-flex;
    flex-direction: row;
    justify-content: flex-end;
	align-items: center;
	background-color: var(--base-color);
	border: 1px solid #cccccc;
	border-radius: 10px;
	width: fit-content;
    padding: 10px;
}
.bonnen{
    width: 100%;
    display: flex;
    overflow-x: scroll;
    flex-direction: column;
    align-items: center;
    flex-wrap: nowrap;
	height: 80vh;
	background-color: #f1f1f1;
	overflow: hidden;
	align-content: flex-start;
}
.bonnen .order{
	height: 10%;
	background-color: #ffffff;
	display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    flex-wrap: wrap;
    align-content: center;
    width: 90%;
	padding: 10px;
	border: 1px solid #cccccc;
	border-radius: 10px;
	margin: 10px;
	font-size: 1.5rem;
	font-weight: 600;
	
    -webkit-box-shadow: 6px 10px 5px 0px rgb(0 0 0 / 75%);
    box-shadow: 4px 4px 3px 0px rgb(0 0 0 / 40%);
	white-space: nowrap;
	align-items: center
}
.order .status{
    width: 60%;
    font-size: 1.5rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    align-content: center;
    flex-wrap: wrap;
}
.order .status p{
    width: 50%;
	font-size: 1.5rem;
    margin: 0;
    white-space: break-spaces;
}
.order .status img{
	height: 100%;
    width: auto;
}
#footer{
	background-color: var(--base-color);	
	height: 10vh;
	display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    align-content: center;
}
#footer p{
	font-size: 2rem;
	font-weight: 600;
	color: #ffffff
}
.sale{
	display: none;
}
@media (orientation: portrait) and (min-width: 575px){
	#header .title,
	#header .time div{
		font-size: 2rem;
	}
	.bonnen{
		flex-wrap: wrap;
		overflow-x: hidden;
	}
	.bonnen .order{
		width: calc(50% - 20px);
		font-size: 2rem;
	}
}

@media (orientation: landscape) and (min-width: 740px) and (min-height: 575px){
	#header .title,
	#header .time div{
		font-size: 3rem;
	}
	
	#header .logo a img{
		height: 100%;
	}
	.bonnen{
		flex-wrap: wrap;
		overflow-x: hidden;
	}
	.bonnen .order{
		width: calc(50% - 20px);
		height: 14%;
		font-size: 3rem;
	}
	
	.order .status p{
		font-size: 3rem;
		margin: 0;
	}
	.sale{
		display: block;
		width: calc(50% - 20px);
		padding-top: 20px;
	}
	.sale img{
		width: 100%;
	}
}
@media screen and (orientation: landscape) and (max-height:480px){
	#header .logo{
		padding: 0;
	}
	#header .logo a img{
		height: 100%;
	}
	#header .title{
		height: 100%;
	}
	#header .title{
		padding: 0;
		line-height: normal;
	}
	#footer .ads{
		height: 100%;
	}
	.ads img{
		height: 100%;
	}
	.bonnen .order{
		width: 50%;
	}
	
}
.close-button{
    position: absolute;
    right: 15px;
    top: 15px;
    z-index: 101;
    padding: 5px;
    margin: 0px 0;
}
</style>