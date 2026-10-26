<script setup>
// @ is an alias to /src

import { defineProps, reactive, onMounted, ref, watch, defineEmits, createApp } from 'vue'
    import VueSimpleAlert from 'vue3-simple-alert';
import {HTTP} from '@/assets/services/http-common.js'
//import auth from '@/assets/services/auth'
//import VueBarcode from '@chenfengyuan/vue-barcode';
//    import { VueDatePicker as Datepicker } from '@vuepic/vue-datepicker';
    import { DateTime } from "luxon";
    import '@vuepic/vue-datepicker/dist/main.css'
    const app = createApp({});
    app.use(VueSimpleAlert);

    const props = defineProps({
		'klantenkaart': String
	})

    const state = reactive({
        publicPath: process.env.BASE_URL,
		acties: [],
        currentActie: null,
        customer: '',
        error: '',
        correct: '',
        munten: true,
        adding: false
	})

    const details = reactive({
		munten: 0,
        eindbedrag: 0
	})

    function getActies(){
        HTTP.get(`spaaractie`)
        .then((response) => {
            state.acties = response.data.filter((item) => {
				return DateTime.fromFormat(item.start_date, 'yyyy-MM-dd') < DateTime.now() && DateTime.now() < DateTime.fromFormat(item.end_date, 'yyyy-MM-dd')
			})
			console.log(state.acties)
			state.currentActie = state.acties[0]
        })
        .catch(() => {
        })
    }
      
    async function getCustomer(){
        return new Promise((resolve) => {
            var params = {
                klantenkaart: props.klantenkaart
            }
            HTTP.get(`customer/employee/`, {params: params} )
            .then((response) => {
                state.customer = response.data
                if(!state.customer){
                    state.error = "Ongeldig of onbekende klantenkaart."
                }
                resolve()
            })
            .catch((err) => {
                state.error = err
                resolve()
            })
        })
      }
    onMounted(() => {
        getCustomer()
        .then(() =>{
            console.log(state.error)
            if(state.error === ''){
                getActies()
            }
            else{
                app.$alert(
                    state.error,
                    '',
                    'warning',
                    {
                        confirmButtonText: 'Ok',
                        confirmButtonColor: '#F58320',
                        cancelButtonColor: '#e4e4e4',
                        timer: 5000,
                    }
                )
                .then(()=>{
                    emit('finished')
                })
            }
        })
	})

    const calculateZegels = ((gap, toggle) =>{
		if(toggle) return Math.floor(details.eindbedrag / gap)
		return 0
	})

    
    const calculateMunten = ((gap, toggle, checkedActies, acties) =>{
        var highest = 0.00;
        for(var item in checkedActies){
            let actie = acties.find(el => el.spaaractie_id === checkedActies[item])
            let amount = calculateZegels(actie.stamp_price, true)
            if(highest < amount * actie.stamp_price) highest = amount * actie.stamp_price
        }
        let leftover = details.eindbedrag - highest
		if(toggle) return Math.floor(leftover / gap)
		return 0
	})

    const checkedActies = ref([])

    watch(() => state.spaarzegels, () => {
		details.spaarzegels = calculateZegels(state.currentActie?.stamp_price || state.stampgap, state.spaarzegels)
		if(state.spaarzegels) details.spaarzegelsAmount = 1
		else{ details.spaarzegelsAmount = 0}
	}, {immediate: true})

    watch(() => state.munten, () => {
		details.munten = (state.munten ? calculateMunten(2.5, true, checkedActies.value, state.acties) : 0)
	}, {immediate: true})

    watch(() => checkedActies.value, () => {
		details.munten = (state.munten ? calculateMunten(2.5, true, checkedActies.value, state.acties) : 0)
	}, {immediate: true, deep: true})

    watch(()=> details.eindbedrag, () => {
        details.munten = (state.munten ? calculateMunten(2.5, true, checkedActies.value, state.acties) : 0)
    })

	function calculateAmountOfStamps(actie){
		return calculateZegels(actie.stamp_price, checkedActies.value.includes(actie.spaaractie_id))
	}

    const emit = defineEmits(['back', 'finished'])

    function finishOrder(){
        state.adding = true
        var actie = []
        for (var key in checkedActies.value) {
           var id = checkedActies.value[key]
           let current = state.acties.find(e => e.spaaractie_id == id)
           var aantal = calculateAmountOfStamps(current)
           actie.push({spaaractie_id: id, aantal: aantal})
        }
        var data = {
            details: details,
            customer_id: state.customer.customer_id,
            spaaracties: actie
        }
        HTTP.put(`/customer_spaaractie/employeeupdate`, data)
        .then((response) =>{
            state.correct =  response.data.message
            setTimeout(() => {
                emit('finished')                
            }, 2500);
        })
        .catch((errors) => {
            state.adding = true
            state.error = errors
        })
        
    }

</script>
<template>
    <div class="order-modal">	
        <div class="bondata">
            <div class="status" v-html="`Klantenkaart: ${klantenkaart}`"></div>
        </div>
        
        <p style="color: red; font-size: 1.2rem;" v-html="state.error" v-if="state.error != ''"></p>
        <p style="color: green; font-size: 2rem;" v-html="state.correct" v-if="state.correct != ''"></p>

        <div class="acties" v-if="state.customer">
            <div class="grid-container zegels" v-for="actie in state.acties" :key="actie.spaaractie_id">
                <div class="grid-item first">
                    <img v-if="actie.stamp_imgurl" :src=" `${actie.stamp_imgurl}`"  />				
                </div>				
                <div class="spaarzegels grid-item second" v-html="`${actie.title}:`"></div>
                <label class="checkbox path grid-item third">
                    <input type="checkbox" v-model="checkedActies" :value="actie.spaaractie_id" />
                    <svg viewBox="0 0 21 21">
                        <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                    </svg>
                </label>
                <div class="grid-item fourth" v-html="`${calculateAmountOfStamps(actie) || 0}`"></div>
            </div>
            <div class="grid-container zegels">
                <div class="grid-item first">
                    <img :src=" `${state.publicPath}img/coin_exchange.png`" />
                </div>				
                <div class="spaarzegels grid-item second" v-html="`Munten:`"></div>
                <label class="checkbox path grid-item third">
                    <input type="checkbox" v-model="state.munten" />
                    <svg viewBox="0 0 21 21">
                        <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                    </svg>
                </label>
                <div class="grid-item fourth" v-html="`${details.munten || 0}`"></div>
            </div>
        </div>
        <div class="eindbedrag" v-if="state.customer">
            <label class="input-label" id="input-group-1" v-html="`Totaal betaald, excl. statiegeld:`" label-for="input-1"/>
            <div class="input">
                <input
                    type="number" 
                    name="eindbedrag"
                    placeholder="Totaal betaald"
                    step=".01"
                    min="0"
                    v-model="details.eindbedrag"
                    id="input-1"
                    pattern="d\*"
                    inputmode="decimal"
                />
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="bi bi-eye" 
                    viewBox="0 0 16 16" 
                    @click="details.eindbedrag = 0"
                    fill="none" 
                    stroke="#000000" 
                    stroke-width="3" 
                    stroke-linecap="butt" 
                    stroke-linejoin="round">
                    <line x1="14" y1="2" x2="2" y2="14"></line><line x1="2" y1="2" x2="14" y2="14"></line> 
                </svg>
            </div>
            <button class="finish" @click="finishOrder()" :disabled="state.adding">Zegels uitreiken</button>
        </div>       
       <div class="buttons">
            <button @click="emit('finished')">Terug</button>
        </div>
  </div>
</template>

<style scoped lang="scss">
    .finish{
        max-width: 49%;
    }
    .finish:disabled{
        background-color: var(--base-color-disabled);
    }
    .input{
        max-width: 49%;
        position: relative;
    }
    .input input{
        width: 85%;
    }
    .input-label{
        width: 100%;
    }
    .eindbedrag{    
        position: relative;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: center;
    }
    
    .eindbedrag .bi-eye{
        position: absolute;
        right: 0;
        height: 33%;
        bottom: 33%;
        transform: translateX(-50%);
    }
.order-modal{
    display: flex;
    flex-direction: column;
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
    justify-content: flex-start;
    overflow-y: scroll;
    flex-wrap: nowrap;
}
.bondata{
    width: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    justify-content: flex-start;
    padding-top: 20px;
    padding-bottom: 20px;
}


.eindbedrag{
    padding-top: 10px;
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
    background: orange;
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
    width: 100%;
    min-height: 65px;
}
.grid-container{
    display: grid;        
    grid-template-columns: repeat(8, 1fr);
    gap: 5px;
    /*grid-auto-rows: minmax(100px, auto);*/
    border-bottom: 1px solid #ececec;
    padding: 10px;
}
.first{
    grid-column: 1/3;
}
.second{        
    grid-column: 3/6;
}    
.third{        
    grid-column: 6/8;
}
.fourth{
    grid-column: 8;
}
.third-long{
    grid-column: 7/9;
}
.zegels{
    font-size: 1.2rem;
    font-weight: 600;
}

.checkbox input{    
    width: 75px;
    height: 75px;
}

.checkbox svg{    
    width: 76px;
    height: 76px;
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