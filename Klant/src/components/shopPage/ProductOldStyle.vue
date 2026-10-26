<template>
	<div class="product ">
        <div class="grid-container">
        <div class="cartoverlay">
           <img class="nix18" v-if="product.nix18" :src="require('@/assets/icons/nix-18.svg')" />
        </div>
        <div class="product-image first"
         @click="state.productModalOpened = !state.productModalOpened">
           <v-lazy-image  class="img-fluid"
             @error="removeProduct()"  
             v-bind:src="`${$imageHost}${product.product_information?.imgurl}` || ''" 
             :intersection-option="() => state.lazyOptions "  
             />
           
            
        </div>
        <div class="information second">
           
            <b class="item-title" v-html="product.product_information?.title || ''" @click="cart.addItemToCart(product, 1)"></b>
            <span class="item-variant" v-html="product.product_information?.variant || ''"></span>
               
            <div class="price-block">
                <FancyPrice 
                    :price="`${product.price}`"
                    class="med"
                    :class="{'discounted':(isDiscounted && cart.calculateDiscountPrice(product) != product.price && 
                (isDiscounted.discount_info.discount_type.min_amount == 1 || isDiscounted.isPercentage == 0))}"
                @click="cart.addItemToCart(product, 1)"
                />
                <FancyPrice 
                    class="discount-price med" 
                    v-if="(isDiscounted && cart.calculateDiscountPrice(product) != product.price && 
                    (isDiscounted.discount_info.discount_type.min_amount == 1 || isDiscounted.isPercentage == 0))" 
                    :price="`${cart.calculateDiscountPrice(product)}`"
                    @click="cart.addItemToCart(product, 1, actieproduct, state.currentVariant)"
                />  
            </div>
            <div class="discount">
                <Actietag  
                v-if="isDiscounted"
                :label="isDiscounted.discount_info.discount_type.discounttype_label" />
            </div>
            <!--<span class="itembrand" v-html="product.product_information.variant"></span>-->            
            <div class="modal-overlay" v-if="state.productModalOpened">
                <ProductModal v-bind:product="product" 
                @closeModal="(callback) => {state.productModalOpened = false;}"/>
            </div>
        </div>
        <div class="add third-long">
            <img class="alert" :src="require('@/assets/icons/alert.png')" v-if="!state.changer"/>
            <button class="deleteProduct" 
                @click="cart.updateItemAmount(product, 0)" 
                v-if="cart.isItemInCart(product) != 0">
                <img :src="require('@/assets/icons/trash-can.svg')" />
            </button>     
            <button class="cartamount" :id="'cartamount-'+product.id" @click="openAmountChanger(product.id)" v-html="cart.isItemInCart(product)"></button>
            <div class="itemamount" :id="'prod-'+product.id">
                <button class="amountchanger no-shadow left" 
                    :disabled="cart.isItemInCart(product) == 0" 
                    @click="cart.updateItemAmount(
                        product, parseInt(cart.isItemInCart(product)) - 1); 
                        resetTimer()">-</button>
                    <input 
                        class="cartamount slider" 
                        onkeypress='return event.charCode >= 48 && event.charCode <= 57' 
                        pattern="\d*" 
                        type="number" 
                        min="0" 
                        step="1" 
                        @focusout="outFocus()" 
                        @blur="outFocus()"
                        @touchleave="outFocus()"
                        @touchcancel="outFocus()"
                        name="input" 
                        v-model="state.amount" />
                <button class="amountchanger no-shadow right" @click="cart.updateItemAmount(product, parseInt(cart.isItemInCart(product)) + 1); resetTimer()">+</button>
            </div>
            <div class="total-price" v-html="`&euro; ${cart.calculatePriceWithDiscounts(shoppingCart[product.id])}`" v-if="state.amount != 0 && cart.isItemInCart(product)"></div>
        </div>     
    </div>
	</div>
</template>

<script setup>
import { reactive, defineProps, onMounted, computed, defineEmits, watch, onBeforeUnmount } from 'vue';
	
import cart from '@/assets/cart'
import ProductModal from '@/components/shopPage/ProductModal.vue'
import {DateTime} from 'luxon'
import { useStore } from 'vuex'
import VLazyImage from "v-lazy-image";
import Actietag from '@/components/Basics/Product/Actietag.vue'
import FancyPrice from '@/components/Basics/Product/FancyPrice.vue'
const store = useStore()

const props = defineProps({
    'product': Object,
    'first':Boolean
})

function outFocus(){
    if(state.amount == 0){
        cart.updateItemAmount(props.product, state.amount)
    }
    else if(state.amount != parseInt(cart.isItemInCart(props.product))){
        cart.updateItemAmount(props.product, state.amount)
    }
    resetTimer()
}

const state = reactive({
    productModalOpened: false,
    amount: 0,
    lazyOptions: {
        rootMargin: '50%',
        threshold: buildThresholdList()
    },
    changer: null,
    seconds_open: 7000,
    closeTimer: null
})

function formatTitle(text){
    if(text) return text.replaceAll('_', ' ')
    return ''
}

function buildThresholdList() {
  let thresholds = [];
  let numSteps = 100;

  for (let i=1.0; i<=numSteps; i++) {
    let ratio = i/numSteps;
    thresholds.push(ratio);
  }

  thresholds.push(0);
  return thresholds;
}
	onMounted(() => {
		state.amount = shoppingCart.value[props.product.id]?.amount || 0
        if(props.first){
            if(props.product.categoryname2){
            store.commit('location/changeAvailableSubDepartment',props.product.categoryname2)
            document.getElementById(`product-${props.product.id}`).insertAdjacentHTML('beforebegin',
            `<div class="sub-title" id="${props.product.categoryname2}">${formatTitle(props.product.categoryname2)}</div>`);
            }
        }
	})

    onBeforeUnmount(() => {
        if(props.first){
            if(props.product.categoryname2){
                if(document.getElementById(`${props.product.categoryname2}`)){
                    document.getElementById(`${props.product.categoryname2}`).remove()
                }
            }
        }
    })

    watch(() => store.getters['shoppingcart/getShoppingCart'], () => {
		state.amount = shoppingCart.value[props.product.id]?.amount || 0
	},{immidiate: true, deep: true})

const shoppingCart = computed(() => store.getters['shoppingcart/getShoppingCart'])

function openAmountChanger(id){
			document.getElementById('prod-'+id).classList.add("opened");
            state.changer = id
            startCloseTimer(id)
		}
        
        function startCloseTimer(id){
			state.closeTimer = setTimeout(() => {
				closeAmountChanger(id)
                state.changer = null
			}, state.seconds_open);
        } 
        function resetTimer() {
            clearTimeout(state.closeTimer);
            startCloseTimer(state.changer);
        }
		
		function closeAmountChanger(id){
            cart.updateItemAmount(props.product, state.amount)
            if(document.getElementById('prod-'+id)){
                document.getElementById('prod-'+id).classList.add("closed");	
                document.getElementById('prod-'+id).classList.remove("opened");		
                setTimeout(() => {
                    document.getElementById('prod-'+id).classList.remove("closed");
                }, 1000);
            }
		}

    const isDiscounted = computed(() => {
        var data = null
        if(Array.isArray(props.product.product_has_discount_list)){
            if(props.product.product_has_discount_list.length > 0)
            props.product.product_has_discount_list.forEach((element) => {
                if(DateTime.fromISO(element.discount_info.starting_date) <= DateTime.now() && DateTime.fromISO(element.discount_info.end_date) >= DateTime.now()){
                    data = element
                }
            });
        }
        return data
    })

    function removeProduct(){
        emit('removeProduct', props.product)
    }

    const emit = defineEmits(['removeProduct'])
    
</script>

<style scoped>
.product{
    position: relative;
    width: 100%;
    background-color: #ffffff;
    border-right: 2px solid #ececec;
    border-bottom: 2px solid #ececec;
}
    .grid-container{
        display: grid;        
        grid-template-columns: repeat(8, calc(100% / 8));
        width: 100%;
    }
    .first{
        grid-column: 1/3;
    }
    .second{        
        grid-column: 3/6;
    }    
    .third{        
        grid-column: 7;
    }
    .fourth{
        grid-column: 8;
    }
    .third-long{
        grid-column: 6/9;
    }

    .discount{
        font-size: 1.3rem;
        max-width: 90%;
        width: fit-content;
        margin-left: auto;    
        grid-column: 3/7;
    }
    

.information{
    display: flex;
    width: calc(100% - 5px);
    height: 100%;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    align-items: flex-start;
    justify-content: space-evenly;
    position: relative;    
    margin-left: 5px;
}
.add .alert{
    position: absolute;
    left: 0;
    top: 0;
    max-height: 45%;
    width: auto;
    display: none;
}
.active.product .add .alert{
	display: block;
}

.active.product .add .deleteProduct{
	visibility: hidden;
}

.item-title{
    width: 90%;
    display: inline-block;
    font-size: 1rem;
    font-weight: 600;
    font-style: italic;
    color: #000000;
    text-align: left;
}
.item-variant{
    width: 90%;
    display: inline-block;
    font-size: 0.9rem;
    font-weight: 300;
    font-style: italic;
    color: #000000;
    text-align: left;
    font-style: italic;
}


.price-block{
    width: 100%;
    display: flex;
    margin-bottom: 5px;
}
.price-block .discount-price{
    padding-left: 5px;
}


.cartoverlay{
    grid-row: 2;
    grid-column: 1/3;
    left: 5px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
}


.cartoverlay .nix18{    
	width: 2.5em;
    height: auto;
}


.modaloverlay{
	position: fixed;
	width: 100vw;
	height: 100vh;
	top: 0;
	left: 0;
	background-color: #99999999;	
	z-index: 100
}
.add{
    margin-top: 10px;
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    justify-items: center;
    padding-right: 5px;
}

    .deleteProduct{
        grid-column: 1;
        grid-row: 1;
        margin: 0;
        padding: unset;
        aspect-ratio: 1;   
        margin-left: auto;
        
        margin-top: 0;
        background-color: var(--base-color-delete);
        border: unset;
        padding: 0px;	
        height: 2rem;
        margin-top: 10px;
        box-shadow: unset;
    }
    .deleteProduct img{
        height: 1.7rem;
    }
    .add > .cartamount{
        grid-column: 2;
        grid-row: 1;
        height: 2.8rem;
        font-size: 1.4rem;  
        border-style: outset;
        text-align: center;
        width: min-content;
        font-weight: 600;
        background-color: var(--base-color) !important;
        margin: 0px 2px 10px 0;
        padding: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: clip;
        aspect-ratio: 1;
    }
    .amounts{
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr) ;
    }


.itemamount.closed{
	position: absolute;
	right: 0;
	opacity: 1;
    width: calc(100% - 5px);
    top: 0px;
	display: flex;
	flex-direction: row;
    align-items: flex-start;
    justify-content: flex-end;
	opacity: 1;
	background-color: #ffffff;
    -webkit-animation: slide-in 1s forwards;
    animation: slide-in 1s forwards;
}

.itemamount.opened{
	position: absolute;
	right:-100%;	
    width: calc(100% - 5px);
    top: 0px;
	display: flex;
	flex-direction: row;
    align-items: center;
    justify-content: flex-end;
	opacity: 0.5;
    -webkit-animation: slide 1s forwards;
    animation: slide 1s forwards;    
}

.itemamount{
	display: none;
}

.itemamount.opened .cartamount{
    max-width: calc(40% - 10px);    
    border: 2px solid #000000;
}

@-webkit-keyframes slide-in {
    100% { 
		right: -100%; 
		opacity: 0.3;
	}
}

@keyframes slide-in {
    100% { 
		right: -100%; 
		opacity: 0.3;		
	}
}

@-webkit-keyframes slide {
    100% { 
		right: 10px; 
		opacity: 1;
	}
}

@keyframes slide {
    100% { 
		right: 10px; 
		opacity: 1;		
	}
}

.total-price{
        grid-column: 1/3;
        grid-row: 2;
        width: 100%;
        margin-top: 5px;
        text-align: center;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .discount{
        margin-top: 5px;
        margin-bottom: 5px;
    }

    
    
@media only screen and (min-height: 500.98px) and (orientation: landscape) {	
    .grid-container{
        grid-template-columns: repeat(6, 1fr);
    }
    .first{
        grid-column: 1/3;
    }
    .second{
        grid-column: 3/5;
    }
    .third-long{        
        grid-column: 5/7;
    }
    .information{
        justify-content: flex-start;
        padding-top: 8px;
    }
    .price,
    .item-title,
    .item-variant
    {        
        font-size: 1.2rem;
    }
    .total-price{
        font-size: 1.3rem;
    }
    .itemamount.opened{
        width: 100%;
        padding-right: 0px;
    }
}

@media only screen and (min-width: 500.98px) and (orientation: portrait) {
    .sub-title{
        grid-column: 1/3;
    }
    .itemamount.opened{
        width: 100%;
        padding-right: 0px;
    }
}

</style>
<style>
.sub-title{
    grid-column: 1/2;
    font-size: 2rem;
    font-weight: 600;
    padding-top: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #ececec;
    text-transform: capitalize;
    width: 100%;
    overflow-wrap: break-word;
}
@media only screen and (min-width: 500.98px) and (orientation: portrait) {
    .sub-title{
        grid-column: 1/3;
    }
}
@media only screen and (min-height: 500.98px) and (orientation: landscape) {
    .sub-title{
        grid-column: 1/3;
    }
}
</style>