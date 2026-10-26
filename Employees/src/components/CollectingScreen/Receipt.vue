<script setup>
    import { reactive, defineProps, computed, onBeforeMount } from 'vue';
	import pick from '@/assets/scripts/picking.js'
	import auth from '@/assets/services/auth'
	import ReceiptPickingMethod from '@/components/CollectingScreen/ReceiptPickingMethod.vue'
	import EditOrderInformation from '@/components/CollectingScreen/EditOrderInformation.vue'
	import ReceiptInformation from '@/components/CollectingScreen/ReceiptInformation.vue'

	const props = defineProps({
		'order': Object
	})

	const state = reactive({
		order: [],
		orderProducts: [],
		choosePickingMethod: false,
		editOrderModal: false
	})

	function picked(){
		pick.finishedPicking(props.order)
	}

	const orderStatus = computed(() => {
            switch (props.order.status) {
                case 'ordered':
                    return "Besteld"
                case 'picked':
                    return "Verpakt"
                case 'scanned':
                    return props.order.delivery ? "Klaar voor bezorging" : "Verwerkt bij de kassa"
                case 'payed':
                    return "Betaald"
                case 'afgehaald':
					return props.order.delivery ? "Bezorgd" : "Afgehaald"
                case 'rejected':
                    return "Geannuleerd"
                default:
                    return ""
            }
	})	

	function amountOfItems(){
		let maxcounter = 0
		var amountpicked = 0
		props.order.product_list.forEach((element) => {
			maxcounter += element.amount ?? 0
			amountpicked += element.picked ?? 0
		});
		return {"max": maxcounter, "amount": amountpicked}
	}

	function formatTime(timeString){
		let time = timeString.split(':')
		return `${time[0]}:${time[1]}`
	}

	onBeforeMount(() => {
		state.order = props.order
		state.orderProducts = props.order.product_list
	})
</script>

<template>
	<div class="bon-container">
		<div class="header">
			<p class="time" 
				v-if="order.pickupTime" 
				v-html="`${order.delivery ? 'Bezorgtijd' : 'Afhaaltijd'}:${formatTime(order.pickupTime)}`"></p>
		</div>
		<div class="top">
			<div class="status" v-html="orderStatus"></div>			
            <div id="customer-address" 
				v-if="order.delivery" 
				v-html="`Adres: 
				${order.order_information.street || ''} 
				${order.order_information.house_number || ''} 
				${order.order_information.house_addition || ''} 
				${order.order_information.zipcode || ''} 
				${order.order_information.city || ''} 
				`">
			</div>
			<div class="top-buttons">
				<button 
					v-if="order.status == 'ordered'" 
					v-bind:class="[{'chosen-order': order.picking_user == auth.getUserId()}]"  
					@click="state.choosePickingMethod = !state.choosePickingMethod"
					v-html="order.picking_user == auth.getUserId() ? 'Aanpassen' : 'Accepteren'">					
				</button>
				<div class="modal-overlay" v-if="state.choosePickingMethod && order.status == 'ordered' ">
					<ReceiptPickingMethod
						:order="order"
						@closePickingMethodChooser="() => state.choosePickingMethod = false"
					/>
				</div>
				<button v-if="order.status == 'ordered' && (order.picking_user == auth.getUserId() || auth.isAdmin())" 
					:disabled="amountOfItems().amount == 0" 
					@click="picked()">Verzameld</button>
				<!--<button v-if="state.order.status == 'payed'" @click="orderTaken()">Afgehaald</button>-->
				<button v-if="auth.isAdmin()" @click="state.editOrderModal = true">Wijzigen</button>
				<div class="modal-overlay" v-if="state.editOrderModal">
					<EditOrderInformation
						:order="order"
						@closeEditOrderModal="() => state.editOrderModal = false"
					/>
				</div>				
			</div>
			<ReceiptInformation 
				:order="order"
				/>
		</div>
	</div>	
</template>

<style lang="scss" scoped>
	.bon-container{
		width:100%;
		font-weight: 600;
	}
	.bon-container > .header{
		width: 100%;		
		display: flex;
		justify-content: center;
	}
	.header .time{
		font-size: 2rem;
	}
	.top-buttons{
		padding-bottom: 10px;
	}
	.top-buttons button{
		margin: 5px;
	}
	.chosen-order{
		background-color: #00a700;
		border-color: #00a700;

	}
	.picking-methods{
		width: 96%;
		height: 96%;
		left: 2%;
		top: 2%;
		background-color: #ffffff;
	}
	.edit-order{
		width: 96%;
		height: 96%;
		left: 2%;
		top: 2%;
		background-color: #ffffff;
	}
	.status{
		font-size: 2rem;
		padding-bottom: 10px;
	}
	.bon{
		width: inherit;
		margin-left: auto;
		margin-right: auto;
		border: 6px solid #e4e4e4;
		padding: 5px;
	}
@media (orientation: landscape){
}

@media (min-width: 481px){

/* 
  ##Device = Tablets, Ipads (portrait)
  ##Screen = B/w 768px to 1024px
*/
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
</style>
<!--
<script>
import {HTTP} from '@/assets/scripts/http-common.js';
import auth from '@/assets/scripts/auth'
import moment from 'moment';
import VueBarcode from 'vue-barcode';
//import Slick from 'vue-slick';
//import 'slick-carousel/slick/slick.css';
//import 'slick-carousel/slick/slick-theme.css';
//import Bonscan from '@/components/Bonscan.vue';
import ReceiptItem from '@/components/ReceiptItem.vue';
import ReceiptScan from '@/components/ReceiptScan.vue';
import ReceiptBags from '@/components/Receipt-extra-bags.vue';
import shoppingcart from '@/assets/icons/shopping-cart.svg'
import basket from '@/assets/icons/shopping-basket-solid.svg'
import productin from '@/assets/icons/product-in.svg'
import shoppingbag from '@/assets/icons/shopping-bag-solid.svg'
import rolcontainer from '@/assets/icons/rolcontainer.svg'
import rolmandje from '@/assets/icons/rolmandje.svg'

export default {
  name: 'Receipt',
  components: {
		'barcode': VueBarcode,
//		Slick,
		ReceiptItem: ReceiptItem,
		ReceiptBags
    },
  props: {
    order_id: Number
  },
	data: function () {
		return {
			publicPath: process.env.BASE_URL,
			auth: auth,
			orderProducts: null,
			crate: '',
			winkelbon: '',
			barcodeLoop: '',
			barcodeLoop2: [],
			barLoopCounter: 0,
			maxcounter: 0,			
			showModal1: false,
            slickOptions: {
                slidesToShow: 1,
                // Any other options that can be got from plugin documentation
            },
			6: [
				{"type":"small", "ean": '8710725038685'},
				{"type":"normal", "ean": '8710725030573'},
				{"type":"big", "ean": '8710725030566'},
				{"type":"freeze", "ean": '8710725038678'},
			],
			order: [],
			shoppingcart: shoppingcart,
			basket: basket,
			productin: productin,
			shoppingbag: shoppingbag,
			rolcontainer: rolcontainer,
			rolmandje: rolmandje,
			choosePickingMethod: false,
			chooseBags: false,
			bagalert: '',
			editmodal: false,
			rescanBarcode: false
		}
	},
	methods: {
	
		picked: function(){
			if(confirm("Klik op OK als alles is ingepakt")){
				var self = this
				this.item.status = "picked";
				var data = {
					type: "Verwerking",
					order: this.item,
					items: this.orderProducts,
					picker: localStorage.getItem('user_id')
				}
				HTTP.put(`/order/${this.item.order_id}`, data)
				.then((response) =>{
					console.log(response)
					self.$parent.getOrders('')
				})
				.catch((errors) => {
					console.log(errors)
				})
			}
		},
		scanned(){
			var self = this
			console.log(this.item)
			if(this.item.finalPrice == null || this.item.finalPrice == '0.00' || this.item.winkelbon == null || this.item.winkelbon == ""){
				alert("Voer boninformatie in.")
			}
			else{
				this.item.status = "scanned";
				var data = {
					type: "Scanned",
					order: this.item,
					items: this.orderProducts,
					picker: localStorage.getItem('user_id')
				}
				HTTP.put(`/order/${this.item.order_id}`, data)
				.then((response) =>{
					console.log(response)
					self.$parent.getOrders('')
				})
				.catch((errors) => {
					console.log(errors)
				})
			}
		},
		reject(){
			if(confirm("Weet u het zeker?")){
				this.item.status = "rejected"
				var data = {
					type: "Update",
					order: this.item,
					items: this.orderProducts
				}
				HTTP.put(`/order/${this.item.order_id}`, data)
				.then((response) =>{
					console.log(response)
				})
				.catch((errors) => {
					console.log(errors)
				})
			}
		},
		formattedDate:function(date){
			return moment(date).format('YYYY/MM/DD');
		},
		orderTaken: function(){
			var data = {
				type: "Afgehaald",
				order: this.item
			}
			HTTP.put(`/order/${this.item.order_id}`, data)
			.then((response) =>{
				console.log(response)
			})
			.catch((errors) => {
				console.log(errors)
			})
		},
		
		next() {
            this.$refs.slick.next();
        },

        prev() {
            this.$refs.slick.prev();
        },

        reInit() {
            // Helpful if you have to deal with v-for to update dynamic lists
            this.$nextTick(() => {
                this.$refs.slick.reSlick();
            });
        },

	},
	created(){
	},
	mounted(){
		this.getProducts(this.order_id)
		this.getOrder()
	},
	computed: {
		item: function(){
			return this.order
		},
		itemAmount: function(){
			var maxcounter = 0
			var amountpicked = 0
			if(this.orderProducts != null){
				this.orderProducts.forEach((element) => {
					maxcounter += element.amount
					amountpicked += element.picked
				});
			}
			return {"max": maxcounter, "amount": amountpicked}
		},
		filteredProducts:function()
		{
			var smallbag = '8710725038685' // max 8
			var bigbag = '8710725030573' //max 15
			var bigshopper = '8710725030566' //max 25
			var diepvries = '8710725038678' //max 4
			const prods = this.orderProducts
			const prodslist = []
			if(prods != null){
				prods.forEach(function(item){
					if(item.ean == smallbag || item.ean == bigbag || item.ean == bigshopper || item.ean == diepvries){
						prodslist.unshift(item);
					}
					else{
						if(item.picked <= item.amount){
							prodslist.push(item)
						}
					}
				});
				
			}
			return prodslist
		},
		filteredEan:function()
		{
			const prods = this.orderProducts
			const prodslist = {}
			if(prods != null){
				prods.forEach(function(item){
					if(item.picked != item.amount){
						prodslist[item.ean] = item
					}
				});
				
			}
			return prodslist
		},
		filteredDoneProducts:function()
		{
			//var smallbag = '8710725038685'
			//var bigbag = '8710725038678'
			const prods = this.orderProducts
			const prodslist = []
			if(prods != null){
				prods.forEach(function(item){
					if(item.picked >= item.amount){						
						prodslist.push(item)
					}
				});
				
			}
			return prodslist
		}
	},
	watch:{
		item:{
			deep: true,
			handler(){
				if(this.item.winkelbon == "null" || this.item.winkelbon == null){
					this.item.winkelbon = "";
				}
			}
		},
		'$store.state.pickingMethod':{
			immediate: true,
			deep: true,
			handler(){
				var method = this.$store.state.pickingMethod
				this.crate = method
			}
		},
	}
}
</script>
-->
<!-- Add "scoped" attribute to limit CSS to this component only 
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.bon{
	width: 100%;
	margin-left: auto;
	margin-right: auto;
	border: 6px solid #E4E4E4;
	padding: 5px;
}
.bon .header{
	width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    max-height: 100px;
}
.bon .header > *{
	width: 25%;
}
.bon .header > h1{
	width: 50%;
}
.bon .header h2{
	display: flex;
    font-weight: 600;
    flex-wrap: nowrap;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-content: center;
}
.bon .header img{
	height: 100%;
	width: auto;
}


@media (max-width: 575px){
	.bon-container{
		min-width: 90%;
	}
}
.crate{
	display: inline-flex;
	margin-left: auto;
	margin-right: auto;
	width: 50%;
}
.crate h3{
	margin: 5px;
}
.crate input{
	width: inherit;
}

.eanrow{
	width: 100%;
	display: inline-flex;
	padding: 3px;
    word-break: break-all;
}
.inforow{
	display: flex;
	width: 100%;
}
.product{
	font-size: 0.9rem;
    display: inline-block;
	padding:20px 15px;
    width: 100%;
	border-bottom: 4px dotted #8f8f8f;
}
.product span{
    display:block;
    width: 100%;
	box-sizing: border-box;
	font-size: 1.1rem;
}
.product img{
    width: 90%;
    position: relative;
    display: block;
	margin-left: auto;
    margin-right: auto;
}

.itembrand{
    width: 100%;
    height: 15%;
    display: block;
    font-size: 0.6rem;
}
.price{
    color: #ffffff;
    margin: 0;
    font-size: 0.9rem;
    height: 20%;
    display: block;
}

.discounted {
    color: red;
}

.shelfunit{
	width:100%;
}
.itemprice{
	background-color: #888888;
    background: -moz-linear-gradient(top, #444444 0%, #5c5c5c 13%, #5c5c5c 85%, #888888 100%);
    background: -webkit-linear-gradient(top, #444444 0%,#5c5c5c 13%,#5c5c5c 85%,#888888 100%);
    background: linear-gradient(to bottom, #444444 0%,#5c5c5c 13%,#5c5c5c 85%,#888888 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#444444', endColorstr='#888888',GradientType=0 );
   /* border-bottom: #000000 solid; */
    color: #efefef;
	height: 25%;
	border-left: none;
    border-right: none;
    border-radius: unset;
	font-size: 1.2rem;
}

.itemprice:hover{
	background-color: #888888;
    background: -moz-linear-gradient(top, #505050 0%, #5c5c5c 13%, #888888 85%, #cccccc 100%);
    background: -webkit-linear-gradient(top, #505050 0%,#5c5c5c 13%,#888888 85%,#cccccc 100%);
    background: linear-gradient(to bottom, #505050 0%,#5c5c5c 13%,#888888 85%,#cccccc 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#505050', endColorstr='#cccccc',GradientType=0 );
}
.discount .itemprice{
	color: red;
}

.modal-footer .btn{
	
    background: #ffffff;
    margin-left: -5px;
    -webkit-box-shadow: 6px 10px 5px 0px rgba(0,0,0,0.75);
    box-shadow: 3px 3px 3px 0px rgba(0,0,0,0.6);
    color: #ee151e;
	margin: 10px;
	font-weight:600;
}
.modal-dialog .modal-footer{
	background-color: #dddddd;
}

.code{
	height: 100%;
	width: 100%;
}

</style>
<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
	display: flex;
    padding-top: 20px;
    width: 90%;
    position: fixed;
    margin-left: 5%;
    margin-right: 5%;
    max-height: 90%;
}

.modal-container {
    width: 100%;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 33%);
    transition: all 0.3s ease;
    font-family: Helvetica, Arial, sans-serif;
    overflow-y: scroll;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}
.modal-header{
	margin-left: auto;
    margin-right: auto;
    max-width: 50%;
}

.modal-body {
    margin: 20px 0;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
    max-height: 500px;
    overflow-y: scroll;
	overflow-x: hidden;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.slick-slider{	
    margin-left: auto;
    margin-right: auto;
}

.product-modal{
	width: 100%;
    display: block;
}
.productlist-modal{
	width: 100%;
    display: block;
}
.list{
	max-height: 50%;
	overflow-x: hidden;
}

.back-btn{
    background-color: #f9f9f9;
    color: red;
    font-size: x-large;
    font-weight: 700;
	display: inline;
}
.next-btn{
    background-color: #f9f9f9;
    color: red;
    font-size: x-large;
    font-weight: 700;
	display: inline;
}
.btn {
  text-decoration: none;
  display: inline-block;
  padding: 8px 16px;
}

.btn:hover {
  background-color: #ddd;
  color: black;
}

.previous {
  background-color: #f1f1f1;
  color: black;
}

.nextbtn {
  background-color: #f1f1f1;
  color: black;
}

.round {
  border-radius: 50%;
}
.btns{
    z-index: 100;
    display: block;
    width: 100%;
}
.close-btn{
	position: absolute;
	top: 25px;
	right:10px;
	
}
.noItem{
	background-color: #888888;
    background: -moz-linear-gradient(left, #ff0000 0%, #ff0000 4%, #e3e3e3 5%,#e3e3e3 85%, #e3e3e3 100%);
    background: -webkit-linear-gradient(left, #ff0000 0%,#ff0000 4%, #e3e3e3 5%, #e3e3e3 85%, #e3e3e3 100%);
    background: linear-gradient(to right, #ff0000 0%,#ff0000 4%,#e3e3e3 5%,#e3e3e3 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ff0000', endColorstr='#e3e3e3',GradientType=0 );
	color: black;
	background-color: red;
}
.someItems{
	background-color: #888888;
    background: -moz-linear-gradient(left, #ff9000 0%, #ff9000 4%, #e3e3e3 5%, #e3e3e3 85%, #e3e3e3 100%);
    background: -webkit-linear-gradient(left, #ff9000 0%,#ff9000 4%,#e3e3e3 5%,#e3e3e3 100%);
    background: linear-gradient(to right, #ff9000 0%,#ff9000 4%, #e3e3e3 5%, #e3e3e3 85%,#e3e3e3 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#e3e3e3', endColorstr='#e3e3e3',GradientType=0 );
	color: black;
	background-color: orange;
}
.pickedItems{

	background-color: #888888;
    background: -moz-linear-gradient(left, #0baf00 0%, #0baf00 4%, #e3e3e3 5%, #e3e3e3 85%, #e3e3e3 100%);
    background: -webkit-linear-gradient(left, #0baf00 0%,#0baf00 4%, #e3e3e3 5%, #e3e3e3 85%,#e3e3e3 100%);
    background: linear-gradient(to right, #0baf00 0%,#0baf00 4%, #e3e3e3 5%, #e3e3e3 85%,#e3e3e3 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#0baf00', endColorstr='#e3e3e3',GradientType=0 );
	color: black;
	background-color: green;
}
.amount{	
		padding: 0;
		font-size: 1.3rem;
		font-weight: 700;
}
.noItem .amount,
.someItems .amount
{
	color: red;
}

.info{
	display: flex;
}
.title{
	font-weight: 800;
}
.top{
	display: inline-grid;
	width: 100%;
}
.totalprice{
	margin: 5px;
	width: 100%;
	display: flex;
}
.totalprice .col-6{
	width: 50%;
	margin: 5px;
}
.totalprice .col-6 input{
	width: 50%;
}
.bonnr{
	margin: 5px;
	width: 100%;
	display: flex;
}
.bonnr .col-6{
	width: 50%;
	margin: 5px;
}
.bonnr .col-6 input{
	width: 100%;
}
button{
	margin: 10px;
    margin-top: 5px;
    border-radius: 5px;
    background: #ffa500;
    -webkit-box-shadow: 6px 10px 5px 0px rgb(0 0 0 / 75%);
    box-shadow: 4px 4px 3px 0px rgb(0 0 0 / 40%);
    color: #ffffff;
    border: 2px solid #ffa500;
	font-size: 1.2rem;
}
.info .data{
	width: 50%;
}
.info .img{
	width: 50%;
}
.removebtn{
	color: black;
	background-color: #eeeeee;
	border:  none;
}
.removebtn.errbtn{
	background-color: #ee151e;
	color: white !important;
}
.chosenorder{
	background-color: #0baf00;
    border: 2px solid #0baf00;
}
.topbuttons{
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: center;
    justify-content: center;
	width: 100%;
}
.topbuttons .btn{
	font-size: 1.5rem;
	font-weight: 600;
	max-width: 48%;
}
.time{
	font-size: 2rem;
	font-weight: 600;
}
.modaloverlay{
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(165,165,165,0.5);
	z-index: 199;
}
.pickingchooser{	  
	position: fixed;
    display: flex;
    width: 96%;
    height: 96%;
    left: 2%;
    top: 2%;
    background: white;
    z-index: 200;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-around;
    align-content: center;
    padding: 15px;
}
.pickingchooser .methodes{    
	display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    width: 100%;
    height: 80%;
    justify-content: space-around;
}
.pickingchooser .methodes .methode{
	width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
}
.pickingchooser .methodes .methode .btn{
	width: 100%;
	aspect-ratio: 1;
	max-width: 48%;
	padding: 0;
}
.pickingchooser .methodes .methode .btn img{
	width: 100%;
	height: 100%;
}

.pickingchooser .methodes .methode h3{
    font-size: 1rem;
    font-weight: 600;
}
.bags{    
	display: flex;
    width: 100%;
    flex-direction: row;
    justify-content: flex-end;
}
.bags .btn{
	width: 20%;
	padding: 0;
}
.bags .btn img{
	width: 100%;
	height: auto;
}

.bagchooser{
	position: fixed;
    display: flex;
    width: 96%;
    height: 96%;
    left: 2%;
    top: 2%;
    background: white;
    z-index: 200;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    align-content: center;
    padding: 15px;
}
.extrabags{    
	display: flex;
    flex-direction: row;
    align-items: flex-start;
    align-content: stretch;
    width: 100%;
    height: 80%;
    justify-content: flex-start;
    flex-wrap: wrap;
}
.extrabags .bag{
	display: flex;
    flex-direction: column;
    align-items: center;
    align-content: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    width: 50%;
    height: 40%;
}
.productamount{    
	display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    align-content: center;
}
.bon .header .picktype{
	width: 25%;	
    margin-top: auto;
    margin-bottom: auto;
}
.bon .header .picktype img{
	height: auto;
	width: 70%;
}
.bon .header .productamount img{    
	display: block;
	width: 70%;
}
.moreproducts{
	color: red;
}

.editmodal{
	position: fixed;
    display: flex;
    width: 96%;
    height: 96%;
    left: 2%;
    top: 2%;
    background: white;
    z-index: 200;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    align-content: center;
    padding: 15px;
}
.editmodal .productlist{
	max-height: 80%;
    overflow-y: scroll;
    width: 100%;
    padding-left: 10px;
    padding-right: 15px;
}
.editmodal .productlist p{
	font-size: 2rem;
	font-weight: 600;
}

.editmodal .productlist .product{
    display: flex;
    width: 100%;
    font-size: 1.2rem;
    font-weight: 600;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    border-bottom: 1px solid #d3d3d3;
    align-content: center;
    flex-wrap: wrap;
}
.editmodal .productlist .product .title{
	width: 100%;
	font-size: 1.5rem;
}
.editmodal .productlist .product .ean{
	font-size: 1.4rem;
	color: red;
}
.editmodal .productlist .product .part{
	width: 50%;
}
.editmodal .productlist .product .part.selectbutton{
    height: 100%;
    display: block;
    margin-top: auto;
	font-size: 1.2rem;
	padding: 3px 5px;
}
.editmodal .productlist .product .part.selectbutton .btn{
	margin-bottom: 5px;
}	
.barcodeoverlay .title{
	font-size: 2rem;
}
.product .modaloverlay{
	z-index: 249;
}
.barcodeoverlay{
    z-index: 250;
    bottom: 0;
    position: fixed;
    visibility: visible;
    width: 96%;
    height: 96%;
    left: 2%;
    top: 2%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
	background: #ffffff;
}
@media only screen and (max-width:767px) {	
	.editmodal .productlist .product{
		flex-direction: column;
	}
	.editmodal .productlist .product .title{
		width: 100%;
		font-size: 1.5rem;
	}
	.editmodal .productlist .product .ean{
		width: 100%;
	}
	.editmodal .productlist .product .part{
		font-size: 1.2rem;
		width: 100%;
	}
	.editmodal .productlist .product .part.selectbutton{
		height: 100%;
		display: block;
		margin-top: auto;
		font-size: 1.2rem;
		padding: 3px 5px;
	}
	.editmodal .productlist .product .part.selectbutton .btn{
		margin-bottom: 5px;
	}	
}

@media screen and (orientation: landscape){
	.pickingchooser h2{
		font-size: 2rem;
	}
	.pickingchooser .methodes {
		height: unset;
	}

	.pickingchooser .methodes .methode {
		max-height: 50%;
		max-width: 50%;
	}
	.bon .header > *{
	}
	.bon .header > .productamount {
		display: flex;
		flex-direction: row;
		align-items: flex-end;
		justify-content: flex-start;
		flex-wrap: wrap;
		align-content: center;
		width: 25%;
	}
	.bon .header .productamount img{
		width: 50%;
		height: auto;
	}

	.bon-block.singlebon{
	}

	.bon-block.doublebon{
	}

	.bon-block.triplebon .topbuttons,
	.bon-block.triplebon .topbuttons .btn{
		max-width: 100%;
	}

	
	.extrabags .bag{
		height: unset;
	}
}
@media (orientation: portrait) and (min-width: 575px){	
}
@media (orientation: landscape) and (min-width: 740px) and (min-height: 575px){

}
@media screen and (orientation: landscape) and (max-height:480px){
	.pickingchooser{
		flex-direction: column;
		align-items: flex-start;
		justify-content: space-between;
		align-content: stretch;
		flex-wrap: wrap;
	}
	.pickingchooser .methodes {
		width: 50%;
	}
	
	.pickingchooser .methodes .methode div {
		display: none;
	}
	
	.pickingchooser .methodes .methode .btn {
		max-width: 60%;
		width: inherit;
	}

	.pickingchooser h2{
		font-size: 1.5rem;
		width: 50%;
		margin-bottom: 0;
	}
	
	.pickingchooser h2:last-of-type{
		height: 50%;
	}
	
	.bon-block.triplebon .bon .header{
		width: 100%;
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		max-height: unset;
		align-content: center;
	}
	.bon-block.triplebon .bon .header .picktype{
		width: 50%;
	}	
	.bon-block.triplebon .bon .header > h1{
		width: 100%;
	}
}
</style>-->