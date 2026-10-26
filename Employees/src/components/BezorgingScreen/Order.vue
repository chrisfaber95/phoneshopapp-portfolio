<script setup>
    import { reactive, defineProps, computed, defineExpose, onBeforeMount} from 'vue';
	import {HTTP} from '@/assets/services/http-common.js';
	//import auth from '@/assets/services/auth'
	//import ReceiptInformation from '@/components/CollectingScreen/ReceiptInformation.vue'
    import { VueDatePicker as Datepicker } from '@vuepic/vue-datepicker';
    import '@vuepic/vue-datepicker/dist/main.css'

	const props = defineProps({
		'order': Object
	})

	const state = reactive({
		order: [],
		orderProducts: [],
		choosePickingMethod: false,
		editOrderModal: false,
		check_id: false
	})

	const orderStatus = computed(() => {
		if(state.order.delivery){
            switch (state.order.status) {
                case 'ordered':
                    return "Besteld"
                case 'picked':
                    return "Verpakt"
                case 'scanned':
                    return "Klaar voor bezorging"
                case 'payed':
                    return "Betaald"
                case 'afgehaald':
                    return "Bezorgd"
                case 'rejected':
                    return "Geannuleerd"
                default:
                    return ""
            }
        }
        else{
            switch (state.order.status) {
                case 'ordered':
                    return "Besteld"
                case 'picked':
                    return "Verpakt"
                case 'scanned':
                    return "Verwerkt bij de kassa"
                case 'payed':
                    return "Betaald"
                case 'afgehaald':
                    return "Afgehaald"
                case 'rejected':
                    return "Geannuleerd"
                default:
                    return ""
            }
        }
	})	

	function formatTime(timeString){
		let time = timeString.split(':')
		return `${time[0]}:${time[1]}`
	}

    //const emit = defineEmits(['multiAlert'])

	onBeforeMount(() => {
		state.order = props.order
		state.orderProducts = props.order.product_list
	})

	const prods = computed(() =>{
		return state.orderProducts
	})

	const currentOrder = computed(() =>{
		return state.order
	})

	defineExpose({
		prods,
		order: currentOrder
	})

    
    function storePayment(){
        if(confirm("Bestelling betaald aan bezorger?")){
            state.order.status = 'payed'
            state.order.paycode = `employee-${localStorage.getItem('user_id')}-Storepayment`
            var data = {
                type: "Update",
                order: state.order,
                items: state.orderProducts
            }
            HTTP.put(`/order/${state.order.id}`, data)
            .then(() =>{
                alert("Bestelling is betaald")
            })
            .catch(() => {
            })
        }
    }

    /*function declineOrder(){
        state.order.status = 'rejected'
        var data = {
            type: "Annuleren",
            order: state.order
        }
        HTTP.put(`/order/${state.order.id}`, data)
        .then((response) =>{
            console.log(response)
        })
        .catch((errors) => {
            console.log(errors)
        })
    }*/

    function finishOrder(){
        state.order.status = 'afgehaald'
        state.order.pickup_confirm = 'test'
        state.order.pickup_user = localStorage.getItem('user_id')
        state.order.pickedup_time = new Date().toISOString()
        var data = {
            type: "Update",
            order: state.order,
            items: state.orderProducts
        }
        HTTP.put(`/order/${state.order.id}`, data)
        .then(() =>{
        })
        .catch(() => {
        })
    }


    function needIdCheck(){
        const results = state.orderProducts.filter(obj => {
            return obj.product.department?.nix18 == 1;
        });
        if (results.length > 0) return true
        return false
	}

    function formatDate(date){
        if(date){
            date = new Date(date).toLocaleDateString()
            return date.split('T')[0]
        }
        else return ''
    }

    function formatAddress(info){
        if(info == ''){
            return ''
        }
        else{
            return info.replaceAll(' ', '+')
        }
    }
</script>

<template>
	<div class="bon-container">
		<div class="header">
			<p class="time" v-if="state.order.pickupTime" v-html="`${state.order.delivery ? 'Bezorgtijd' : 'Afhaaltijd'}:${formatTime(state.order.pickupTime)}`"></p>
			<div class="status" v-html="`Status: ${orderStatus}`"></div>
            <a class="route" :href="`https://www.google.com/maps/dir/?api=1&destination=
                            ${formatAddress(state.order.order_information.street)},
                            ${formatAddress(state.order.order_information.house_number)}${formatAddress(state.order.order_information.house_addition)},
                            ${formatAddress(state.order.order_information.zipcode)},
                            ${formatAddress(state.order.order_information.city)}
                            &travelmode=bicycling`" target="_blank" rel="noopener noreferrer">
                    <button v-html="'Route'"></button>
                </a>	
        </div>
        <div class="information">
            <h2 v-html="`Bezorgnummer: ${state.order.order_id || state.order.id || ''}`"></h2>
            <p v-html="`Naam: ${state.order.order_information.customerName || ''}`"></p>
            <p v-html="`Telefoon: ${state.order.order_information.customerPhone || ''}`"></p>
            <div class="address">
                <p v-html="`Adres: ${state.order.order_information.street || ''} 
                    ${state.order.order_information.house_number || ''} 
                    ${state.order.order_information.house_addition || ''}`"></p>
                <p v-html="`${state.order.order_information.zipcode || ''} ${state.order.order_information.city || ''}`"></p>
            </div>
            <div v-html="`ID check: ${needIdCheck() ? 'JA' : 'NEE'}`"></div>
            <div v-html="`Leeftijd: ${formatDate(state.order.id_check)}`" v-if="needIdCheck()"></div>
        </div>
        <div class="bottom">
            <button v-if="state.order.status == 'scanned'" @click="storePayment()">Betaling aan bezorger</button>

            <button v-if="
						(state.order.status == 'payed' && state.order.paycode) && 
						(needIdCheck() == false || (state.order.id_check !== '' && state.order.id_check != null))" 
					v-html="'Bezorgd'"
					@click="finishOrder()"></button>
            <button @click="state.check_id=true" v-html="'ID Controle'" v-if="(state.order.status == 'scanned' || state.order.status == 'payed') && needIdCheck() && (state.order.id_check == '' || state.order.id_check == null || state.order.id_check == 'null')"></button>
            
            <div class="modal-overlay" v-if="state.check_id">
                <div class="id-check">
                    <h2>ID controle</h2>					
                    <label id="input-group-5" label="Leeftijd:" v-html="`Leeftijd:`"/>
                    <Datepicker v-model="state.order.id_check" format="dd/MM/yyyy"/>
                </div>
				<button :disabled="!state.order.id_check || state.order.id_check == ''" @click="state.check_id = false" v-html="'ID gecontroleerd'"></button>
            </div>
        </div>
	</div>	
</template>

<style lang="scss" scoped>
	.bon-container{
		width:100%;
		font-weight: 600;        
        border: 5px solid #eeeeee;
	}
	.bon-container > .header{
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        flex-direction: column;
        flex-wrap: wrap;
        margin-left: 10px;
        margin-top: 10px;
        position: relative;
	}
	.header .time{
		font-size: 1.6rem;
        margin: unset;
        margin-bottom: 5px;
	}	
    .header .status{
		font-size: 1.5rem;
		max-width: 50%;
	}

    .header .route{
        position: absolute;
        right: 5px;
        top: 0px;
    }

    .header .route button{
        margin: 0;
        font-size: 1.2rem;
    }

    .information{
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        align-content: flex-start;
        margin-left: 5px;
        font-size: 1.1rem;
    }

    .information > p, .information .address > *{
        margin: unset;
        margin-bottom: 2px;
    }
	.top-buttons{
		padding-bottom: 10px;
	}
	.top-buttons button{
		margin: 5px;
	}
	.chosen-order{
		background-color: #00a700;
		border-color: #00a700;

	}
	.picking-methods{
		width: 96%;
		height: 96%;
		left: 2%;
		top: 2%;
		background-color: #ffffff;
	}
	.edit-order{
		width: 96%;
		height: 96%;
		left: 2%;
		top: 2%;
		background-color: #ffffff;
	}
	.status{
		font-size: 2rem;
		padding-bottom: 10px;
	}
	.bon{
		width: inherit;
		margin-left: auto;
		margin-right: auto;
		border: 6px solid #e4e4e4;
		padding: 5px;
	}
@media (orientation: landscape){
}

@media (min-width: 481px){

/* 
  ##Device = Tablets, Ipads (portrait)
  ##Screen = B/w 768px to 1024px
*/
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