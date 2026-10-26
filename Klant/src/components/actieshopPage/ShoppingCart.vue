<template>
	<div class="shoppingCart" id="cart">	
		<div class="menuoverlay" @click="openCart()" v-if="state.showCart"></div>
		<div id="cartslide" class="closed">
			<Carthead
				:location="'actie'" 
				@openCart="(callback) => {openCart()}"
				/>
			<div id="mandlist" >
				<div class="topbuttons">
					<button class="return left-shadow" @click="cart.clearItems()">Mandje legen</button>
					<router-link class="clearcart" :to="`/actieorder/${actie?.slug}`">Bestellen</router-link>
				</div>				
				<div class="cartitem" v-for="(item, index) in shoppingCart" v-bind:key="item.id">
					<div class="grid-item image"
						@click="state.productModalOpened = item.prod.product;">
						<img :src="`${$imageHost}${item.prod.product.product_information?.imgurl}`" v-if="item.prod.product.product_information.imgurl">
					</div>
					<div class="itemname" @click="state.productModalOpened = item.prod.product;">
						<span class="productname" v-html="item.prod.product.product_information.title"></span>
						<div class="variants" v-if="item.variant">
							<div class="option" v-for="option in item.variant" :key="`${item.prod.product.id}-${option}`">
								<span class="variant" v-html="getVariant(item, option)[0].variant_label"  :key="`${item.prod.product.id}-${option}`"></span>
							</div>
						</div>
						<span class="variant" v-if="!item.variant" v-html="item.prod.product.product_information.variant"></span>
						<span class="price" 
							v-html="`${item.prod.actieproduct.stamps_cost} zegels`">
						</span>
						</div>
						<div class="add" v-if="!item.variant" >
							<button class="cartamount" 
								:id="`cartamount-${item.prod.product.id}-${index}`" 
								@click="openAmountChanger(item.prod.product.id, index)" v-html="item.variant ? 1 : item.prod.amount"></button>
							<div class="itemamount" :id="`cart-${item.prod.product.id}-${index}`">
								<button class="amountchanger no-shadow left" :disabled="item.prod.amount == 0" 
								@click="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount) - 1, item.prod.actieproduct);resetTimer()">-</button>
									<input class="cartamount slider" 
										onkeypress='return event.charCode >= 48 && event.charCode <= 57' 
										pattern="\d*" 
										type="number" 
										min="0" 
										step="1" 
										
										@focusout="outFocus(item.prod.product, parseInt(item.prod.amount), item.prod.actieproduct)" 
										@blur="outFocus(item.prod.product, parseInt(item.prod.amount), item.prod.actieproduct)"
										@touchleave="outFocus(item.prod.product, parseInt(item.prod.amount), item.prod.actieproduct)"
										@touchcancel="outFocus(item.prod.product, parseInt(item.prod.amount), item.prod.actieproduct)"
										name="input" v-model="item.prod.amount" />
								<button class="amountchanger no-shadow right" @click="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount) + 1, item.prod.actieproduct);resetTimer()">+</button>
							</div>
						</div>
						<button class="deleteProduct" 
							v-if="!item.variant" 
							@click="cart.updateItemAmount(item.prod.product, 0, item.prod.actieproduct)">
							<img :src="require('@/assets/icons/trash-can.svg')" />
						</button> 
						<div class="add" v-if="item.variant">
							<div class="itemamount" :id="`cart-${item.prod.product.id}-${index}`" >
								<button class="amountchanger no-shadow left" :disabled="item.prod.amount == 0" 
									@click="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount) - 1, item.prod.actieproduct, item.variant);resetTimer()">
									-
								</button>
									<input class="cartamount slider" 
										onkeypress='return event.charCode >= 48 && event.charCode <= 57' 
										pattern="\d*" 
										type="number" 
										min="0" 
										step="1" 
										
										@focusout="outFocus(item.prod.product, parseInt(item.prod.amount), item.prod.actieproduct, item.variant)" 
										@blur="outFocus(item.prod.product, parseInt(item.prod.amount), item.prod.actieproduct, item.variant)"
										@touchleave="outFocus(item.prod.product, parseInt(item.prod.amount), item.prod.actieproduct, item.variant)"
										@touchcancel="outFocus(item.prod.product, parseInt(item.prod.amount), item.prod.actieproduct, item.variant)"
										name="input" value="1" />
								<button class="amountchanger no-shadow right" @click="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount) + 1, item.prod.actieproduct, item.variant);resetTimer()">+</button>
							</div>
						</div>						
						<button
							v-if="item.variant" 
							class="deleteProduct" 
							@click="cart.deleteProductVariant(item.prod.product, item.prod.amount, item.prod.actieproduct, item.variant, item.prod.variant)">
							<img :src="require('@/assets/icons/trash-can.svg')" />
						</button>
						
						<!--<button v-if="!item.variant"  class="cartamount" 
						:id="'cartamount-'+item.prod.product.id"
						@click="openAmountChanger(item.prod.product.id)" v-html="item.prod.amount"></button>
						<div v-if="!item.variant"  class="itemamount" :id="'cart-'+item.prod.product.id">
							<button class="amountchanger" :disabled="item.amount == 0" 
							@click="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount) - 1, item.prod.actieproduct)">-</button>
								<input class="cartamount slider" 
								onkeypress='return event.charCode >= 48 && event.charCode <= 57' 
								pattern="\d*" type="number" min="0" step="1" 
								@blur="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount) || 0, item.actieproduct)" 
								@touchleave="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount) || 0, item.actieproduct)" 
								@touchcancel="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount) || 0, item.actieproduct)" 
								name="input" 
								v-model="item.prod.amount" />
							<button class="amountchanger" @click="cart.updateItemAmount(item.prod.product, parseInt(item.prod.amount) + 1, item.actieproduct)">+</button>
						
						
						
					</div>	-->				
				</div>
				
				<span class="total-price" v-html="`Totaal: ${cart.calculateStampPrice()} zegels`"></span>
				<div class="orderbutton">				
					<router-link class="clearcart" :to="`/actieorder/${actie?.slug}`">Bestellen</router-link>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { reactive, computed, defineEmits } from 'vue';
import cart from '@/assets/actiecart'
import Carthead from '@/components/Shoppingcart/Head.vue'
import { useStore } from 'vuex'

const store = useStore()

	const state = reactive({
		showCart: false,
		showScanner: false,
		productModalOpened: null,
		changer: null,
		seconds_open: 7000,
		closeTimer: null
	})
	
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
		//return store.getters.getActieShoppingCart
		return cart
		
	})
	

	
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

		

		function openAmountChanger(id, index){
			document.getElementById(`cart-${id}-${index}`).classList.add("opened");
            state.changer = {id, index}
            startCloseTimer(id, index)
		}
        
        function startCloseTimer(id, index){
			state.closeTimer = setTimeout(() => {
				closeAmountChanger(id, index)
                state.changer = null
			}, state.seconds_open);
        } 
        function resetTimer() {
            clearTimeout(state.closeTimer);
            startCloseTimer(state.changer.id, state.changer.index);
		}
		
		function closeAmountChanger(id,index){
			var elementExists = document.getElementById(`cart-${id}-${index}`)
			if(elementExists){
				elementExists.classList.add("closed");	
				elementExists.classList.remove("opened");		
				setTimeout(() => {
					elementExists.classList.remove("closed");
				}, 1000);
			}
		}

		function outFocus(product, amount, actieproduct){
			if(amount == 0){
				cart.updateItemAmount(product, amount, actieproduct)
			}
			else if(amount != parseInt(cart.isItemInCart(product))){
				cart.updateItemAmount(product, amount, actieproduct)
			}
		}
		
	const actie = computed(() => {	
		return store.getters['location/getActie']
	}, {immediate: true, deep: true})
	defineEmits(['goToProduct']);
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
    -webkit-animation: slide 1s forwards;
    animation: slide 1s forwards;
}

.itemamount{
display: none;
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
	text-decoration: none;
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
    font-size: 1.4rem;
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
    margin-bottom: 10px;
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
