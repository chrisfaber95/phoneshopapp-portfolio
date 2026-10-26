<script setup>
    // @ is an alias to /src
    
    import { defineProps, reactive, onMounted, ref, watch, defineEmits, computed } from 'vue'
    import {HTTP} from '@/assets/services/http-common.js'
    //import auth from '@/assets/services/auth'
    //import VueBarcode from '@chenfengyuan/vue-barcode';
    //    import { VueDatePicker as Datepicker } from '@vuepic/vue-datepicker';
        import '@vuepic/vue-datepicker/dist/main.css'
    
        const props = defineProps({
            'actie': String
        })
    
        const state = reactive({
            publicPath: process.env.BASE_URL,
            acties: null,
            currentActie: null,
            customer: '',
            error: '',
            correct: '',
            munten: true,
            boekjes: 1
        })
    
        const details = reactive({
            aantal: 0,
            fysiek: 0
        })
    
        function getActies(){
            var params = {
                customer_has_spaaractie_id: props.actie
            }
            HTTP.get(`customer_spaaractie`, {params: params})
            .then((response) => {
                state.acties = response.data[0]
            })
            .catch(() => {
            })
          }
          
        function getCustomer(customer_id){
            var params = {
                customer_id: customer_id
            }
            HTTP.get(`customer/employee/`, {params: params} )
            .then((response) => {
                state.customer = response.data
            })
            .catch(() => {
            })
          }
        onMounted(() => {
            getActies()
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

        watch(() => state.acties, () =>{
            getCustomer(state.acties.customer_id)
        })
    
        const emit = defineEmits(['back', 'finished'])
    
        function finishOrder(){
            var digital
            if(state.boekjes * state.acties.spaaractie.amount_of_stamps <= state.acties.stamp_amount){
                digital = state.boekjes * state.acties.spaaractie.amount_of_stamps
            }
            else{
                digital = state.acties.stamp_amount
            }
            details.fysiek = aantalFysiek.value
            details.aantal = digital
            var data = {
                details: details,
                spaaracties: state.acties
            }
            HTTP.put(`/customer_spaaractie/employeechange`, data)
            .then((response) =>{
                state.correct =  response.data.message
                setTimeout(() => {
                    emit('finished')                
                }, 2500);
            })
            .catch((errors) => {
                state.error = errors
            })
            
        }
    
        const aantalFysiek = computed(() => {
            return state.acties.spaaractie.amount_of_stamps - state.acties.stamp_amount
        })
    </script>
    <template>
        <div class="changer-modal">	
            <div class="bondata" v-if="state.customer">
                <div class="status" v-html="`Klant: ${state.customer.klantenkaart}`"></div>
                <div class="actie" v-html="`Spaaractie: ${state.acties.spaaractie.title}`"></div>
            </div>
            <p style="color: red; font-size: 1.2rem;" v-html="state.error" v-if="state.error != ''"></p>
            <p style="color: green; font-size: 2rem;" v-html="state.correct" v-if="state.correct != ''"></p>
    
            <div class="customerinfo" v-if="state.acties">
                <img v-if="state.acties.spaaractie.stamp_imgurl" :src=" `${state.acties.spaaractie.stamp_imgurl}`"  />	
                <div class="actie" v-html="`Beschikbare digitale zegels: ${state.acties.stamp_amount}`"></div>
            </div>
            
            <div class="eindbedrag" v-if="state.acties">
                <label class="input-label" id="input-group-1" v-html="`Aantal fysieke zegels:`" label-for="input-1"/>
                <div class="input">
                    <input
                        type="number" 
                        pattern="d\*"
                        inputmode="decimal"
                        step="1"
                        min="0"
                        :max="state.acties.stamp_amount"
                        v-model="state.aantal" 
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
                <button class="finish" @click="finishOrder()">Zegels innemen</button>
                
                <div class="actie" v-html="`Benodigde digitale zegels: ${aantalFysiek}`"></div>
                <div class="actie" v-html="`Aantal ingeleverde boekjes: ${aantalFysiek}`"></div>
                <div class="help">
                    Volledig digitale boekjes inleveren? 0/1 
                </div>
                <div class="help" v-html="`Vergeet niet <b>${aantalFysiek}x</b>de ean code te scannen, het/een fysieke boekje te bewaren met de zegels en op dit boekje het aantal digitale zegels te vermelden.`"></div>
            </div> 

           <div class="buttons">
                <button @click="emit('finished')">Terug</button>
            </div>
      </div>
    </template>
    
    <style scoped lang="scss">
        .help{
            font-size: 1.2rem;
            padding-top: 10px;
        }
        .finish{
            max-width: 49%;
        }
        .input{
            width: 45%;
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
            align-items: stretch;
            justify-content: space-around;
        }
        
        .eindbedrag .bi-eye{
            position: absolute;
            right: 0;    
            height: 25%;
            top: 0;
            transform: translateY(75%) translateX(-50%);
        }
    .changer-modal{
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
        justify-content: space-between;
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
        max-width: 30%;
        height: auto; 
    }
    .buttons{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        width: 100%;
    }
    .buttons button{
        width: 100%;
        min-height: 50px;
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