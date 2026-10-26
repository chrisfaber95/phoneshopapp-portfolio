<template>
	<div class="product">
        <div class="cartoverlay">
            <!--<div id="amount" class="amountcircle" v-if="cart.isItemInCart(product) > 0" @click="cart.updateItemAmount(product, 0)" v-html="cart.isItemInCart(product)"></div>
            --><img class="nix18" v-if="product.nix18" :src="require('@/assets/icons/nix-18.svg')" />
        </div>
        <div class="product-image">
            <v-lazy-image  
            class="img-fluid product_image"   
            v-bind:src="`${product.product_information?.imgurl}` || ''" 
            :intersection-option="() => state.lazyOptions "/>
           <div class="stamp-amount">
                <!--<img class="backimage" :src="`/img/acties/price_back.png`" />-->
                <img class="front-image" :src="`${$imageHost}/api/back-images/acties/${actieproduct.stamps_cost}-donar-stamp.png`" />
            </div>
        </div>
        <div class="information">
            <!--<div class="stamp-amount" v-html="`${actieproduct.stamps_cost / actie.amount_of_stamps} boekje(s)`">-->
            <span class="price" v-if="actie.price_visible" @click="cart.addItemToCart(product, 1, actieproduct, state.currentVariant)"  v-html="`&euro;${product.price} p.st.`"></span>
            <span class="discount-price" v-if="actie.price_visible" @click="cart.addItemToCart(product, 1, actieproduct, state.currentVariant)"  v-html="`&euro;${parseFloat(parseFloat(product.price) - (parseFloat(product.price) * (parseFloat(actieproduct.discount_percentage) / 100))).toFixed(2)} p.st.`"></span>
            
            <b class="item-title" v-html="product.product_information?.title || ''"></b>
            <div class="options" v-if="productOptions.size > 0">
                <select 
                    v-for="([key, optionTypes], index) in productOptions"
                    v-model="state.currentVariant[index]"
                    :key="`option-variant-${key}`"
                    :style="{backgroundColor: props.actie.maincolor, color: getContrast(props.actie.maincolor)}"
                    >
                    <option v-for="option in optionTypes" :value="option.product_variant_id" :key="option.product_variant_id">{{option.variant_label}}</option>
                </select>
            </div>
            
            <span class="item-variant" v-html="product.product_information?.variant || ''" v-if="productOptions.size == 0"></span>
            <img class="alert" :src="require('@/assets/icons/alert.png')" />
            <div class="prices" v-if="actie.price_visible">
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
            <!--<span class="levertijd" v-html="`Eerste afhaal / verzendmogelijkheid: ${product?.levertijd.label}`"></span>
            <span class="itembrand" v-html="product.product_information.variant"></span>-->            
            <!--base-color<div class="modal-overlay" v-if="state.productModalOpened">
                <ProductModal v-bind:product="product" 
                @closeModal="(callback) => {state.productModalOpened = false;}"/>
            </div>-->
        </div>
        <div class="add" v-if="loggedIn">            
            <div class="total-price" v-html="`&euro; ${cart.calculatePriceWithDiscounts(shoppingCart[product.id]).toFixed(2)}`" v-if="state.amount != 0 && actie.price_visible"></div>
            <button class="cartamount" 
                :id="'cartamount-'+product.id" 
                @click="openAmountChanger(product.id)" 
                v-html="cart.isItemInCart(product)" 
                v-if="productOptions.size == 0"></button>
                <button class="cartamount" 
                    @click="cart.addItemToCart(product, 1, actieproduct, state.currentVariant)"
                    v-if="productOptions.size != 0">
                    <img :src="require('@/assets/icons/product-in.svg')" />
                </button>
            <div class="itemamount" :id="'prod-'+product.id" v-if="productOptions.size == 0">
                <button class="amountchanger no-shadow left" :disabled="cart.isItemInCart(product) == 0" @click="cart.updateItemAmount(product, parseInt(cart.isItemInCart(product)) - 1, actieproduct, state.currentVariant); resetTimer()">-</button>
                    <input 
                        class="cartamount slider" 
                        onkeypress='return event.charCode >= 48 && event.charCode <= 57' 
                        pattern="\d*" 
                        type="number" 
                        min="0" 
                        step="1" 
                        @focusout="cart.updateItemAmount(product, parseInt(cart.isItemInCart(product)) || 0, actieproduct, state.currentVariant)" 
                        @blur="cart.updateItemAmount(product, parseInt(cart.isItemInCart(product)) || 0, actieproduct, state.currentVariant)"
                        @touchleave="cart.updateItemAmount(product, parseInt(cart.isItemInCart(product)) || 0, actieproduct, state.currentVariant)"
                        @touchcancel="cart.updateItemAmount(product, parseInt(cart.isItemInCart(product)) || 0, actieproduct, state.currentVariant)"
                        name="input" 
                        v-model="state.amount" />
                <button class="amountchanger no-shadow right" @click="cart.updateItemAmount(product, parseInt(cart.isItemInCart(product)) + 1, actieproduct, state.currentVariant); resetTimer()">+</button>                
            </div>
            <button class="deleteProduct" 
                @click="cart.updateItemAmount(product, 0, state.currentVariant)" 
                v-if="cart.isItemInCart(product) != 0">
                <img :src="require('@/assets/icons/trash-can.svg')" />
            </button>
            <!--<div class="buttons amounts">
                <button class="addProduct" @click="cart.addItemToCart(product, 1)" v-html="`+`"></button>
                <button class="deleteProduct" v-if="cart.isItemInCart(product) > 0" @click="cart.updateItemAmount(product, 0)" v-html="`x`"></button>
            </div>-->
        </div>
	</div>
</template>

<script setup>
import { reactive, defineProps, onMounted, computed, defineEmits, watch } from 'vue';
	
import cart from '@/assets/actiecart'
import { useStore } from 'vuex'
import VLazyImage from "v-lazy-image";
import FancyPrice from '@/components/Basics/Product/FancyPrice.vue'
const store = useStore()

const props = defineProps({
    'product': Object,
    'actieproduct': Object,
    'actie': Object
})

const state = reactive({
    productModalOpened: false,
    amount: 0,
    variants: [],
    currentVariant: [],
    lazyOptions: {
        rootMargin: '50%',
        threshold: buildThresholdList()
    },
    first_sub: null,
    seconds_open: 7000,
    changer: null
    
})


function getContrast(hexcolor){

	// If a leading # is provided, remove it
	if (hexcolor.slice(0, 1) === '#') {
		hexcolor = hexcolor.slice(1);
	}

	// Convert to RGB value
	var r = parseInt(hexcolor.substr(0,2),16);
	var g = parseInt(hexcolor.substr(2,2),16);
	var b = parseInt(hexcolor.substr(4,2),16);

	// Get YIQ ratio
	var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

	// Check contrast
	return (yiq >= 128) ? '#000000' : '#ffffff';

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
        if(productOptions.value){
            var id = 0
            for(var value of productOptions.value) {
                if(value[1]) {state.currentVariant[id] = value[1][0].product_variant_id}
                id = id+1
            }
        }
	})

    watch(() => store.getters['actiecart/getActieShoppingCart'], (newVal, oldVal) => {
		state.amount = shoppingCart.value[props.product.id]?.amount || 0
	},{immidiate: true, deep: true})
    
    watch(() => props.product, (newVal, oldVal) => {
        if(newVal){

            for(var i in newVal){
                state.currentVariant[i] = newVal.value[0]
            }
            state.currentVariant = []
        }
	},{immidiate: true, deep: true})

    const shoppingCart = computed(() => store.getters['actiecart/getActieShoppingCart'])

    const productOptions = computed(() => {        
        var prod = props.product
        if(prod.variant_list){
            const grouped = prod.variant_list.reduce(
                (entryMap, e) => {
                    if (e.stock_override !== 1) {
                        entryMap.set(e.variant_group, [...entryMap.get(e.variant_group)||[], e])
                    }
                    return entryMap
                },
                new Map()
            );
            return grouped
        }
        else{
            return new Map()
        }
    })
    
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
            cart.updateItemAmount(props.product, state.amount, props.actieproduct, state.currentVariantt)
            
            if(document.getElementById('prod-'+id)){
			document.getElementById('prod-'+id).classList.add("closed");	
			document.getElementById('prod-'+id).classList.remove("opened");		
                setTimeout(() => {
				document.getElementById('prod-'+id).classList.remove("closed");
                }, 1000);
            }
        }
			
    
        defineEmits(['removeProduct']);
    const loggedIn = computed(() => {
		return store.getters['shopsettings/getLoggedIn']
	})
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

.product_image{
    aspect-ratio: 4/3;
    object-fit: contain;
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

.information .options{
    width: 80%;
    max-width: 80%;
}

.information .options select{
    width: 100%;
    font-size: 1.2rem;
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
.cartoverlay .icon{
	width: 2.215em;
	height: 1.4em;
}
.cartoverlay .amountcircle{
    border-radius: 50%;
    min-width: 20px;
	aspect-ratio: 1;
    background: #f00;
    border: 2px solid #f00;
    color: #ffffff;
    text-align: center;
    font-size: 0.9rem;	
    line-height: normal;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cartoverlay .nix18{    
	width: 2em;
    height: auto;
}
.cartoverlay .amountcircle p{
	margin: unset;
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
.cartamount img{
    height: 2rem;
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
.itemamount.opened .cartamount{
	max-width: 25%;
}
.itemamount.closed .cartamount{
	max-width: 25%;
}
.itemamount.opened .cartamount{
    max-width: calc(40% - 10px);
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