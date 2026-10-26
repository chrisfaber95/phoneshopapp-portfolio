<script setup>
	import { defineProps, ref, onMounted, reactive } from 'vue';
	//import {HTTP} from '@/assets/services/http-common.js';
	import auth from '@/assets/services/auth'
	import pick from '@/assets/scripts/picking.js'
	import prod from '@/assets/scripts/products.js'
	import zoom from '@/assets/icons/search-plus-solid.svg'
	import ShowProduct from '@/components/CollectingScreen/ProductInformation.vue';

    const props = defineProps({
		'order': Object,
        'products': Object
	})
		
	const bagtypes = ref(process.env.VUE_APP_BAGEAN.split(','))

	const state = reactive({
		imgviewer: false
	})


	async function updateProductPicked(amount){
		var checked
		if(props.products.product.stock == 0){
			const restock = await prod.restockedProduct(props.products)
			if(restock === true){
				if(props.product.picked == 0){
					checked = await pick.checkMultiple(props.products, amount).value
					if(checked.value === true){
						pick.updateProductPicked(amount , props.products, props.order)
					}
					else {
						return false
					}
				}
				else{
					pick.updateProductPicked(amount , props.products, props.order)
				}
			}
		}
		else{			
			if(props.products.picked == 0){
				checked = await pick.checkMultiple(props.products, amount)
				if(checked.value === true){
					pick.updateProductPicked(amount , props.products, props.order)
				}
				else {
					return false
				}
			}
			else{
				pick.updateProductPicked(amount , props.products, props.order)
			}
		}
	}

	async function productIsEOL(){
		const res = await prod.productIsEOL(props.products.product)
		if(res != false){
			if(props.products.picked > 0 && res?.end_of_life == 1){
				updateProductPicked(0, props.products, props.order)
			}
		}
	}
	
	async function productOutOfStock(){
		await prod.productOutOfStock(props.products.product)
	}
	
	onMounted(() => {
		console.log(props.products)
	})
//import {HTTP} from '@/assets/scripts/http-common.js';

</script>
<template>
	<div class="receipt-item">

		<div class="title" v-html="products?.product?.product_information?.title"></div>
		<div class="cat" v-html="products?.product?.department?.label"></div>
				
		<div class="info">
			<div class="data">
				<div class=""  v-if="products.product?.categoryname2" v-html="products.product?.categoryname2"></div>
				<div class="" v-html="`Variant: ${products.product.product_information?.variant || ''}`"></div>
				<div v-html="`Prijs: ${parseFloat(products.price).toFixed(2)}`"></div>
			</div>
			<div class="img" @click="state.imgviewer = !state.imgviewer">
				<img class="img-fluid" v-bind:src="`https://www.cooplubbers.nl${products?.product?.product_information?.imgurl}`" />
				<img v-if="products?.product?.product_information?.imgurl" class="zoomicon" :src=zoom />
			</div>
			<div class="modal-overlay"
				v-if="state.imgviewer"
				v-bind:class="[{'closed': !state.imgviewer}, {'opened': state.imgviewer}]">	
				<ShowProduct :item="products.product" @close="state.imgviewer = false"/>
			</div>			
		</div>					
		<div class="product-ean" v-html="`Ean: ${products.product.ean}`"></div>	
		<div class="amount" v-html="`Aantal: ${products.picked}/${products.amount}`"></div>
		<div class="amountchanger"  v-if="order.status == 'ordered' && order.picking_user == auth.getUserId()">
			<button 
				class="remove-button"
				:class="products.product.stock <= 0?'errbtn':''" 
				variant="danger" 
				@click="productOutOfStock()"
				v-html="`Geen voorraad`"></button>
			<button 
				class="remove-button" 
				v-if="auth.isAdmin()"
				:class="products.product.end_of_life == 1?'errbtn':''" 
				variant="danger"
				@click="productIsEOL()"
				v-html="`End of life`"></button>
			<button 
				class="remove-button" 
				v-if="products.picked >= 1" 
				variant="danger" 
				@click="updateProductPicked(products.picked - 1)"
				v-html="`Verwijder`"></button>
			<button 
				class="add-button"
				v-if="products.picked != products.amount 
					|| (bagtypes.some(el => el === products.product.ean))" 
				variant="success" 
				@click="updateProductPicked(products.picked + 1)"
				v-html="`Toevoegen`"></button>
		</div>
	</div>
</template>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.receipt-item{
	font-size: 1.3rem;
}
.receipt-item .product-ean{
	font-size: 1.6rem;
}
.receipt-item .amount{
	font-size: 1.5rem;
}
.amountchanger .remove-button,
.amountchanger .add-button{
	font-size: 1.5rem;
	margin: 10px;
}
.amountchanger .remove-button{
	background-color: #ffffff;
	color: #000000;
}
.remove-button.errbtn{
	background-color: #ff0000;
	color: #ffffff;
}
.amountchanger .removebtn{
	font-size: 1.2rem;
}
.amount{
	color: #ff0000
}
	.title{
		padding:7px;
		font-size: 1.5rem;
		font-weight: 700;
		text-align: center;
	}
	
	.info{
		display: flex;
		position: relative;
		font-size: 1.2rem;
		font-weight: 700;
		text-align: center;
		align-content: center;
		align-items: center;
		justify-content: space-evenly;
	}
	.info .img,
	.info .data{
		margin: 5px;
		width: 45%;
		padding-left: 5px;
		overflow: hidden;
		word-wrap: break-word;
		font-size: 1.1rem;
	}
	.zoomicon{
		position: absolute;
		width: 8%;
		right: 0;
		bottom: 0;
	}
	.imgviewer{    
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: rgb(255, 255, 255);
		border: 1px solid black;
		padding: 5%;
		z-index: 101;
		width: 90%;
		height: 80%;
		font-size: 1.5rem;
	}
	.imgviewer img.img-fluid{
		max-height: 50%;
		width: auto;
	}
	.imgviewer.closed{
		display: none;
		animation: fade-out 500ms;
	}
	.imgviewer.opened{
		display: block;
		animation: fade-in 500ms;
	}
	@keyframes fade-in {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
	}

	@keyframes fade-out {
	from {
		opacity: 1;
	}
	to {
		opacity: 0;
	}
	}

@media screen and (orientation: landscape){
	.bon-block.singlebon .info .data{
		font-size: 1.5rem;
	}
	.bon-block.singlebon .title.sec{
		font-size: 1.5rem;
	}
	.imgviewer .information{
		height: 30%;
		width: 50%;
	}
	.imgviewer .information .title,
	.imgviewer .information .variant{
		font-size: 2rem;
		width: 100%;
	}
	.imgviewer .ean{
		font-size: 2rem;
	}
	.imgviewer img.img-fluid{
		max-height: 70%;
		width: auto;
	}
}

@media (orientation: portrait) and (min-width: 575px){	
	.bon-block.singlebon .info .data{
		font-size: 1.5rem;
	}
	.bon-block.singlebon .title.sec{
		font-size: 1.5rem;
	}
	.bon-block.doublebon{
		width: 50%;
	}
	.bon-block.triplebon{
		width: 33%;
	}
}

@media (min-width: 481px){
.info .data,
.amount{
	font-size: 1.4rem;
}
.imgviewer{
	font-size: 2rem;
}
.imgviewer .title{
	font-size: 2.5rem;
}
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
@media (orientation: landscape){
	.imgviewer.opened{
		display: flex;
		grid-auto-columns: repeat(2, 1fr);
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-around;
	}	
	.imgviewer .title{
		font-size: 1.4rem;
		width: 48%;
	}
    .imgviewer .variant{
		font-size: 1.4rem;
		width: 48%;
	}
	.imgviewer .ean{
		font-size: 1.4rem;
		max-width: 48%;
	}
	.imgviewer img{
		font-size: 1.4rem;
		width: 48%;
	}
	.imgviewer button{
		font-size: 1.4rem;
		max-width: 48%;
	}
}
</style>