<template>
	<div class="coinexchange">
        <div class="change-container">
            <img class="background" :src="`${state.publicPath}img/coin_exchange.png`"/>
            <div class="text-in-coin" v-html="`${actie.point_for_stamp} munten inwisselen?`"></div>
            <!--<div class="top">
                <img class="money" v-bind:src="require('@/assets/icons/coins.svg')" />
                <div class="icon">
                    <div class="arrow"></div>
                </div>
                <div class="stamp"><img 
                        :src="`${state.publicPath}img/${actie.stamp_imgurl}`" 
                    /> </div>
            </div>
            <div class="bottom">
                <div v-html="`${state.customer_info.storepoints} munten`"></div>
                <div></div>
                <div v-html="`${stampconvert} zegels`"></div>
            </div>
            <button v-html="`Omwisselen`" @click="exchangePoints()" v-if="clickable"></button>
            -->

        </div>
      
	</div>
</template>

<script setup>
import { reactive, defineProps, onMounted, onBeforeUpdate } from 'vue';
	
import {HTTP} from '@/assets/scripts/http-common.js';


const props = defineProps({
    'actie': Object,
    'clickable': Boolean
})

const state = reactive({
    publicPath: process.env.BASE_URL,
    customer_actie: [],
    stamp_amount: null,
    customer_info: []
})






		/*
		newline:function(html){
			html = html.replace(new RegExp('\r?\n','g'), '<br />');
			return html;
		}
		*/
        function getCustomerInfo(){
            const id = localStorage.getItem("user_id");
            const token = localStorage.getItem("access_token");

            const params = {
                customer_id: id,
                accessToken: token
            }
            HTTP.get("customer", {params})

            .then(response => {
                state.customer_info = response.data[0]
            })
            .catch(() => {
            })
        }
        function getCustomerActies(){
        HTTP.get(`customer_spaaractie/${localStorage.getItem('user_id')}`)
        .then((response) => {
            for (let index = 0; index < response.data.length; index++) {
                if(props.actie.spaaractie_id == response.data[index].spaaractie_id){
                    state.customer_actie = response.data[index]
                    state.stamp_amount = state.customer_actie.stamp_amount
                    state.pages = Math.ceil(state.stamp_amount/props.actie.amount_of_stamps)
                    if (state.pages  < 3) state.pages = 3
                }
                else{
                    state.customer_actie.point_amount = 0
                    state.customer_actie.spaaractie_id = props.actie.spaaractie_id
                    state.customer_actie.stamp_amount = 0
                    state.stamp_amount = state.customer_actie.stamp_amount
                    state.pages = Math.ceil(state.stamp_amount/props.actie.amount_of_stamps)
                    if (state.pages  < 3) state.pages = 3
                }
            }
           
        })
        .catch(() => {
        })
    }

onMounted(() => {
        getCustomerInfo()
        getCustomerActies()     
	})


onBeforeUpdate(() => {
})

</script>

<style scoped>
.change-container{
    width: 80%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    align-content: center;
    justify-content: flex-start;
    margin-left: auto;
    margin-right: auto;
}
.top{
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    justify-items: center;
}
.top img{
    width: 40%;
    height: auto;
}
.bottom{
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    justify-items: center;
    font-weight: 600;
    font-size: 1.1rem;
}

.icon {
  position: relative;
  width: 60px;
  height: 45px;
  cursor: pointer;
}

.arrow {
  position: absolute;
  top: 20px;
  width: 90%;
  height: 8px;
  background-color: var(--base-color);
  box-shadow: 0 3px 5px rgba(0, 0, 0, .2);
  animation: arrow 700ms linear infinite;
}

.arrow::after, .arrow::before {
  content: '';
  position: absolute;
  width: 60%;
  height: 8px;
  right: -10px;
  background-color: var(--base-color);
}

.arrow::after {
  top: -8px;
  transform: rotate(45deg);
}

.arrow::before {
  top: 8px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, .2);
  transform: rotate(-45deg);
}
</style>