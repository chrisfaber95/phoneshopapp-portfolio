<script setup>
// @ is an alias to /src
import { computed, defineProps, reactive, onMounted, ref, defineEmits } from 'vue'
import {HTTP} from '@/assets/services/http-common.js'
import auth from '@/assets/services/auth'
import VueBarcode from '@chenfengyuan/vue-barcode';
    import { VueDatePicker as Datepicker } from '@vuepic/vue-datepicker';
    import '@vuepic/vue-datepicker/dist/main.css'

    const props = defineProps({
		'orderId': String
	})

	const bagtypes = ref(process.env.VUE_APP_BAGEAN.split(','))

	function getBagInformation(ean){
		HTTP.get('/product/'+ean)
		.then((response) => {
			state.bags.push(response.data)
		})
		.catch(() => {
		})			
	}

    const state = reactive({
		order: [],
		orderProducts: [],        
		bags: []
	})

    const orderStatus = computed(() => {
        if(state.order?.delivery){
            switch (state.order?.status) {
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
            switch (state.order?.status) {
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
   function filteredBags(product_id){
        const results = state.orderProducts.filter(obj => {
            return obj.product_id == product_id;
        });
        return results.length
    }

    function getOrder() {
        HTTP.get('order/single/'+props.orderId)
        .then((response) => {
            console.log(response)
            state.order = response.data
            state.orderProducts = state.order.product_list
        })
        .catch(() => {
        })
    }	
	/*function getProducts(order){
        HTTP.get('/order/product/'+order)
        .then((response) => {
            state.orderProducts = response.data
        })
        .catch((errors) => {
            console.log(errors)
        })
    }
*/
    onMounted(() => {
		getOrder()
        state.bags = []
		bagtypes.value.forEach(element => {
			getBagInformation(element)
		});
	})

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
    
    function storePayment(){
        if(confirm("Bestelling betaald in de winkel?")){
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

    function declineOrder(){
        state.order.status = 'rejected'
        var data = {
            type: "Annuleren",
            order: state.order
        }
        HTTP.put(`/order/${state.order.id}`, data)
        .then(() =>{
		getOrder()
        })
        .catch(() => {
        })
    }

    function finishOrder(){
        if(confirm('Bestelling afgehaald/afgeleverd?')){
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
            getOrder()
            })
            .catch(() => {
            })
        }        
    }

    const emit = defineEmits(['finished'])
</script>
<template>
    <div class="order-modal">	
        <div class="bondata">
            <div class="status" v-html="orderStatus"></div>
            <div class="time" v-if="state.order.pickupTime" v-html="`Afhaaltijd:${state.order.pickupTime}`"></div>
            <!--Besteldatum, factuurnummer, -->
            <div v-html="`ID check: ${needIdCheck() ? 'JA' : 'NEE'}`"></div>
            <div v-html="`Leeftijd: ${formatDate(state.order.id_check)}`"></div>
            <div class="modal-overlay" v-if="needIdCheck() && (state.order.id_check == '' || state.order.id_check == null || state.order.id_check == 'null')">
                <div class="id-check">
                    <h2>ID controle</h2>					
                    <label id="input-group-5" label="Leeftijd:" v-html="`Leeftijd:`"/>
                    <Datepicker v-model="state.order.id_check" format="dd/MM/yyyy"/>
                </div>
            </div>
        </div>
        <div class="orderinfo">
            <div class="ordernumber" v-html="`NR. ${state.order.id}`"></div>	
            <div class="bags" v-if="state.orderProducts.length > 0 && state.bags > 1">
                <div v-for="item in state.bags" :key="item?.ean">
                    <div v-if="item?.ean" v-html="`${item.product_information.title}: ${filteredBags(item.product_id)}`"></div>
                </div>
            </div>
        </div>
        <div class="customerinfo">
            <div v-html="`Winkelbon`" v-if="state.order.winkelbon && (state.order.winkelbon != null || state.order.winkelbon != '')"></div>	
            <VueBarcode
                class="barcode"
                :value="state.order.winkelbon" 
                :options="{}"
                tag="img">
                Show this if the rendering fails.
            </VueBarcode>
        </div>
       <div class="buttons">
            <button v-if="state.order.status == 'payed' && state.order.paycode" @click="finishOrder()">Afgehaald</button>
            <button v-if="state.order.status == 'scanned'" @click="storePayment()">Winkel betaling</button>
            <button v-if="auth.isAdmin() && state.order.status != 'afgehaald'" @click="declineOrder()">Annuleren</button>
			<button @click="emit('finished')">Terug</button>
        </div>
  </div>
</template>

<style scoped lang="scss">
.order-modal{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    font-weight: 600;
    font-size: 1.5rem;
    padding: 5px;
    align-items: stretch;
    justify-content: space-between;
    width: 96%;
    height: 96%;
    margin-left:auto;
    margin-right:auto;
    background-color: #fff;
}
.bondata{
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    justify-content: flex-start;
}
.orderinfo{
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;   
}
.orderinfo > div{
    width: 49%;
    font-weight: 400;
    font-size: 1.2rem;
}

.orderinfo .ordernumber{
    white-space: pre-line;
    font-size: 2.5rem;
    background: var(--base-color);
    color: #fff;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    align-content: center;
}
.customerinfo{
    width: 100%;
}
.customerinfo img{
    max-width: 50%;
    height: auto; 
}
.buttons{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
}
.buttons button{
    max-width: 49%;
}
/* 
  ##Device = Low Resolution Tablets, Mobiles (Landscape)
  ##Screen = B/w 481px to 767px
*/

@media (orientation: landscape){
}

@media (min-width: 481px){
    .bondata{
        padding-left: 15px;
        padding-top: 15px;
        font-size: 2rem;
    }
  .orderinfo > div{
    font-weight: 600;
    font-size: 2rem;
}
.close-button{
    right: 25px;
    top: 25px;
}
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