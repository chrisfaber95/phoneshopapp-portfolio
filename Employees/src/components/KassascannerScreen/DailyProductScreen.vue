<script setup>
    import { reactive,defineProps , computed, watch, defineEmits} from 'vue'
	//import {HTTP} from '@/assets/services/http-common.js';
    import VueBarcode from '@chenfengyuan/vue-barcode';

		const props = defineProps({
            'orders': Array,
            'closing': Boolean
        })
        const state = reactive({
            orderproducts: [],
            startingscreen: true,
            looping: false,
            currentitem: null,
            timer: 5,
            speed: 300,
            controlscreen: false,
            endscreen: false,
            rescanBarcode: '',
            finalprice: 0.00,
            klantenkaart: '123456789'
        })

        const everyItem = computed(() => {
            let list = []
            console.log(props.orders)
            props.orders.forEach(order => {                        
                order.product_list.forEach(element => {
                    for(var i = 0; i < element.picked; i++){
                        list.push(element)
                    }
                });
            });
            console.log(list)
            return list
        })

        function sleep(ms){
			return new Promise(resolve => setTimeout(resolve, ms));
		}

        async function startScanner(){
            state.looping = true
            for(let i = state.timer; i >= 0; i--){
                state.timer = i;
                await sleep(1000)
            }
            for(let i = 0; i < everyItem.value.length; i++){               
                state.currentitem = everyItem.value[i].product.ean
                await sleep(state.speed)
                state.currentitem = null
                await sleep(state.speed)
            }
            if(state.looping){
                var audio = new Audio(require('@/assets/finished.wav')); // path to file
                audio.play();
            }           
            state.looping = false
            state.startingscreen = false
            state.controlscreen = true
        }

        const emits = defineEmits(['closingmodal'])

        watch(() => props.closing, (newVal) => {
            console.log(props.closing)
            if(newVal == true) {
                state.startingscreen = true
                state.looping = false
                state.currentitem = null
                state.timer = 5
                state.controlscreen = false
                state.endscreen = false
                emits('closingmodal', false)
            }
        })
        function sum(array, key) {
            return array.reduce((a, b) => parseFloat(a) + parseFloat((b[key]) || parseFloat(0)),parseFloat( 0));
        }
</script>
<template>
    <div class="product-screen">
        <div class="starting-overlay" v-if="state.startingscreen && state.timer >= 1">
            <button @click="startScanner()" :disabled="state.looping" v-html="state.looping ? state.timer  : 'Start scanner'"></button>
        </div>
        <div class="product-barcode" v-if="state.currentitem && state.startingscreen">
            <VueBarcode
                class="barcode"
                :value="state.currentitem" 
                :options="{}"
                tag="img">
                Show this if the rendering fails.
            </VueBarcode>
        </div>
        <div class="control-screen" v-if="state.controlscreen">
            <div class="top">
                <div v-html="`Aantal producten: ${everyItem.length}`"></div>
                <div class="done-rectangle" v-html="`Klaar`"></div>			
                <button @click="state.rescanscreen = true; state.controlscreen = false" v-html="`Opnieuw`"></button>
                <button @click="state.controlscreen = false; state.endscreen = true" v-html="`Verder`"></button>
            </div>
            <div class="klantenkaart" v-if="state.klantenkaart != ''">
                <div v-html="`Klantenkaart`"></div>
                <VueBarcode
                    class="barcode"
                    :value="state.klantenkaart" 
                    :options="{}"
                    tag="img">
                    Show this if the rendering fails.
                </VueBarcode>
            </div>
        </div>
        <div class="rescanscreen"  v-if="state.rescanscreen">
            <div class="productlist">
                <div class="head" v-html="`Producten:`"></div>
                <div class="product" v-for="item in everyItem" :key="item.ean">
                    <div class="title" v-html="`${item.product.product_information.title}`"></div>		
                    <div class="ean" v-html="`EAN: ${item.product.ean}`"></div>
                    <button @click="state.rescanBarcode = item.product.ean">Scannen</button>
                    <div class="modal-overlay" v-if="state.rescanBarcode == item.product.ean">                        
                        <div class="rescan-barcode">
                            <div class="title" v-html="`${item.product.product_information.title}`"></div>		
                            <div class="ean" v-html="`EAN: ${item.product.ean}`"></div>
                            <div class="amount" v-html="`Aantal:  ${item.picked} x`"></div>
                            <button class="btn" @click="state.rescanBarcode = ''">Sluiten</button>
                            <VueBarcode
                                class="barcode"
                                :value="item.product.ean" 
                                :options="{}"
                                tag="img">
                                Show this if the rendering fails.
                            </VueBarcode>
                        </div>
                    </div>
                    <hr />
                </div>
            </div>
            <div class="sidebuttons">
                <button @click="state.startingscreen = true; state.timer = 5; state.rescanscreen = false" v-html="`Opnieuw`"></button>
                <button @click="state.rescanscreen = false; state.endscreen = true" v-html="`Verder`"></button>
            </div>
        </div>
        <div class="endscreen" v-if="state.endscreen">
            <div v-html="`Aantal bestellingen: ${props.orders.length}`"></div>
            <div v-html="`Aantal producten: ${everyItem.length}`"></div>
            <div class="orderdetails">		
                <div class="totalprice">
                    <label for="totaalprijs" v-html="`Totaalprijs: ${sum(props.orders, 'finalPrice')}`"></label>
                    <!--<input name="totaalprijs" v-model="state.finalprice" placeholder="0.00"  type="number" step="0.01" min="0.00" inputmode="numeric" pattern="\d*" />-->
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.starting-overlay{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    align-content: center;
    flex-direction: column;
}
.starting-overlay button{
    font-size: 3rem;
    padding: 2rem;
}
.product-barcode{
    height: 100%;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    align-items: stretch;
    align-content: stretch;
    flex-wrap: wrap;
}
.product-barcode img{
    width: 100%;
    height: 40%;
}
.control-screen{
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    align-content: center;
    flex-wrap: wrap;
}
.control-screen .top{    
    padding-top: 20px;
    font-size: 1.5rem;
    font-weight: 600;
    width: 100%;
    height: 45%;
}
.control-screen .top button{
    margin: 15px;
}
.done-rectangle{
    width: 100%;
    height: 70%;
    background-color: #00ff0d;
    color: white;
    font-size: 4rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.klantenkaart{
    font-size: 1.1rem;
    font-weight: 600;
    width: 70%;
    height: 45%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: stretch;
    flex-wrap: wrap;
}
.klantenkaart img{
    max-height: 100%;
}
.rescanscreen{
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: space-around;
    align-content: center;
}
.productlist{
    overflow-y: scroll;
    height: 85%;
    font-size: 2rem;
    font-weight: 600;
}
.productlist .product {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: stretch;
    justify-content: space-around;
    width: 100%;
    align-items: center;
    border-bottom: 2px solid #ececec;
    padding-top: 7px;
}
.product .title{
    width: 100%;
    font-size: 1.4rem;
    font-weight: 600;
}

.product .ean{
    color: #ff0000;
    width: 50%;
    font-size: 1.4rem;
    font-weight: 600;
}
.sidebuttons{
    width: 100%;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    align-items: center;
    flex-direction: row;
    align-content: center;
}

.rescan-barcode{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    align-content: center;
    font-size: 2rem;
    padding: 10px;
}
.rescan-barcode .title,
.rescan-barcode .ean,
.rescan-barcode .amount{
    font-size: 2rem;
    width: 70%;
}
.rescan-barcode button{
    font-size: 2rem;
    padding: 10px;
}
.endscreen{
    font-size: 1.7rem;
    font-weight: 600;
    padding: 15px;
}
.endscreen > div{
    padding-top: 15px;
}
.orderdetails{
    font-size: 1.4rem;
}
.bonnr,
.totalprice{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: center;
    align-items: flex-start;
    justify-content: flex-start;
}
.warning{
    color: #ff0000;
    font-size: 1.2rem;
}

.endscreen button{
    font-size: 2.5rem;
    padding: 20px;
}
</style>