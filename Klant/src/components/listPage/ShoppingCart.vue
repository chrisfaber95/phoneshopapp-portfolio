<template>
	<div class="shoppingCart" id="cart">	
		<div class="menuoverlay" @click="openCart()" v-if="state.showCart"></div>
		<div id="cartslide" class="closed">
			<Carthead
				:location="'list'" 
				@openCart="(callback) => {openCart()}"
				/>
				<div class="product-opening">

				<div class="modal-overlay" v-if="state.productModalOpened">
					<ProductModal :product="state.productModalOpened" :discount="ïsDiscounted"
					@closeModal="(callback) => {state.productModalOpened = null;}"/>
				</div>
				</div>
			<div id="mandlist" >
				<div class="topbuttons">
					<button class="return left-shadow" @click="cart.clearItems()">Lijstje legen</button>
					<button class="clearcart tocart" @click="listToMand()" v-if="klantenkaart == '6207038699858' || klantenkaart == '6472351750024'">
						
						<img src="data:image/png;base64,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">				
						&#8594;
						<img class="switch" v-bind:src="require('@/assets/icons/shopping-cart.svg')" />
					</button>
				</div>				
				<div class="cartitem" v-for="item in shoppingCart" v-bind:key="item.id">
					<div class="grid-item image"
						@click="state.productModalOpened = item.product;">
						<img :src="`${$imageHost}${item.product.product_information.imgurl}`" v-if="item.product.product_information.imgurl">
					</div>
					<div class="itemname" @click="state.productModalOpened = item.product; log(state.productModalOpened)">
						<span class="productname" v-html="item.product.product_information.title"></span>
						<span class="variant" v-html="item.product.product_information.variant"></span>
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
						
						<!--<span class="price" 
							:class="{'discounted':(cart.isDiscounted(item.product) && cart.calculateDiscountPrice(item.product) != item.product.price && 
							(cart.isDiscounted(item.product)?.discount_info.discount_type.min_amount == 1 || cart.isDiscounted(item.product)?.isPercentage == 0))}"
							@click="cart.addItemToCart(item.product, 1)"  v-html="`&euro;${item.product.price} p.st.`"></span>
						<span class="discount-price price" 
							v-if="(cart.isDiscounted(item.product) && 
								(cart.isDiscounted(item.product).discount_info.discount_type.min_amount == 1 || cart.isDiscounted(item.product).isPercentage == 0))" 
							@click="cart.addItemToCart(item.product, 1, actieproduct, state.currentVariant)"  
							v-html="`&euro;${cart.calculateDiscountPrice(item.product)} p.st.`"></span>-->
						</div>
					<div class="itemprice">
						
						<!--<span class="discount-price" v-if="cart.isDiscounted(item.product)" v-html="`&euro;${cart.calculateDiscountPrice(item.product)} p.st.`"></span>
						<span class="productname" v-if="cart.isDiscounted(item.product)" v-html="`${cart.isDiscounted(item.product).discount_info.discount_type.discounttype_label}`"></span>-->
						<p class="discount-price" v-html="`&euro;${cart.calculateProductPriceWithDiscount(item)}`"></p>
					</div>	
					<div class="add">
					<button class="cartamount" :id="'cartamount-'+item.product.id" @click="openAmountChanger(item.product.id)" v-html="item.amount"></button>
					<div class="itemamount" :id="'cart-'+item.product.id">
							<button class="amountchanger no-shadow left" :disabled="item.amount == 0" 
								@click="cart.updateItemAmount(item.product, parseInt(item.amount) - 1);resetTimer()">-</button>
							<input class="cartamount slider" 
								onkeypress='return event.charCode >= 48 && event.charCode <= 57' 
								pattern="\d*" 
								type="number" 
								min="0" 
								step="1" 
								
								@focusout="outFocus(item.product, parseInt(item.amount))" 
								@blur="outFocus(item.product, parseInt(item.amount))"
								@touchleave="outFocus(item.product, parseInt(item.amount))"
								@touchcancel="outFocus(item.product, parseInt(item.amount))"
								name="input" v-model="item.amount" />
							<button class="amountchanger no-shadow right" @click="cart.updateItemAmount(item.product, parseInt(item.amount) + 1);resetTimer()">+</button>
						</div>
					</div>
					<button class="deleteProduct" 
						@click="cart.updateItemAmount(item.product, 0)">
						<img :src="require('@/assets/icons/trash-can.svg')" />
					</button>   
					
					<label class="checkbox path grid-item third">
						<input type="checkbox" v-model="item.check" :on-change="cart.updateCheckItem(item.product, item.check)"/>
						<svg viewBox="0 0 21 21">
							<path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
						</svg>
					</label> 
					<div class="discount-block">
						<Actietag  
						v-if="cart.isDiscounted(item.product)"
						:label="cart.isDiscounted(item.product).discount_info.discount_type.discounttype_label" />
					<i class="geldig" v-if="cart.isDiscounted(item.product)" v-html="`Geldig van ${formatDate(cart.isDiscounted(item.product)?.discount_info.starting_date)}<br>tot ${formatDate(cart.isDiscounted(item.product)?.discount_info.end_date)}`"></i>
				
					</div>
				</div>

				<span class="total-price" v-html="`Verwachte totaalprijs: &euro;${cart.calculateTotalPrice()}`"></span>
			</div>
		</div>
	</div>
</template>
<script setup>
import { reactive, computed, watch } from 'vue';
import Carthead from '@/components/Shoppingcart/Head.vue'
import cart from '@/assets/groceryList'
import ProductModal from '@/components/listPage/ProductModal.vue'
import Actietag from '@/components/Basics/Product/Actietag.vue';
import FancyPrice from '@/components/Basics/Product/FancyPrice.vue'
import { useStore } from 'vuex'
import router from '@/router';
import $ from 'jquery'
const store = useStore()

function listToMand(){
	store.commit('shoppingcart/listToMand')
	if(confirm('Uw lijst is verplaatst naar het winkelmandje, klik op OK om door te gaan naar uw winkelmandje')){
        router.push('/')
	}
}
	const state = reactive({
		showCart: false,
		showScanner: false,
		productModalOpened: null,
		changer: null,
		seconds_open: 7000,
		closeTimer: null
	})

	

	function outFocus(product, amount){
    if(amount == 0){
        cart.updateItemAmount(product, amount)
    }
    else if(amount != parseInt(cart.isItemInCart(product))){
        cart.updateItemAmount(product, amount)
    }
    resetTimer()
}

	

	
	const shoppingCart = computed(() => store.getters['grocerylist/getGroceryList'])
	
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
            if(document.getElementById('cart-'+id)){
                document.getElementById('cart-'+id).classList.add("closed");	
                document.getElementById('cart-'+id).classList.remove("opened");		
				setTimeout(() => {
                    document.getElementById('cart-'+id).classList.remove("closed");
				}, 1000);
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

	const klantenkaart = computed(() => { 
		return localStorage.getItem('klantenkaart')
	})
	watch(() => state.scanning, (newVal, oldVal) => {
		if(state.scanning === true){
			$('.view').animate({
				'max-height': '100%'
			}, 600, "linear");
		}
		else{
			$('.view').animate({
				'max-height': '94%'
			}, 600, "linear");
		}
	})
	
</script>

<style scoped>

.carthead{
	height: 98%;
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
    margin-top: 3px;
    border: 1px solid #000000;
    display: inline-block;
    margin-left: auto;
    margin-right: auto;
}

.barcodescanner{
	height: 90%;
    padding-top: 10px;
}
.barcodescanner button{
	height: 100%;
	padding: 1px;
    margin: 0px 10px 0 0;
}
.barcodescanner button img{
	height: 100%;
	width: auto;
}

.topbuttons{
	display: flex;
    width: 92%;
    flex-direction: row;
    justify-content: space-between;	
    margin-left: 4%;
}
.topbuttons a{
	font-size: 1.5rem;
    font-weight: 600;
    margin-right: 10px;
	text-decoration: none;
	color: #ffffff;
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
    flex-wrap: wrap;
}
.itemname{
	width: 45%;
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

.add .itemamount > .cartamount{
	max-width: unset;
	width: 40%;
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
width: calc(47% - 5px);
top: 0px;
	display: flex;
	flex-direction: row;
align-items: flex-start;
justify-content: flex-end;
	opacity: 1;
	background-color: #ffffff;
    -webkit-animation: slide-in 1s forwards;
    animation: slide-in 1s forwards;
	z-index: 2;
}

.itemamount.opened{
	position: absolute;
right:-50%;	
width: calc(47% - 5px);
top: 0px;
	display: flex;
	flex-direction: row;
align-items: center;
justify-content: flex-end;
	opacity: 0.5;
	background-color: #ffffff;
    -webkit-animation: slide 1s forwards;
    animation: slide 1s forwards;
	z-index: 2;
}

.itemamount{
display: none;
}

@-webkit-keyframes slide-in {
    100% { 
		right: -55%; 
		opacity: 0.5;
	}
}

@keyframes slide-in {
    100% { 
		right: -55%; 
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


.clearcart{
    background-color: var(--base-color);
    border: 2px solid var(--base-color);
    border-radius: 5px;
    padding: 7px;
	margin: 10px 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: #000000;
    box-shadow: 4px 4px 3px 0px #00000066;
    -webkit-box-shadow: 4px 4px 3px 0px #00000066;
}
.tocart{
	background-color: #ffffff;
    border-color: #cccccc;
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
	padding-bottom: 20px;
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
    max-height: 90%;
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
	position: relative;
    z-index: 7;
    background: white;
    padding-top: 10px;
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

.price-block{
	width: 100%;
	display: flex;
	margin-bottom: 5px;
}
.price-block .discount-price{
	padding-left: 5px;
}
.discount-block{
	width: calc(100% - 5px);
	display: flex;
    align-items: center;
    padding-left: 5px;
}

.discount-block .actietag{
	font-size: 1rem;
	max-width: 90%;
	width: fit-content;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.discount-block i{
	font-size: 0.8rem;
	max-width: 90%;
	text-align: left;
    padding-left: 5px;
    font-weight: 400;
}
.grid-item.image{
	display: none;
}

.checkbox{
	margin-top: 10px;
	z-index: 1;
}
.modal-overlay .product-modal{
    height: 90%;
}

.clearcart:nth-child(2){
	color: black;
}
.clearcart img{
	height: 2.5rem;
	width: auto;
	margin-left:5px;
	margin-right: 5px;
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
		max-height: 99%;
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
		font-size: 1.8rem;
		min-height: 3rem;
		z-index: 2;
	}
	
.itemamount.closed{
	position: absolute;
	right: 0;
	opacity: 1;
	width: calc(30% - 5px);
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
	right:-25%;	
	width: calc(20% - 5px);
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
	

	.amountchanger{
		width: 3rem;
		margin: 0;
		min-height: 3rem;
		font-size: 1.8rem;
		margin: 0;
		padding: 0;
		height: calc(3rem + 4px);
		width: calc(3rem + 2px);
	}
	.add .itemamount > .cartamount{
		/*max-width: 25%;
		min-height: 3.5rem;*/
		margin: 0;
		padding: 0;
		height: 3rem;
		width: calc(100% - 2 * 3rem);
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
		max-height: 90%;
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
		font-size: 1.8rem;
		min-height: 3rem;
	}
	.itemamount.closed{
		position: absolute;
		right: 0;
		opacity: 1;
		width: calc(20% - 5px);
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
		right:-33%;	
		width: calc(20% - 5px);
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
		
	
	.amountchanger{
			width: 3rem;
		margin: 0;
			min-height: 3rem;
			font-size: 1.8rem;
		margin: 0;
		padding: 0;
			height: calc(3rem + 4px);
			width: calc(3rem + 2px);
	}
		.add .itemamount > .cartamount{
		margin: 0;
		padding: 0;
			height: 3rem;
			width: calc(100% - 2 * 3rem);
	}
}
</style>
