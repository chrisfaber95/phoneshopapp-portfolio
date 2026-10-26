<template>
	<div class="shopping-cart">
        <div class="grid-container" v-for="item in shoppingCart" v-bind:key="item.id">
            <div class="grid-item first">
                <img :src="item.prod.product.product_information.imgurl">
            </div>
            <div class="grid-item second product-information">
                <div class="stamp-amount" v-html="`${item.prod.actieproduct.stamps_cost / actie?.amount_of_stamps || 9999} boekje(s)`"></div>
                <span  class="price" v-if="actie?.price_visible || false" @click="cart.addItemToCart(item.prod.product, 1, item.prod.actieproduct)"  v-html="`&euro;${item.prod.product.price} p.st.`"></span>
                <span class="discount-price" v-if="actie?.price_visible || false" @click="cart.addItemToCart(item.prod.product, 1, item.prod.actieproduct)"  v-html="`&euro;${parseFloat(parseFloat(product.price) - (parseFloat(product.price) * (parseFloat(actieproduct.discount_percentage) / 100))).toFixed(2)} p.st.`"></span>
                <p v-html="`${item.prod.product.product_information.title}`"></p>
                <div class="variants" v-if="item.variant">
                    <div class="option" v-for="option in item.variant" :key="`${item.prod.product.id}-${option}`">
                        <span class="variant" v-html="getVariant(item, option)[0].variant_label"  :key="`${item.prod.product.id}-${option}`"></span>
                    </div>
                </div>
                <span class="variant" v-html="item.prod.product.product_information.variant" v-if="!item.variant"></span>
                <i v-if="item.prod.product.statiegeld && item.prod.product.statiegeld != '0.00'" v-html="`&euro;${item.prod.product.statiegeld} statiegeld`"></i>
            </div>
            <div class="grid-item third-long amounts" v-if="!item.variant">
                <input 
                    class="aantalInput" 
                    onkeypress='return event.charCode >= 48 && event.charCode <= 57' 
                    pattern="\d*" 
                    type="number" 
                    min="0" 
                    step="1" 
                    @blur="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount), item.prod.actieproduct)" 
                    @touchleave="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount), item.prod.actieproduct)" 
                    @touchcancel="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount), item.prod.actieproduct)" 
                    name="input" 
                    v-model="item.prod.amount" />
                <button class="deleteProduct" @click="cart.updateItemAmount(item.prod.product, 0)">
                    <img :src="require('@/assets/icons/trash-can.svg')" /></button>
                <div class="total-price"  v-if="actie?.price_visible || false" v-html="`&euro; ${cart.calculatePriceWithDiscounts(item.prod).toFixed(2)}`"></div>
                <div class="total-price"  v-html="`${item.prod.actieproduct.stamps_cost * item.prod.amount} zegels`"></div>
            </div>
            
            <div class="grid-item third-long amounts" v-if="item.variant">
                <!--<input class="aantalInput" onkeypress='return event.charCode >= 48 && event.charCode <= 57' pattern="\d*" type="number" min="0" step="1" @blur="cart.updateItemAmount(item.product, parseInt(item.amount), item.actieproduct)" name="input" v-model="item.amount" />-->
                <button class="deleteProduct" @click="cart.deleteProductVariant(item.prod.product, item.prod.amount, item.prod.actieproduct, item.variant, item.prod.variant)">
                    <img :src="require('@/assets/icons/trash-can.svg')" /></button>
			    <div class="total-price"  v-if="actie?.price_visible || false" v-html="`&euro; ${cart.calculatePriceWithDiscounts(item).toFixed(2)}`"></div>
                <div class="total-price"  v-html="`${item.prod.actieproduct.stamps_cost} zegels`"></div>
            </div>

            		
        </div>
        <div class="grid-container" v-if="actie?.price_visible || false">
            <div class="grid-item second">
                <span>Totaal: </span>
            </div>
            <div class="grid-item third-long">
                <span>&euro; {{parseFloat(cart.calculateTotalPrice()).toFixed(2)}}</span>
            </div>
        </div>
        <div class="grid-container">
            <div class="grid-item second">
                <span>Totaal aantal zegels: </span>
            </div>
            <div class="grid-item third-long">
                <span>{{cart.calculateStampPrice()}}</span>
            </div>
        </div>
        
        <div class="grid-container" v-if="actie?.price_visible || false">
            <div class="grid-item second">
                <span>BTW: </span>
            </div>
            <div class="grid-item third-long">
                <span v-html="`&euro; ${cart.calculateVAT()}`"></span>
            </div>
        </div>
        <div class="grid-container">
            <div class="grid-item second">
                <span>Statiegeld: </span>
            </div>
            <div class="grid-item third-long">
                <span v-html="`&euro; ${cart.calculateDeposit()}`"></span>
            </div>
        </div>
	</div>
</template>
<script setup>
import { onMounted, computed } from 'vue';
import cart from '@/assets/actiecart'
import { useStore } from 'vuex'
const store = useStore()



    onMounted(() => {
	//	if(!actie.value) router.push('/spaaracties')
	})


	

    const actie = computed(() => {	
		return store.getters['location/getActie']
	}, {immediate: true, deep: true})

 
	function getVariant(item, vari){
		const result = item.prod.product.variant_list.filter(word => word.product_variant_id == vari)
		return result
	}

    const shoppingCart = computed(() => {
		var cart = []
		for(var item in store.getters['actiecart/getActieShoppingCart']){
			if(store.getters['actiecart/getActieShoppingCart'][item].variant){
				for(var variant in store.getters['actiecart/getActieShoppingCart'][item].variant){
					cart.push({prod: store.getters['actiecart/getActieShoppingCart'][item], variant: store.getters['actiecart/getActieShoppingCart'][item].variant[variant]})
				}
			}
			else{
				cart.push({prod: store.getters['actiecart/getActieShoppingCart'][item], variant: null})
			}
		}
		return cart
		
	}, {immediate: true, deep: true})
</script>
<style scoped>
    .grid-container{
        display: grid;        
        grid-template-columns: repeat(8, 1fr);
        gap: 5px;
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
        width: 90%;
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
        aspect-ratio: 1;       
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
        font-size: 1.1rem;
        font-weight: 600;
    }
    .total-price > p {
        margin: unset;
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
