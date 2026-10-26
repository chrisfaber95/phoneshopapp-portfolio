<template>
	<div class="shoppingCart" id="cart">	
		<div class="menuoverlay" @click="openCart()" v-if="state.showCart"></div>
		<div id="cartslide" class="closed">
			<div id="scanner" v-if="state.showScanner">
				<div class="searchoverlay" @click="state.showScanner = !state.showScanner"></div>				
				<transition name="fade">
					<Search 
            			@closeModal="(callback) => {state.showScanner = false;}"
        				@goToProduct="(callback) => {emit('goToProduct', callback); state.showScanner = false; state.showCart = false}"
					/>
				</transition>
			</div>
			<div class="carthead" @click="openCart()">
				<div  class="searchbutton">
					<button @click="state.showScanner = !state.showScanner;openCart()">
						<img class="pricetag" v-bind:src="require('@/assets/icons/search.svg')" />
					</button>
				</div>
				<div class="cartbutton">
					<img :src=shoppingcart />					
					<div class="carttotal">
						<span v-html="`Totaal: &euro;${cart.calculateTotalPrice()}`"></span>
					</div>
				</div>
				<div class="modal-overlay" v-if="state.scanning">
					<Scanner />
				</div>
					<div class="barcodescanner">
						<!--<button @click="state.scanning = !state.scanning" ><img :src="require('@/assets/icons/self-scan.svg')" /></button>-->
						<button @click="dev()" ><img :src="require('@/assets/icons/self-scan.svg')" /></button>
					</div>
			</div>
			<div id="mandlist" >
				<div class="topbuttons">
					<button class="clearcart" @click ="cart.clearItems()">Mandje legen</button>
					<router-link class="clearcart" :to="{name: 'bestellen'}">Bestel</router-link>
				</div>				
				<div class="cartitem" v-for="item in shoppingCart" v-bind:key="item.id">
					<div class="itemname">
						<span class="productname" v-html="item.product.product_information.title"></span>
						<span class="variant" v-html="item.product.product_information.variant"></span>
					</div>
					<div class="itemprice">
						<span v-html="`&euro;${cart.calculatePrice(item)}`"></span>
					</div>
					<button class="cartamount" :id="'cartamount-'+item.product.id" @click="openAmountChanger(item.product.id)" v-html="item.amount"></button>
					<div class="itemamount" :id="'cart-'+item.product.id">
						<button class="amountchanger" :disabled="item.amount == 0" @click="cart.updateItemAmount(item.product, parseInt(item.amount) - 1)">-</button>
							<input class="cartamount" onkeypress='return event.charCode >= 48 && event.charCode <= 57' pattern="\d*" type="number" min="0" step="1" @blur="cart.updateItemAmount(item.product, parseInt(item.amount) || 0)" name="input" v-model="item.amount" />
						<button class="amountchanger" @click="cart.updateItemAmount(item.product, parseInt(item.amount) + 1)">+</button>
						
					</div>
					<button class="deleteProduct" @click="cart.updateItemAmount(item.product, 0)">X</button>
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
import { reactive, computed, defineEmits } from 'vue';
import cart from '@/assets/cart'
import shoppingcart from '@/assets/icons/shopping-cart.svg'
import Search from '@/components/favoritesPage/Search.vue'
import Scanner from '@/components/Scanners/Barcodescanner.vue'
import { useStore } from 'vuex'
const store = useStore()

	const state = reactive({
		showCart: false,
		showScanner: false
	})

	
	const shoppingCart = computed(() => store.state.shoppingCart)
	

	function dev(){
		alert('Deze functie is tijdelijk niet beschikbaar wegens werkzaamheden')
	}
	function openCart(){
			if(!state.showCart){
				document.getElementById("cart").classList.add("opened");
				document.getElementById("cartslide").classList.add("opened");
				document.getElementById("cartslide").classList.remove("closed");
				state.showCart = true;
			}
			else{
				document.getElementById("cart").classList.remove("opened");
				document.getElementById("cartslide").classList.remove("opened");
				document.getElementById("cartslide").classList.add("closed");
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
			document.getElementById('cart-'+id).classList.add("closed");	
			document.getElementById('cart-'+id).classList.remove("opened");		
			setTimeout(() => {
				document.getElementById('cart-'+id).classList.remove("closed");
			}, 1000);
		}
		
	const emit = defineEmits(['goToProduct'])
</script>
<!--
<script>
import cart from '../../cart'
import Search from '@/components/Search.vue'
export default {
	components: {
		Search
	},
  name: 'shoppingCart',
  props: {
    msg: String
  },
	data: function () {
		return {
			cartItems: new Object(null),
			showCart: false,
			showScanner: false,
			cart1: cart,
			totalPrice: 0.00
		}
	},directives: {
        clickoutside: {
            bind: function(el, binding, vnode) {
                el.clickOutsideEvent = function(event) {
                    // here I check that click was outside the el and his childrens
                    if (!(el == event.target || el.contains(event.target))) {
                        // and if it did, call method provided in attribute value
                        vnode.context[binding.expression](event);
                    }
                };
                document.body.addEventListener("click", el.clickOutsideEvent);
                document.body.addEventListener("touchstart", el.clickOutsideEvent);
            },
            unbind: function(el) {
                document.body.removeEventListener("click", el.clickOutsideEvent);
                document.body.removeEventListener("touchstart", el.clickOutsideEvent);
            },
            stopProp(event) {
                event.stopPropagation();
            }
        }
    },
	methods: {
		unescape: function(html){
			var txt = document.createElement('textarea');
			txt.innerHTML = html;
			return txt.value;
		},
		clearCart: function(){
			cart.clearItems().then(this.updateCartPrice());
		},
		updateCartPrice: function(){
			cart.calculatePrice();
		},
		openCart: function(){
			if(!this.showCart){
				document.getElementById("cart").classList.add("opened");
				document.getElementById("cartslide").classList.add("opened");
				document.getElementById("cartslide").classList.remove("closed");
				this.showCart = true;
			}
			else{
				document.getElementById("cart").classList.remove("opened");
				document.getElementById("cartslide").classList.remove("opened");
				document.getElementById("cartslide").classList.add("closed");
				this.showCart = false;
			}
		},
		onClose: function(){
			if(this.showCart){
				document.getElementById("cart").classList.remove("opened");
				document.getElementById("cartslide").classList.remove("opened");
				document.getElementById("cartslide").classList.add("closed");
				this.showScanner = false
				this.showCart = false
				document.getElementById("cart").scrollTop = 0;				
			}
		},
		openAmountChanger(id){
			//document.getElementById("cartamount-"+id).classList.remove("opened");
			document.getElementById('cart-'+id).classList.add("opened");
			//document.getElementById("cartamount-"+id).classList.add("closed");
			setTimeout(() => {
				this.closeAmountChanger(id)
			}, 10000);
		},
		closeAmountChanger(id){
			//document.getElementById("cartamount-"+id).classList.remove("closed");
			document.getElementById('cart-'+id).classList.remove("opened");
			//document.getElementById("cartamount-"+id).classList.add("opened");
		}
	},
	created(){
	},
	mounted(){
	},
	computed:{
		cartitemlist: function(){
			var mand = this.cartItems
			return mand
		}
	},
	watch:{
		'$store.state.winkelmand':{
			immediate: true,
			deep: true,
			handler(){
				var mand = this.$store.state.winkelmand
				this.cartItems = mand
				cart.calculateBags()				
			}
		},
		'$store.state.totalPrice':{
			immediate: true,
			deep: true,
			handler(){
				var totalPrice = this.$store.state.totalPrice
				this.totalPrice = totalPrice
			}
		}
	}
}
</script>
-->
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
	width: 40%;
}

.cartamount{
    border-style: outset;
	text-align: center;
	max-width:50%;
	font-weight: 600;
	background-color: var(--base-color) !important;
	margin: 0 0 10px 0;
}

.btn.cartamount.closed{
	display: none;
}
.btn.cartamount.opened{
	display: block;
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
    height: 98%;
	display: flex;
	flex-direction: row;
    justify-content: space-evenly;
    align-items: stretch;
	opacity: 0.5;
	background-color: #ffffff;
    -webkit-animation: slide 1s forwards;
    animation: slide 1s forwards;
}
.deleteProduct:hover, .deleteProduct:focus, .deleteProduct:active{
	color: #898989
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

.itemamount{
	display: none;
}

.deleteProduct{
	margin-top: 0;
	background-color: var(--base-color-delete);
    border: 2px solid #ededed;
}
.itemamount.opened .cartamount{
	max-width: 25%;
}
.amountchanger{
	width: 25%;
	background-color: var(--base-color);
    margin: 0 0 10px 0;
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
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.shoppingCart{
	overflow-y: hidden;
	position: absolute;
    overflow-y: unset;
}
.shoppingCart h2{
	color: #000000;
}
.shoppingCart.opened{
	bottom: 0;
    overflow-x: unset;
    overflow-y: unset;
}
#cartslide{
    z-index: 10;
	position: absolute;
    width: calc(var(--app-width)*0.98);
    border: 1px solid #111111;
    border-top-left-radius: 50px;
    border-top-right-radius: 50px;
    background: #ffffff;
    bottom: 0;
    padding: 1px;
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
	/*white-space: nowrap;*/
	overflow: hidden;
	width: 100%;
	display: block;
	text-align: left;
}
/*
.productname{
	-webkit-transition: 3.3s;
	-moz-transition: 3.3s;
	transition: 3.3s;     

	-webkit-transition-timing-function: linear;
	-moz-transition-timing-function: linear;
	transition-timing-function: linear;
}
.productname:hover{
  margin-left: -300px;
}*/

.variant{
	font-size: 0.7rem;
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

#scanner{
    position: fixed;
    z-index: 10;
    background: white;
    width: 90vw;
    bottom: 7vh;
    left: 5vw;
    max-height: 70vh;
}
.searchoverlay{
    background-color: #66666666;
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
}
</style>
