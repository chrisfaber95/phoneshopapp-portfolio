<script setup>
    import { reactive, defineProps, computed, createApp } from 'vue'
    import VueSimpleAlert from 'vue3-simple-alert';
    import basket from '@/assets/icons/shopping-basket-solid.svg'
    import rolcontainer from '@/assets/icons/rolcontainer.svg'
    import rolmandje from '@/assets/icons/rolmandje.svg'
    import shoppingcart from '@/assets/icons/shopping-cart.svg'
    import ScanScreen from '@/components/KassascannerScreen/ScanScreen.vue'

    const app = createApp({});
    app.use(VueSimpleAlert);

		const props = defineProps({
            'order': Object
        })

        const state = reactive({
            order: [],
            scanning: false,
            closing: false
        })

        function getPickingType(){
            let crate = props.order.pickingcrate
            let obj;
            switch (crate) {
                case 'Winkelmandje':
                    obj = {src:basket}
                    break;     
                case 'Rolmandje':
                    obj = {src:rolmandje}
                    break;  
                case 'Rolcontainer':
                    obj = {src:rolcontainer}
                    break;  
                case 'Boodschappenkar':
                    obj = {src:shoppingcart}
                    break;     
                default:
                    obj = {src:''}
                    break;
            }
            return obj
        }
        
        function orderStyleClass(order){
            if(order.status == null || order.status == null) return ''
            if(order.status == 'picked') return 'picked'
            if(order.status == 'scanned') return 'scanned'
            return ''
        }
        const orderStatus = computed(() => {
            switch (props.order.status) {
                case 'ordered':
                    return "Besteld"
                case 'picked':
                    return "Verpakt"
                case 'scanned':
                    return props.order.delivery ? "Klaar voor bezorging" : "Verwerkt bij de kassa"
                case 'payed':
                    return "Betaald"
                case 'afgehaald':
					return props.order.delivery ? "Bezorgd" : "Afgehaald"
                case 'rejected':
                    return "Geannuleerd"
                default:
                    return ""
            }
	})
        
        function hide (){
            app.$confirm(
                `Weet u het zeker? Gegevens worden niet opgeslagen`,
                'warning',
            {
                confirmButtonText: 'Ja',
                cancelButtonText: 'Nee',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4',
                duration: 10000,
            })
            .then((e)=>{
                if(e === true){
                    state.closing = true
                }
            })
        }

        function formatTime(timeString){
            let time = timeString.split(':')
            return `${time[0]}:${time[1]}`
        }

</script>
<template>
    <div class="bon" :class="orderStyleClass(order)">		
		<div class="bondata" v-if="order">
			<div v-html="`Order Nr. ${order.id}`"></div>
			<div v-html="`${order.delivery ? 'Bezorgtijd' : 'Afhaaltijd'}:${formatTime(order.pickupTime || '00:00')}`"></div>
            <div v-html="`Status: ${orderStatus}`"></div>
		</div>
		<div class="rightside">
			<div class="picktype">
                <img :src="getPickingType().src" />
            </div>
			<div class="startScan" v-if="!state.scanning">
				<button class="btn" @click="state.scanning = true" >Kies deze bon</button>
			</div>
            <div class="modal-overlay" v-if="state.scanning">
                <button class="close-button" @click="hide()" >X</button>
                <ScanScreen
                    :order="order"
                    :closing="state.closing"
                    @closingmodal="(callback) => {state.scanning = callback; state.closing = false; }"
                    />
            </div>
		</div>
    </div>
</template>
<style scoped>
.close-button{
    position: absolute;
    right: 15px;
    top: 25px;
    z-index: 101;
    padding: 5px;
    margin: 0px 0;
}
.bon{
    display: flex;
    width: 88%;
    margin-left: auto;
    margin-right: auto;
    border: 6px solid #E4E4E4;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: space-around;
    align-items: center;
    padding: 10px;
    margin: 15px auto;
}
.bon.picked{
	background-color: #f5f5f5;
    background: linear-gradient(to right, #ff0000 0%,#ff0000 4%,#f5f5f5 5%,#f5f5f5 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ff0000', endColorstr='#f5f5f5',GradientType=0 );
    color: black;
    background-color: red;
}
.bon.scanned{
	background-color: #888888;
    background: linear-gradient(to right, #00ff0d 0%,#00ff0d 4%,#f5f5f5 5%,#f5f5f5 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00ff0d', endColorstr='#f5f5f5',GradientType=0 );
    color: black;
    background-color: 00ff0d;
}
.bondata{
    width: 50%;
    font-size: 1.3rem;
    font-weight: 600;
}
.bondata > div{
    padding: 5px 20px;
}
.rightside{
    width: 50%;
}
.picktype img{
    width: 80%;
}
@media (min-width: 481px){
    .bondata{
        font-size: 2rem;
    }
    .close-button{
        right: 25px;
        top: 25px;
    }
}
@media (min-width: 768px){
}

/* 
  ##Device = Tablets, Ipads (landscape)
  ##Screen = B/w 768px to 1024px
*/

@media (min-width: 768px) and (orientation: landscape) {
}


/* 
  ##Device = Laptops, Desktops
  ##Screen = B/w 1025px to 1280px
*/

@media (min-width: 1025px) {
  
}


@media (min-width: 1281px) {
  
  
}
</style>