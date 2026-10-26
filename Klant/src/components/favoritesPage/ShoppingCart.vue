<template>
	<div class="shoppingCart" id="cart">	
		<div class="menuoverlay" @click="openCart()" v-if="state.showCart"></div>
		<div id="cartslide" class="closed">
			<!--<div id="scanner" v-if="state.showScanner">
				<div class="searchoverlay" @click="state.showScanner = !state.showScanner"></div>				
				<transition name="fade">
					<Search 
            			@closeModal="(callback) => {state.showScanner = false;}"
        				@goToProduct="(callback) => {emit('goToProduct', callback); state.showScanner = false; state.showCart = false}"
					/>
				</transition>
			</div>-->

			<div class="carthead">
				<!--<div  class="searchbutton">
					<button @click="state.showScanner = !state.showScanner;openCart()">
						<img class="pricetag" v-bind:src="require('@/assets/icons/search.svg')" />
					</button>
				</div>-->
				<div class="barcodescanner">
					<button @click="state.scanning = !state.scanning" >
						<img :src="require('@/assets/icons/self-scan.svg')" />
					</button>
					<!--<button @click="dev()"><img :src="require('@/assets/icons/self-scan.svg')" /></button>-->
				</div>
				<div class="cartbutton" id="cart-opening-button" @click="openCart()">
					<img :src=shoppingcart />					
					<div class="carttotal">
						<span v-html="`Totaal: &euro;${cart.calculateTotalPrice()}`"></span>
					</div>
				</div>
				<div class="barcodescanner">
					<button class="styling" @click="changeStyle(shelfStyle)">
						<img class="switch" v-bind:src="require('@/assets/icons/switch.svg')" />
					</button>
				</div>
				<div class="modal-overlay barcode" v-if="state.scanning">
					<div class="scan-modal">
						<button @click="state.scanning = false" style="display: none;" >Close</button>
						<Scanner 
							@closeModal="(callback) => {state.scanning = false;}"
						/>
					</div>
				</div>
			</div>
			<div id="mandlist" >
				<div class="topbuttons">
					<button class="clearcart" @click="cart.clearItems()">Mandje legen</button>
					<router-link class="clearcart" :to="{name: 'bestellen'}">Bestel</router-link>
				</div>				
				<div class="cartitem" v-for="item in shoppingCart" v-bind:key="item.id">
					<div class="grid-item image"
						@click="state.productModalOpened = item.product;">
						<img :src="`${item.product.product_information.imgurl}`" v-if="item.product.product_information.imgurl">
					</div>
					<div class="itemname" @click="state.productModalOpened = item.product;">
						<span class="productname" v-html="item.product.product_information.title"></span>
						<span class="variant" v-html="item.product.product_information.variant"></span>
						<span class="price" 
							:class="{'discounted':(cart.isDiscounted(item.product) && cart.calculateDiscountPrice(item.product) != item.product.price && 
							(cart.isDiscounted(item.product)?.discount_info.discount_type.min_amount == 1 || cart.isDiscounted(item.product)?.isPercentage == 0))}"
							@click="cart.addItemToCart(item.product, 1)"  v-html="`&euro;${item.product.price} p.st.`"></span>
						<span class="discount-price price" 
							v-if="(cart.isDiscounted(item.product) && cart.calculateDiscountPrice(item.product) != item.product.price && 
								(cart.isDiscounted(item.product).discount_info.discount_type.min_amount == 1 || cart.isDiscounted(item.product).isPercentage == 0))" 
							@click="cart.addItemToCart(item.product, 1, actieproduct, state.currentVariant)"  
							v-html="`&euro;${toFix(cart.calculateDiscountPrice(item.product))} p.st.`"></span>
					</div>
					<div class="itemprice">
						
						<!--<span class="discount-price" v-if="cart.isDiscounted(item.product)" v-html="`&euro;${cart.calculateDiscountPrice(item.product)} p.st.`"></span>-->
						<span class="productname" v-if="cart.isDiscounted(item.product)" v-html="`${cart.isDiscounted(item.product).discount_info.discount_type.discounttype_label}`"></span>
						<p class="discount-price" v-html="`&euro;${parseFloat(cart.calculateProductPriceWithDiscount(item)).toFixed(2)}`"></p>
					</div>	
					<button class="cartamount" :id="'cartamount-'+item.product.id" @click="openAmountChanger(item.product.id)" v-html="item.amount"></button>
					<div class="itemamount" :id="'cart-'+item.product.id">
						<button class="amountchanger" :disabled="item.amount == 0" @click="cart.updateItemAmount(item.product, parseInt(item.amount) - 1)">-</button>
							<input class="cartamount slider" onkeypress='return event.charCode >= 48 && event.charCode <= 57' pattern="\d*" type="number" min="0" step="1" @blur="cart.updateItemAmount(item.product, parseInt(item.amount) || 0)" name="input" v-model="item.amount" />
						<button class="amountchanger" @click="cart.updateItemAmount(item.product, parseInt(item.amount) + 1)">+</button>
						
					</div>
					<button class="deleteProduct" 
						@click="cart.updateItemAmount(item.product, 0)">
						<img :src="require('@/assets/icons/trash-can.svg')" />
					</button>   
					
				</div>

				<div class="modal-overlay" v-if="state.productModalOpened">
					<ProductModal :product="state.productModalOpened" :discount="ïsDiscounted"
					@closeModal="(callback) => {state.productModalOpened = null;}"/>
				</div>

				<span class="total-price" v-html="`Totaal: &euro;${cart.calculateTotalPrice()}`"></span>
				<div class="orderbutton">				
					<h3><router-link :to="{name: 'bestellen'}">Bestel</router-link></h3>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { reactive, computed } from 'vue';
import cart from '@/assets/cart'
import shoppingcart from '@/assets/icons/shopping-cart.svg'
import Scanner from '@/components/Scanners/Barcodescanner1.vue'
import ProductModal from '@/components/shopPage/ProductModal.vue'
import { useStore } from 'vuex'
const store = useStore()

	const state = reactive({
		showCart: false,
		showScanner: false,
		productModalOpened: null
	})
	
	

	
	const shoppingCart = computed(() => store.getters['shoppingcart/getShoppingCart'])
	

	//function dev(){
	//	alert('Deze functie is tijdelijk niet beschikbaar wegens werkzaamheden')
	//}
	function openCart(){
			if(!state.showCart){
				document.getElementById("cartslide").classList.remove("closed");
				document.getElementById("cart").classList.remove("closed");
				document.getElementById("cart").classList.add("opened");
				document.getElementById("cartslide").classList.add("opened");
				state.showCart = true;
			}
			else{
				document.getElementById("cart").classList.remove("opened");
				document.getElementById("cartslide").classList.remove("opened");
				document.getElementById("cartslide").classList.add("closed");
				document.getElementById("cart").classList.add("closed");
				state.showCart = false;
			}
		}

		

		function openAmountChanger(id){
			document.getElementById('cart-'+id).classList.add("opened");
			setTimeout(() => {
				closeAmountChanger(id)
			}, 7000);
		}
		
		function closeAmountChanger(id){
			var elementExists = document.getElementById('cart-'+id)
			if(elementExists){
				elementExists.classList.add("closed");	
				elementExists.classList.remove("opened");		
				setTimeout(() => {
					elementExists.classList.remove("closed");
				}, 1000);
			}
		}
		
		function changeStyle(style){
			if(style == 0) style = 1;
			else if(style == 1) style = 2
			else if(style == 2) style = 0
			store.commit('shopsettings/changeShelfStyle',style)
		}
		const shelfStyle = computed(() => { return store.getters['shopsettings/getShelfStyle'] || 0})

		function toFix(price){
		return price.toFixed(2)
	}
	
</script>

<style scoped>
.modal-overlay.barcode{
    overflow-y: scroll;
	height: 100%;
}
.modal-overlay.barcode > div{
    overflow-y: scroll;
	height: 90%;
	top: 2%;
	position: absolute;
}
.carthead{
	height: 6.5vh;
	width: 100%;
    max-height: 6.5vh;
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    grid-template-rows: 6.5vh;
    padding-bottom: 20px;
}
.carthead button{
    background-color: unset;
    border: unset;
    box-shadow: unset;
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
    width: 25%;
    margin-top: -10px;
    border: 1px solid #000000;
    display: inline-block;
    margin-left: auto;
    margin-right: auto;
}

.barcodescanner, .searchbutton{
	height: 90%;
    width: 30%;
    padding-top: 10px;
}
.barcodescanner button,
.searchbutton button{
	height: 100%;
	padding: 1px;
    margin: 0px 10px 0 0;
}
.barcodescanner button img,
.searchbutton button img{
	height: 100%;
	width: auto;
}

.topbuttons{
	display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
}
.topbuttons a{
	font-size: 1.5rem;
    font-weight: 600;
    margin-right: 10px;
	text-decoration: none;
}
.cartitem{
	position: relative;
	width: 100%;
    margin-bottom: 10px;
	display: flex;
	flex-direction: row;
    justify-content: space-evenly;
    align-items: flex-start;
	border-bottom: 1px dotted #999999;
	padding-bottom: 5px;
	font-weight: 600;
	font-size: 1.2rem;
}
.itemname{
	width: 45%;
}

.cartamount{
    border-style: outset;
	text-align: center;
	max-width:50%;
	font-weight: 600;
	background-color: var(--base-color) !important;
	margin: 0 0 10px 0;
    height: min-content;
    width: min-content;
    width: 3rem;
    height: 3.5rem;
	display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    flex-wrap: nowrap;
}

.cartamount.slider{
	background-color: #ffffff !important;
}

.itemamount.closed{
	position: absolute;
	right: 0;
	opacity: 1;
	width: 50%;
    height: 98%;
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
	right:-50%;
	width: 50%;
	display: flex;
	flex-direction: row;
    justify-content: space-evenly;
    align-items: stretch;
	opacity: 0.5;
	background-color: #ffffff;
    -webkit-animation: slide 1s forwards;
    animation: slide 1s forwards;
}

.itemamount .cartamount{
	height: 2.5rem;
}
@-webkit-keyframes slide-in {
    100% { 
		right: -50%; 
		opacity: 0.5;
	}
}

@keyframes slide-in {
    100% { 
		right: -50%; 
		opacity: 0.5;		
	}
}

@-webkit-keyframes slide {
    100% { 
		right: 0; 
		opacity: 1;
	}
}

@keyframes slide {
    100% { 
		right: 0; 
		opacity: 1;		
	}
}

.cartitem .itemprice{
	width: 20%
}

.itemamount{
	display: none;
}

.deleteProduct{
	margin-top: 0;
	background-color: var(--base-color-delete);
    border: unset;
	padding: 0px;	
    height: 2rem;
    margin-top: 10px;
    box-shadow: unset;
}
.deleteProduct img{
	height: 100%;
    width: auto;
}
.deleteProduct:hover, .deleteProduct:focus, .deleteProduct:active{
	color: #000000;
}
.itemamount.opened .cartamount{
	max-width: 25%;
    margin: 0;
    padding: 10px 5px;
	z-index: 2;
}
.amountchanger{
	width: 25%;
	background-color: var(--base-color);
    margin: 0 0 10px 0;
	height: 3.5rem;
}

.clearcart{
	margin-bottom: 15px;
    margin-top: 5px;
    margin-left: 10px;
    color: #ffffff;
	display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    border-radius: 5px;
    background: var(--base-color);
    -webkit-box-shadow: 6px 10px 5px 0px rgb(0 0 0 / 75%);
    box-shadow: 4px 4px 3px 0px rgb(0 0 0 / 40%);
    border: 2px solid var(--base-color);
	padding: 3px;
}

.orderbutton{
	margin-bottom: 15px;
    margin-top: 5px;
    color: #ffffff;
	display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
}
.orderbutton h3{
    border-radius: 5px;
    background: var(--base-color);
    -webkit-box-shadow: 6px 10px 5px 0px rgb(0 0 0 / 75%);
    box-shadow: 4px 4px 3px 0px rgb(0 0 0 / 40%);
    border: 2px solid var(--base-color);
	padding: 3px;
}
.orderbutton h3 a{
  color:  #ffffff;
  font-size: 2rem;
  text-decoration: none;
}
.total-price{
	font-weight: 600;
    font-size: 1.2rem;
}
.menuoverlay{
    background-color: #66666666;
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
}

.shoppingCart{
    overflow-y: unset;
    width: var(--app-width);
    position: relative;
    height: 100%;
}
.shoppingCart h2{
	color: #000000;
}
.shoppingCart.opened{
	bottom: 0;
    overflow-x: unset;
    position: absolute;
}
#cartslide{
    z-index: 10;
    position: absolute;
    width: calc(100% - 2px);
    border: 1px solid #111111;
    border-bottom: 0;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    background: #ffffff;
    bottom: 0;
    padding: 0;
}
#cartslide.opened{
    max-height: 50vh;
    transition: max-height 0.25s ease-in;
}

#cartslide.closed{
    max-height: 98%;
	transition: max-height 0.3s ease-out;
}
.productname{
	font-size: 0.9rem;
	text-overflow: ellipsis;
	overflow: hidden;
	width: 100%;
	display: block;
	text-align: left;
}

.variant{
	font-size: 0.8rem;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
	width: 100%;
	display: block;	
	text-align: left;
}
#mandlist{
    max-height: 40vh;
    margin-top: 20px;
    margin-bottom: 10px;
}
.shoppingCart.opened #mandlist{
    overflow-y: scroll;
	overflow-x: hidden;
}

.shoppingCart.opened #mandlist::-webkit-scrollbar {
  width: 5px;
  height: 8px;
  background-color: #aaa; /* or add it to the track */
}
.shoppingCart.opened #mandlist::-webkit-scrollbar-thumb {
    background: #000;
}

.discounted {
    color: red;    
    font-size: 1rem;
    font-style: italic;
    text-decoration: line-through;
    color:#f00;
}
.price{
    display: inline-block;
    width: 100%;
	text-align: left;
	font-size: 1rem;
    font-weight: 500;
}

.grid-item.image{
	display: none;
}

.modal-overlay .product-modal{
    height: 90%;
}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {
	#cartslide{
		z-index: 10;
		position: absolute;
		width: calc(100% - 2px);
		border: 1px solid #111111;
		border-bottom: 0;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
		background: #ffffff;
		bottom: 0;
		padding: 0;
		right: 0;
	}
	#cartslide.opened{
		max-height: 80vh;
		width: calc(150% - 2px);
		transition: max-height .5s ease-in, width .5s ease-in;
		right: 0;
		-webkit-box-shadow: -6px -5px 5px 8px rgba(115,115,115,0.62);
		-moz-box-shadow: -6px -5px 5px 8px rgba(115,115,115,0.62);
		box-shadow: -6px -5px 5px 8px rgba(115,115,115,0.62);
		border: 2px solid #111111;
	}
	#cartslide #mandlist{
		max-height: 60vh;
	}
	
	#cartslide.closed{
		max-height: 98%;
		width: calc(100% - 2px);
		transition: max-height .5s ease-out, width .5s ease-out;
		right: 0;
	}

	.grid-item.image{
		display: block;
		width: 15%;
	}
	.cartitem .itemname span{
		font-size: 1.4rem;
	}
	.cartitem .itemprice p{
		font-size: 1.5rem;
		margin: 0;
		margin-top: 10px;
	}
	.cartitem .itemprice{
		width: 20%
	}
	.cartitem .cartamount{
		font-size: 1.9rem;
	}
	.cartitem .deleteProduct{
		height: 2.5rem;
	}
	.cartitem .itemamount{
		font-size: 2rem;
		min-height: 3.5rem;
	}
	.itemamount.opened{
		width: 40%;
		height: 100%;
	}
	.amountchanger{
		width: 3.5rem;
		margin: 0;
		min-height: 3.5rem;
		font-size: 2.8rem;
		margin: 0;
		padding: 0;
		height: 4.5rem;
		width: 4.5rem;
	}
	.itemamount.opened .cartamount{
		/*max-width: 25%;
		min-height: 3.5rem;*/
		margin: 0;
		padding: 0;
		height: 4.5rem;
		width: 4.5rem;
	}
	.modal-overlay .product-modal{
		height: 85%;
	}
}

@media only screen and (min-width: 500.98px) and (orientation: portrait) {
	#cartslide{
		z-index: 10;
		position: absolute;
		width: calc(100% - 2px);
		border: 1px solid #111111;
		border-bottom: 0;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
		background: #ffffff;
		bottom: 0;
		padding: 0;
		right: 0;
	}
	#cartslide.opened{
		max-height: 80vh;
		transition: max-height .5s ease-in;
		right: 0;
	}
	#cartslide #mandlist{
		max-height: 60vh;
	}
	
	#cartslide.closed{
		max-height: 98%;
		width: calc(100% - 2px);
		transition: max-height .5s ease-out;
		right: 0;
	}

	.grid-item.image{
		display: block;
		width: 15%;
	}
	.cartitem .itemname{
		width: 40%;
	}
	.cartitem .itemname span{
		font-size: 1.4rem;
	}
	.cartitem .itemprice p{
		font-size: 1.5rem;
		margin: 0;
		margin-top: 10px;
	}
	.cartitem .cartamount{
		font-size: 1.9rem;
	}
	.cartitem .deleteProduct{
		height: 2.5rem;
	}
	.cartitem .itemamount{
		font-size: 2rem;
		min-height: 3.5rem;
	}
	.itemamount.opened{
		width: 45%;
		height: 100%;
	}
	.amountchanger{
		width: 3.5rem;
		margin: 0;
		min-height: 3.5rem;
		font-size: 2.8rem;
		margin: 0;
		padding: 0;
		height: 4.5rem;
		width: 4.5rem;
		max-height: 100%;
	}
	.itemamount.opened .cartamount{
		margin: 0;
		padding: 0;
		height: 4.5rem;
		width: 4.5rem;
		max-height: 100%;
	}
}
</style>
