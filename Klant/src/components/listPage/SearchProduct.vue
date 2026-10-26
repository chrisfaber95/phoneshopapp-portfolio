<template>
	<div class="product">	
		<div class="info">
			<div class="search-img" @click="state.productModalOpened = !state.productModalOpened">

				<img class="img-fluid " 
				v-bind:src="`${$imageHost}${product.product_information.imgurl}`" 
				/>
			</div>
			<div class="information">
				<span class="title" v-html="newline(product.product_information.title)"></span>
				<span class="variant" v-html="product.product_information.variant"></span>			
				<div class="amountoverlay" v-if="cart.isItemInCart(product)">
					<p v-if="cart.isItemInCart(product)" @click="cart.updateItemAmount(product, 0)">Aantal: {{cart.isItemInCart(product)}}</p>
				</div>
				<div class="price">
					<span class="price" 
						:class="{'discounted':(isDiscounted && cart.calculateDiscountPrice(product) != product.price && 
						(isDiscounted.discount_info.discount_type.min_amount == 1 || isDiscounted.isPercentage == 0))}"
						@click="cart.addItemToCart(product, 1)"  v-html="`&euro;${product.price} p.st.`"></span>
					<span class="discount-price" 
						v-if="(isDiscounted && cart.calculateDiscountPrice(product) != product.price && 
							(isDiscounted.discount_info.discount_type.min_amount == 1 || isDiscounted.isPercentage == 0))" 
						@click="cart.addItemToCart(product, 1, actieproduct, state.currentVariant)"  
						v-html="`&euro;${toFix(cart.calculateDiscountPrice(product))} p.st.`"></span>
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
			<button @click="cart.addItemToCart(product, 1)">Voeg toe</button>
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
import cart from '@/assets/groceryList'
import ProductModal from '@/components/listPage/ProductModal.vue' 
import Actietag from '@/components/Basics/Product/Actietag.vue'

import { useStore } from 'vuex'
const store = useStore()

	const props = defineProps({
		'product': Object
	})

	const state = reactive({
		productModalOpened: false
	})

	

	function newline(html){
		html = html.replace(/\r?\n/g, '<br />');
		return html;
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
	
	function toFix(price){
		return price.toFixed(2)
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
			mutations.forEach((mutation) => {
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

	const emit = defineEmits(['closeModal'])

</script>

<style scoped>
.search-img{
	max-width:40%;
	max-height: 30%;
}
.product .info{	
	display: flex;
    flex-direction: row;
    align-items: flex-start;
    flex-wrap: nowrap;
    justify-content: space-between;
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
}

.information .title{
    font-weight: 600;
	margin-bottom: 3px;
}
.information .variant{
	margin-bottom: 3px;
}
.information .price{
    font-weight: 600;
	display: inline-block;
    text-align: end;
    width: 100%;
	margin-top: 10px;
}

.information .price .discount{
	font-size: 1.3rem;
	max-width: 90%;
	width: fit-content;
	margin-left: auto;
    text-align: left;
}

.discounted {
    color: red;    
    font-size: 1rem;
    font-style: italic;
    text-decoration: line-through;
    color:#f00;
}

.product .buttons{	
	display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
	align-items: flex-start;
}
.product .buttons button{
	font-size: 1.3rem;
	padding: 4px;
}

.goto{
	border-color: #ececec;
	background-color: #ffffff;
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