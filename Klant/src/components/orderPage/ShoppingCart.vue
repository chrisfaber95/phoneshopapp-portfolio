<template>
	<div class="shopping-cart">
        <div class="grid-container" v-for="item in shoppingCart" v-bind:key="item.id">
            <div class="grid-item first"
                @click="state.productModalOpened = item.product;">
                <img :src="item.product.product_information.imgurl || ''">
            </div>
            <div class="modal-overlay" v-if="state.productModalOpened">
                <ProductModal :product="state.productModalOpened" :discount="ïsDiscounted"
                @closeModal="(callback) => {state.productModalOpened = null;}"/>
            </div>
            <div class="grid-item second product-information">
                <div class="price-block">
                    <FancyPrice 
                        :price="`${item.product.price}`"
                        class="small"
                        :class="{'discounted':(cart.isDiscounted(item.product) && cart.calculateDiscountPrice(item.product) != item.product.price && 
                    (cart.isDiscounted(item.product)?.discount_info.discount_type.min_amount == 1 || cart.isDiscounted(item.product)?.isPercentage == 0))}"
                    @click="cart.addItemToCart(item.product, 1)"
                    />
                    <FancyPrice 
                        class="discount-price small" 
                        v-if="(cart.isDiscounted(item.product) && 
                        (cart.isDiscounted(item.product).discount_info.discount_type.min_amount == 1 || cart.isDiscounted(item.product).isPercentage == 0))" 
                        :price="`${cart.calculateDiscountPrice(item.product)}`"
                        @click="cart.addItemToCart(item.product, 1, actieproduct, state.currentVariant)"  
                    />  
                </div>
                <Actietag  
						v-if="cart.isDiscounted(item.product)"
						:label="cart.isDiscounted(item.product).discount_info.discount_type.discounttype_label" />		
                <p v-html="`${item.product.product_information.title}`"></p>
                <i v-html="`${item.product.product_information.variant || ''}`"></i>
                <i v-if="item.product.statiegeld && item.product.statiegeld != '0.00'" v-html="`&euro;${item.product.statiegeld} statiegeld`"></i>
            </div>
            <div class="grid-item third-long amounts">
                <input class="aantalInput" onkeypress='return event.charCode >= 48 && event.charCode <= 57' pattern="\d*" type="number" min="0" step="1" @blur="cart.updateItemAmount(item.product, parseInt(item.amount))" name="input" v-model="item.amount" />
                <button class="deleteProduct" 
                    @click="cart.updateItemAmount(item.product, 0)" >
                    <img :src="require('@/assets/icons/trash-can.svg')" />
                </button>  
                <!--<div class="total-price" v-html="`&euro; ${cart.calculateDiscountPrice(item).toFixed(2)}`"></div>-->
                <div class="total-price">
                    <p class="price" :class="{'discounted':cart.isDiscounted(item.product)}" v-html="`&euro;${(+item.product.price * +item.amount).toFixed(2)}`"></p>
                    <p class="discount-price" v-if="cart.isDiscounted(item.product)" v-html="`&euro;${cart.calculateProductPriceWithDiscount(item)}`"></p>
                </div>	
            </div>
        </div>
        <div class="grid-container" v-if="state.koopzegels">
            <div class="grid-item first">
                <img :src=" `${state.publicPath}img/coopkoopzegel.png`" />
            </div>
            <div class="grid-item second product-information">
                <span>Koopzegels</span>
                <i v-html="`Maximaal: ${maxZegels}`"></i>
            </div>
            <div class="grid-item third-long amounts">
                <input class="aantalInput" pattern="\d*" type="number" min="0" :max="maxZegels" step="1" name="input" v-model="state.koopzegelsAmount" @change="validateZegels()"/>				
                <button class="deleteProduct" 
                    @click="state.koopzegelsAmount = 0">
                    <img :src="require('@/assets/icons/trash-can.svg')" />
                </button>  
                <div class="total-price" v-html="`&euro; ${(+state.koopzegelsAmount * +state.koopzegelsPrice).toFixed(2)}`"></div>
            </div>
        </div>
        <div class="grid-container fat">
            <div class="grid-item second">
                <span>Statiegeld: </span>
            </div>
            <div class="grid-item third-long">
                <span v-html="`&euro; ${(+cart.calculateDeposit()).toFixed(2)}`"></span>
            </div>
        </div>
        <div class="grid-container fat">
            <div class="grid-item second">
                <span>BTW: </span>
            </div>
            <div class="grid-item third-long">
                <span v-html="`&euro; ${(+cart.calculateVAT()).toFixed(2)}`"></span>
            </div>
        </div>
        <div class="grid-container fat">
            <div class="grid-item second">
                <span>Totaal: </span>
            </div>
            <div class="grid-item third-long">
                <span>&euro; {{(+cart.calculateTotalPrice() + +state.koopzegelsAmount * +0.05).toFixed(2)}}</span>
            </div>
        </div>        
	</div>
</template>
<script setup>
import { reactive, computed, watch, onMounted } from 'vue';
import cart from '@/assets/cart'
import { useStore } from 'vuex'
import ProductModal from '@/components/shopPage/ProductModal.vue'
import Actietag from '@/components/Basics/Product/Actietag.vue';
import FancyPrice from '@/components/Basics/Product/FancyPrice.vue'
const store = useStore()

	const state = reactive({
        koopzegels: true,
        koopzegelsGap: 0.5,
        koopzegelsPrice: 0.05,
        koopzegelsAmount: 0,
        publicPath: process.env.BASE_URL,
        productModalOpened: null
	})

    function validateZegels(){
        state.koopzegelsAmount = cart.validateZegels(state.koopzegelsAmount, maxZegels.value)
        store.commit('shoppingcart/updateKoopzegelAmount', state.koopzegelsAmount)
    }

	const shoppingCart = computed(() => store.getters['shoppingcart/getShoppingCart'])
	
    const maxZegels = computed(() => {return cart.calculateZegels(state.koopzegelsGap, state.koopzegels)})

    watch(() => maxZegels.value, (newVal) => {
		if(state.koopzegelsAmount > newVal) state.koopzegelsAmount = newVal
	})

    onMounted(() => {
        if(userinfo.value?.customer_settings?.standard_storestamps === true){
            state.koopzegelsAmount = maxZegels.value
        }
    })

    
	const userinfo = computed(() => {	
		return store.getters['shopsettings/getUserinfo']
	}, {immediate: true, deep: true})


</script>
<style scoped>
.shopping-cart{
    border-bottom: 3px solid #ececec;
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
        grid-column: 3/7;
        padding-left: 3px;
        text-align: left;
    }    
    .third{        
        grid-column: 7;
    }
    .fourth{
        grid-column: 8;
    }
    .third-long{
        grid-column: 7/9;
        padding-left: 3px;
        text-align: left;
    }
    .product-information{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        flex-wrap: wrap;
        justify-content: flex-start;
    }
    .product-information p{        
        text-align: left;
        margin: 4px 0px;
        font-weight: 600;
    }

    .product-information i{        
        font-size: 0.9rem;
    }

    .aantalInput{
        border-style: outset;
        text-align: center;
        width: 100%;
        font-weight: 600;
        background-color: var(--base-color) !important;
        margin: 10px 2px 10px 0;
        padding: 0;
        grid-column: 1;
        grid-row: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: clip;
        aspect-ratio: 1;        
    }
    .deleteProduct{
        margin-top: 0;
        grid-column: 2;
        grid-row: 1;
        background-color: var(--base-color-delete);        
        border: 2px solid #ededed;
        padding: 5px;
        margin: 10px 5px;

        margin-top: 0;
        background-color: var(--base-color-delete);
        border: unset;
        padding: 0px;	
        height: 2rem;
        margin-top: 10px;
        box-shadow: unset;
    }
    .deleteProduct img{
        width: 100%;
        height: 100%;
    }
    .deleteProduct:hover, .deleteProduct:focus, .deleteProduct:active{
        color: #000000;
    }
    .amounts{
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr) ;
    }

    .total-price{
        grid-column: 1/3;
        grid-row: 2;
        width: 100%;
        margin-top: 5px;
        text-align: left;
        font-size: 1.4rem;
        font-weight: 600;
    }
    .total-price > p {
        margin: unset;        
        direction: rtl;
    }
    .price-block{
        width: 100%;
        display: flex;
        margin-bottom: 5px;
    }
    .price-block .discount-price{
        padding-left: 5px;
    }

    .total-price .discounted{
        font-size: 1.2rem;
        text-decoration: line-through;
        font-weight: 600;
        color: #717171 !important;
    }

    .total-price .discount-price{
        color: #f00;
    }

    .grid-container.fat{
        font-size: 1.3rem;
        font-weight: 600;
    }

@media only screen and (min-height: 500.98px) and (orientation: landscape) {
    .aantalInput{
        padding-top: 5px;
        padding-bottom: 5px;
        font-size: 1.7rem;
    }
}
   
@media only screen and (min-width: 500.98px) and (orientation: portrait) {
    .aantalInput{
        padding-top: 5px;
        padding-bottom: 5px;
        font-size: 1.7rem;
    }
}
</style>
