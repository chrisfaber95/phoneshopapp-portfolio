<template>
	<div class="product">
        <div class="first-sub" v-if="state.first_sub" :id="state.first_sub"></div>
        <div class="cartoverlay">
            <!--<div id="amount" class="amountcircle" v-if="cart.isItemInCart(product) > 0" @click="cart.updateItemAmount(product, 0)" v-html="cart.isItemInCart(product)"></div>
            --><img class="nix18" v-if="product.nix18" :src="require('@/assets/icons/nix-18.svg')" />
            
        </div>
        <div class="product-image"   @click="state.productModalOpened = !state.productModalOpened">
           <!-- <img class="img-fluid" v-bind:src="product.product_information.imgurl"  @click="state.productModalOpened = !state.productModalOpened"/>-->
            <v-lazy-image  
            class="img-fluid" 
            @error="removeProduct()"  
            v-bind:src="`${$imageHost}${product.product_information?.imgurl}` || ''" 
            :intersection-option="() => state.lazyOptions "/>
           
        </div>
        <Actietag  
            v-if="isDiscounted"
            :label="isDiscounted.discount_info.discount_type.discounttype_label" />
        <div class="information">
            <!--<span class="price" 
            :class="{'discounted':(isDiscounted && cart.calculateDiscountPrice(product) != product.price)}" 
            @click="cart.addItemToCart(product, 1)"  v-html="`&euro;${product.price} p.st.`"></span>-->
            
            <b class="item-title" v-html="product.product_information?.title || ''" @click="cart.addItemToCart(product, 1)"></b>
            <span class="item-variant" v-html="product.product_information?.variant || ''"></span>
            <img class="alert" :src="require('@/assets/icons/alert.png')" />            
            <div class="prices">
                <FancyPrice 
                    :price="`${product.price}`"
                    :class="{'discounted':(isDiscounted && cart.calculateDiscountPrice(product) != product.price)}" 
                    @click="cart.addItemToCart(product, 1)"
                />
                <FancyPrice 
                    class="discount-price" 
                    v-if="(isDiscounted && cart.calculateDiscountPrice(product) != product.price)"
                    :price="`${cart.calculateDiscountPrice(product)}`"
                    @click="cart.addItemToCart(product, 1, actieproduct, state.currentVariant)" 
                /> 
            </div>
             
            <!--<span class="itembrand" v-html="product.product_information.variant"></span>-->            
            <div class="modal-overlay" v-if="state.productModalOpened">
                <ProductModal v-bind:product="product" 
                @closeModal="(callback) => {state.productModalOpened = false;}"/>
            </div>
        </div>
        <div class="add">                           
            <div class="total-price" v-html="`&euro; ${cart.calculatePriceWithDiscounts(shoppingCart[product.id])}`" v-if="state.amount != 0 && cart.isItemInCart(product)"></div>
            <button class="deleteProduct" 
                @click="cart.updateItemAmount(product, 0)" 
                v-if="cart.isItemInCart(product) != 0">
                <img :src="require('@/assets/icons/trash-can.svg')" />
            </button>  
            <button class="cartamount" :id="'cartamount-'+product.id" @click="openAmountChanger(product.id)" v-html="cart.isItemInCart(product)"></button>
            <div class="itemamount" :id="'prod-'+product.id">
                <button class="amountchanger no-shadow left" :disabled="cart.isItemInCart(product) == 0" @click="cart.updateItemAmount(product, parseInt(cart.isItemInCart(product)) - 1); resetTimer()">-</button>
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
            <!--<div class="buttons amounts">
                <button class="addProduct" @click="cart.addItemToCart(product, 1)" v-html="`+`"></button>
                <button class="deleteProduct" v-if="cart.isItemInCart(product) > 0" @click="cart.updateItemAmount(product, 0)" v-html="`x`"></button>
            </div>-->
        </div>
	</div>
</template>

<script setup>
import { reactive, defineProps, onMounted, computed, defineEmits, watch } from 'vue';
	
import cart from '@/assets/groceryList'
import ProductModal from '@/components/listPage/ProductModal.vue'
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

const state = reactive({
    productModalOpened: false,
    amount: 0,
    lazyOptions: {
        rootMargin: '50%',
        threshold: buildThresholdList()
    },
    first_sub: null,
    seconds_open: 7000,
    changer: null
    
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
                state.first_sub = props.product.categoryname2
            }
        }

	})

    
	

    watch(() => store.getters['grocerylist/getGroceryList'], (newVal, oldVal) => {
		state.amount = shoppingCart.value[props.product.id]?.amount || 0
	},{immidiate: true, deep: true})

const shoppingCart = computed(() => store.getters['grocerylist/getGroceryList'])
		
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
    display: flex;
    border-bottom: 1px solid #ececec;
    flex-direction: column;
    border-right: 1px solid #ececec;
    min-width: 0px;
}
.first-sub{
    height: 0px;
    visibility: hidden;
}
    .grid-container{
        display: grid;        
        grid-template-columns: repeat(8, 1fr);
        /*grid-auto-rows: minmax(100px, auto);*/
        border-bottom: 1px solid #ececec;
    }
    .first{
        grid-column: 1/3;
    }
    .second{        
        grid-column: 3/7;
    }    
    .third{        
        grid-column: 7;
    }
    .fourth{
        grid-column: 8;
    }
    .third-long{
        grid-column: 7/9;
    }
.background{
    position: absolute;
    bottom: 0;
    z-index: 3;
}
.background img{
    width: 100%;
    height: auto;
    z-index: 2;
    transform: scaleY(1.4) translateY(0px) translateX(-3px);
}
.information{
    display: flex;
    width: 96%;
    height: 100%;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: flex-start;
    align-items: flex-start;
    justify-content: space-evenly;
    padding-left: 5px;
    margin-left: auto;
    margin-right: auto;
}
.information > img{
    max-width: 100%;
    height: 100%;
    position: relative;
    display: block;
    margin-left: 3%;
    margin-right: auto;
}
.information .alert{
    position: absolute;
    right: 0;
    top: 60%;
    max-width: 30%;
    height: auto;
    display: none;
}

.prices{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: flex-start;
}
.active.product .information .alert{
	display: block;
}

.product-line{   
	position: absolute;
    height: 50%;
    bottom: 25%;
    border-right: 4px solid grey;
    margin-left: -5px;
    -webkit-box-shadow: 5px 0px #888888;
    box-shadow: 1px 0px #888888;
    box-shadow: 2px -5px #c1c1c1;
    display: none;
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

.cartoverlay{
	position: absolute;
    color: red;
    top: 0;
    left: 5px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    width: 90%;
}


.cartoverlay .nix18{    
	width: 2em;
    height: auto;
}


.add{
    margin-top: 10px;
    position: relative;
    display: flex;
    align-content: center;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    flex-wrap: nowrap;
    padding-left: 5px;
    padding-right: 5px;
}

    .deleteProduct{
        margin-top: 0;
        grid-column: 1;
        grid-row: 1;
        width: fit-content;
        padding-top: 5px;
        margin-top: -5px;
        margin-right: 5px;
        
        margin-top: 0;
        background-color: var(--base-color-delete);
        border: unset;
        padding: 0px;	
        height: 2rem;
        margin-top: 10px;
        box-shadow: unset;
        max-width: 30%;
    }

    .deleteProduct img{
        width: 65%;
    }
    .addProduct{        
        border-style: outset;
        text-align: center;
        width: 90%;
        font-weight: 600;
        background-color: var(--base-color)!important;
        margin: 10px 2px 10px 0;
        padding: 0;
        grid-column: 1;
        grid-row: 1;
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


    .cartamount{
    border-style: outset;
	text-align: center;
	max-width:50%;
	font-weight: 600;
	background-color: var(--base-color) !important;
	margin: 0 0 10px 0;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    box-shadow: unset;
}

.add > .cartamount{
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



.add .itemamount > .cartamount{
    border-style: outset;
	text-align: center;
	max-width:50%;
	font-weight: 600;
	background-color: #ffffff !important;
    margin: unset;
    padding: unset;
    padding-left: 5px;
    padding-right: 5px;
    height: 2.8rem;
    font-size: 1.6rem;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    border-radius: 0;
    box-shadow: unset;
    aspect-ratio: 1;
}


.itemamount.closed{
	position: absolute;
	left: 0;
	opacity: 1;
	width: 100%;
    top: 0px;
	display: flex;
	flex-direction: row;
    justify-content: space-evenly;
    align-items: stretch;
	opacity: 1;
	background-color: #ffffff;
    -webkit-animation: slide-in 1s forwards;
    animation: slide-in 1s forwards;
}
.itemamount.opened{
	position: absolute;
    left: 0;
    width: 98%;
    top: 0px;
	display: flex;
	flex-direction: row;
    justify-content: space-evenly;
    align-items: stretch;
	opacity: 0.5;
	background-color: #ffffff;
    -webkit-animation: slide 1s forwards;
    animation: slide 1s forwards;
    box-shadow: 0px 2px 3px 2px #00000066;
    border-radius: 5px;
}
@-webkit-keyframes slide-in {
    100% { 
		opacity: 0.5;
	}
}

@keyframes slide-in {
    100% { 
		opacity: 0.5;		
	}
}

@-webkit-keyframes slide {
    100% { 
		opacity: 1;
	}
}

@keyframes slide {
    100% { 
		opacity: 1;		
	}
}

.itemamount{
	display: none;
}

.deleteProduct{
	margin-top: 0;
	background-color: unset;
    border: unset;
    box-shadow: unset;
}

.itemamount .cartamount{
    width: calc(40% - 10px);
    border: 2px solid #000000;
}


.total-price{
        grid-column: 1/3;
        grid-row: 2;
        margin-top: 5px;
        text-align: left;
        font-size: 1rem;
        font-weight: 600;
    }
    .product-image{
        width: 85%;
        display: inline-block;
        align-self: center;
    }

    .actietag{
        position: relative;
        height: fit-content;
        max-width: 70%;
        margin-top: 10px;
        margin-bottom: 10px;
    }
    .actietag .pricetag{
        position: absolute;
        z-index: 9;
        width: 100%;
        left: 0;
        top: 0;
        height: 100%;
    }
    .actietag span{
        max-width: 100%;
        white-space: break-spaces;
        z-index: 10;
        font-size: 1.2rem;
        position: relative;
        color: white;
        margin-top: 20px;
        line-height: 2.5rem;
        padding-left: 5px;
        padding-right: 25px;
    }

    
    @media only screen and (min-width: 500.98px) and (orientation: portrait) {
        .deleteProduct{
            height: 3rem;
            margin-right: 5px;
        }
        .deleteProduct img{
            width: 100%;
            height: 100%;
        }
    }
    @media only screen and (min-height: 500.98px) and (orientation: landscape) {
        .deleteProduct{
            height: 3rem;
            margin-right: 5px;
        }
        .deleteProduct img{
            width: 100%;
            height: 100%;
        }
    }
</style>