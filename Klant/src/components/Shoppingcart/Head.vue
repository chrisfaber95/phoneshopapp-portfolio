<template>
    <div class="head">        
		<div class="scanner" v-if="state.showScanner">
			<div class="barcode modal-overlay">
				<div class="scan-modal">
					<Scanner
                        ref="scanChild"
                        :location="location"
						@closeScanner="(callback) => {state.showScanner = false;}"
                        @setResult="(callback) => {state.scanResult = callback;}"
					/>

                    {{ state.scanResult }}
                    {{ state.scanProduct }}
				</div>
				<button @click="state.showScanner = false" style="display: none;" >Close</button>
			</div>
		</div>
        <div class="carthead">
            <div class="barcodescanner">
                <button class="styling" @click="state.showScanner = !state.showScanner" v-if="location == 'store' || location == 'list'">
                    <img :src="require('@/assets/icons/self-scan.svg')" />
                </button>
                <button v-if="location == 'actie'" class="styling return left-shadow" @click="router.push('/spaaracties')" v-html="`Terug`"></button>				
            </div>
            <div class="cartbutton" id="cart-opening-button" @click="emit('openCart')">
                <img v-if="cart.calculateTotalPrice() == 0 && location == 'store'" :src=shoppingcart />					
                <img v-if="cart.calculateTotalPrice() > 0 && location == 'store'" :src=shoppingcartFull />		
                <img v-if="location == 'list'" src="data:image/png;base64,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">				
                <img v-if="location == 'actie'" :src=shoppingcartFull />					
                <div class="carttotal">
                    <span v-if="location == 'store'" v-html="`Totaal: &euro;${cart.calculateTotalPrice()}`"></span>
                    <span v-if="location == 'list'" v-html="`Totaal: &euro;${groceryList.calculateTotalPrice()}`"></span>
                    <span v-if="location == 'actie'" v-html="`Totaal: ${actiecart.calculateStampPrice()} zegels`"></span>
                </div>
            </div>
            <div class="barcodescanner" v-if="!state.showScanner">
                <button class="styling" @click="changeStyle(shelfStyle)" v-if="location == 'store' || location == 'list'">
                    <img class="switch" v-bind:src="require('@/assets/icons/switch.svg')" />
                </button>
                <button v-if="location == 'actie'" class="return left-shadow styling" style="font-size: 1rem;" v-html="`Zegels ${stamps}`"></button>		
                <!--Zegels available-->
            </div>
            <div class="barcodescanner" v-if="state.showScanner">
                <button class="styling" @click="scanChild.closeProduct()">
                    <img :src="require('@/assets/icons/new-scan.png')" />
                </button>
            </div>
        </div>
    </div>
</template>
<script setup>
import { reactive, defineProps, computed, defineEmits, watch, ref } from 'vue';

import cart from '@/assets/cart'
import groceryList from '@/assets/groceryList'
import actiecart from '@/assets/actiecart'

//import Scanner from '@/components/Scanners/Barcodescanner2.vue'
//import Scanner from '@/components/Scanners/Barcodescanner4.vue'
import Scanner from '@/components/Scanners/Barcodescanner7.vue'

import shoppingcart from '@/assets/icons/winkelmand-empty.png'
import shoppingcartFull from '@/assets/icons/winkelmand-full.png'

import {HTTP} from '@/assets/scripts/http-common.js';

import { useStore } from 'vuex'
import router from '@/router';
import $ from 'jquery';

    const store = useStore()

    const path = computed(() =>{
        return router.currentRoute.value.path
    })

    defineProps({
		'location': String
	});

    const scanChild = ref(null)

    const state = reactive({
		showScanner: false,
        scanResult: '',
        scanProduct: null
	})

    function changeStyle(style){
			if(style == 0) {style = 1; changeActiveDepartment('0')}
			else if(style == 1) {style = 2; changeActiveDepartment('0')}
			else if(style == 2) {
				style = 0; 
				var dep = store.getters['location/getAvailableDepartments']
				if(dep){				
					changeActiveDepartment(dep[0])
				}
			}
			store.commit('shopsettings/changeShelfStyle',style)
			if(store.getters['shopsettings/getLoggedIn'] && path.value == '/favorites'){
				store.commit('location/changeDepartment', store.getters['location/getAvailableDepartments'][0])
			}
		}

		const shelfStyle = computed(() => { return store.getters['shopsettings/getShelfStyle'] || 0})

		function changeActiveDepartment(department){
			if(department == 0) store.commit('location/changeDepartment', department)
			else store.commit('location/changeDepartment', department)
		}

    const emit = defineEmits(['openCart'])

    watch(() => state.showScanner, (newVal, oldVal) => {
		if(state.showScanner === true){
            $('.view').data('max-height', $('.view').css('max-height'));
            $('.view').data('height', $('.view').css('height'));
			$('.view').animate({
				'max-height': '100%',
                'height': '100%'
			}, 600, "linear");

           /* $('#cartslide').animate({
				'max-height': '80%',
			}, 600, "linear");*/
		}
		else{
			$('.view').animate({
				'max-height': $('.view').data('max-height'),
                'height': $('.view').data('height')
			}, 600, "linear");
		}
	})
    const stamps = computed(() => {
        return store.getters['location/getCurrentActie']?.stamp_amount || 0
    })

    function getProduct(ean){
		HTTP.get(`product/${ean}`)
		.then((response) => {
			state.scanProduct = response.data
		})
		.catch((e) => {
            console.log(e)
		})
	}
	

    watch(() => state.scanResult, (newVal, oldVal) => {
        if(state.scanResult != ''){
          getProduct(state.scanResult)
        }
      },{immediate: true, deep: true})
</script>
<style scoped>

.head{
    position: relative;
    z-index: 5;
}
.carthead{
	height: 98%;
	width: 100%;
	max-height: 6vh;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-rows: 6vh;
    padding-bottom: 20px;
    position: relative;
    z-index: 8;
    background-color: #ffffff;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
}

.carthead .styling{
    background-color: unset;
    border: unset;
    box-shadow: unset;
}
.carthead .scan{
    height: fit-content;
    max-height: 100%;
    font-size: 100%;
    padding: 0px;
    color: #ffffff;
}
.cartbutton img{
    width: auto;
    height: 100%;
}
.carttotal{
    font-size: 0.95rem;
    font-weight: 700;
	
    white-space: nowrap;
}

.cartbutton{
    border-radius: 5px;
    background: #ffffff;
    -webkit-box-shadow: 1px 1px 1px 0px rgb(0 0 0 / 60%);
    box-shadow: 1px 1px 1px 0px rgb(0 0 0 / 60%);
    color: #000000;
    height: 69%;
    margin-top: 3px;
    border: 1px solid #000000;
    display: inline-block;
    margin-left: auto;
    margin-right: auto;
}

.barcodescanner{
    height: 100%;
    padding-top: 5px;
}
.barcodescanner button{
	height: 100%;
	padding: 1px;
    margin: 0px 0px 0 0;
}
.barcodescanner button img{
	height: 100%;
	width: auto;
}

.modal-overlay.barcode{
    overflow-y: scroll;
	height: 100%;
}
.barcode .scan-modal{
    overflow-y: hidden;
    height: 88%;
    margin-top: 5px;
}
.barcode{
	display: block;
    position: fixed;
    top: 0;
    height: 100%;
    width: 100%;
    height: calc(100% - 8.5vh);
    background-color: white;
    z-index: 4;
}
@media only screen and (min-height: 500.98px) and (orientation: landscape) {
    
}

@media only screen and (min-width: 500.98px) and (orientation: portrait) {

}
</style>