<template>
	<div class="product">	
		<div class="info">
			<div class="search-img" @click="openModal()">       
				<div class="cartoverlay">
					<img class="nix18" v-if="product.nix18" :src="require('@/assets/icons/nix-18.svg')" />
				</div>
                <v-lazy-image 
                    class="img-fluid" 
                    @error="removeProduct()" 
                    v-bind:src="`${$imageHost}${product.product_information?.imgurl}` || ''" 
                    :intersection-option="state.lazyOptions " />
			</div>
			<div class="information">
				<span class="title" >{{product.product_information.title}}</span>
				<span class="variant" v-html="product.product_information.variant"></span>			
				<div class="amountoverlay" v-if="cart.isItemInCart(product)">
					<p v-if="cart.isItemInCart(product)" @click="cart.updateItemAmount(product, 0)">Aantal: {{cart.isItemInCart(product)}}</p>
				</div>
				<div class="price-block">
				<FancyPrice
					:price="`${product.price}`"
					:class="{'discounted':(isDiscounted && cart.calculateDiscountPrice(product) != product.price && 
						(isDiscounted.discount_info.discount_type.min_amount == 1 || isDiscounted.isPercentage == 0))}"
						@click="cart.addItemToCart(product, 1)"
				/>
				<FancyPrice 
					class="discount-price" 
					v-if="(isDiscounted && cart.calculateDiscountPrice(product) != product.price && 
							(isDiscounted.discount_info.discount_type.min_amount == 1 || isDiscounted.isPercentage == 0))" 
					:price="`${cart.calculateDiscountPrice(product)}`"
					@click="cart.addItemToCart(product, 1, actieproduct, state.currentVariant)" 
				/>
				</div>
				<div class="discount-block">

					<div class="discount">
						<Actietag  
						v-if="isDiscounted"
						:label="isDiscounted.discount_info.discount_type.discounttype_label" />
					</div>
					<i class="geldig" v-if="isDiscounted" v-html="`Geldig van ${formatDate(isDiscounted?.discount_info.starting_date)}<br>tot ${formatDate(isDiscounted?.discount_info.end_date)}`"></i>
					
				</div>
			</div>			
		</div>		
		<div class="buttons">
			<button class="goto left-shadow" @click="goToProduct(product)">Ga naar product</button>
			<button size="sm" @click="cart.addItemToCart(product, 1)">				    
				<div class="cartoverlay">
					<div id="amount" 
						class="amountcircle" 
						v-if="cart.isItemInCart(product) > 0" 
						v-html="cart.isItemInCart(product)"></div>
				</div>
				Voeg toe
			</button>
		</div>				
		<hr>	
		<div class="modal-overlay" v-if="state.productModalOpened">
            <ProductModal v-bind:product="product" 
            @closeModal="(callback) => {state.productModalOpened = false;}"/>
        </div>			
	</div>
</template>

<script setup>
import { reactive, defineProps, computed, defineEmits } from 'vue';
import {DateTime} from 'luxon'
import cart from '@/assets/cart'
import ProductModal from '@/components/shopPage/ProductModal.vue' 
import Actietag from '@/components/Basics/Product/Actietag.vue'
import FancyPrice from '@/components/Basics/Product/FancyPrice.vue'
import VLazyImage from "v-lazy-image";

import { useStore } from 'vuex'
const store = useStore()

	const props = defineProps({
		'product': Object
	})

	const state = reactive({
		productModalOpened: false,
    lazyOptions: {
        rootMargin: '100%',
        threshold: buildThresholdList()
    }
	})
	function buildThresholdList() {
  let thresholds = [];
  let numSteps = 200;

  for (let i=1.0; i<=numSteps; i++) {
    let ratio = i/numSteps;
    thresholds.push(ratio);
  }

  thresholds.push(0);
  return thresholds;
}

	async function openModal(){
		var nix18 = true;
        if(props.product.nix18 == true){            
            nix18 = await cart.checkNix18(props.product, 'modal');
        }
        if(nix18 === true){
			state.productModalOpened = true
		}
		else{
			state.productModalOpened = false
		}

	}

	

	function formatDate(date){
		if(date){
			const parts = date.split('-');
			const formattedDate = parts.reverse().join('\u200B-');
			return formattedDate 
		}
		else {
			return ''
		}
	}
	
	function changeActiveDepartment(department){
        store.commit('location/changeSubDepartment', null)
		store.commit('location/changeDepartment', department)
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

	

	function goToProduct(product){
		changeActiveDepartment(product.department)

		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

		var observer = new MutationObserver(function(mutations) {
			var loaded = false
			mutations.forEach(() => {
				var someDiv = document.getElementById(`product-${product.id}`)
				if (someDiv) {
					loaded = true
				}
			});
			if(loaded){
				document.getElementById(`product-${product.id}`).classList.add('active')
				document.getElementById(`product-${product.id}`).scrollIntoView({behavior: "smooth", block: "end", inline: "end"});
				emit('closeModal')
				setTimeout(() => {
					if(document.getElementById(`product-${product.id}`)){
						document.getElementById(`product-${product.id}`).classList.remove('active')
					}
					loaded = false
				}, 10000);
			}
		});

		observer.observe(document, {
		childList: true,
		subtree: true
		});
		setTimeout(() => {
			observer.disconnect()
		}, 10000);
	}

	
    function removeProduct(){
        emit('removeProduct', props.product)
    }

	const emit = defineEmits(['closeModal', 'removeProduct'])

</script>

<style scoped>
.search-img{
	max-width:40%;
	max-height: 30%;
	position: relative;
}
.cartoverlay{
	position: absolute;
    color: red;
    top: 0;
    left: auto;
    display: flex;
    flex-direction: row-reverse;
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
.product .info{	
	display: flex;
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: nowrap;
    justify-content: space-between;
	width: 100%;
}

.product .info .information{
	width: 60%;
    display: inline-block;
	text-align: left;
}

.information span{
	width: 98%;
    white-space: break-spaces;
    display: block;
    overflow-wrap: break-word;
}

.information .title{
    font-weight: 600;
	margin-bottom: 3px;
}
.information .variant{
	margin-bottom: 3px;
}

.price-block{
	width: calc(100% - 5px);
	display: flex;
	margin-bottom: 5px;
	flex-direction: row-reverse;
}
.price-block .discount-price{
	padding-right: 5px;

}
.discount-block{
	width: calc(100% - 5px);
	display: flex;
    align-items: center;
	flex-direction: row-reverse;
}
.discount-block .geldig{
	padding-right: 5px;
}

.discount-block .actietag{
	font-size: 1rem;
	max-width: 90%;
	width: fit-content;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.product .buttons{	
	display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
	align-items: flex-start;
	position:relative;
    width: 96%;
    margin-left: auto;
    margin-right: auto;
}
.product .buttons button{
	font-size: 1.3rem;
	padding: 4px;
	position:relative;
}
.buttons .cartoverlay{
	position: absolute;
    color: red;
    top: -15px;
    right: -15px;
}
.buttons .cartoverlay .amountcircle{
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

.goto{
	border-color: #dbdbdb;
	background-color: #ffffff;
	border-width: 3px;
}

.goto:hover, .goto:focus{
	color: #000000;
}

.amountoverlay{
	width:100%;
}
.amountoverlay p{
	background: var(--base-color);
    border: 2px solid var(--base-color);;
    color: #ffffff;
    text-align: center;
    font-size: 1rem;
    line-height: normal;
    margin-bottom: unset;
	margin-top: 2px;
	width: fit-content;
	font-weight: 600;
	padding: 2px;
}

.geldig{
	font-size: 0.8rem;
	font-weight: 400;
	width: 100%;
}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {
	.product{
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: space-between;
		height: 100%;
		flex-wrap: wrap;
		align-content: stretch;
	}
	.product hr{
		display: none;
	}
	.search-img{
		height: auto;
		max-height: unset;
	}
}

@media only screen and (min-width: 500.98px) and (orientation: portrait) {
	.product{
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: space-between;
		height: 100%;
		flex-wrap: wrap;
		align-content: stretch;
	}
	.product hr{
		display: none;
	}
	.search-img{
		height: auto;
		max-height: unset;
	}
}
</style>
<style>
.searchblock .modal-overlay .product-modal{	
    height: 82%;
}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {
	.searchblock .modal-overlay .product-modal{	
		height: 80%;
	}
}
</style>