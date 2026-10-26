<template>
	<div class="receiptscan">
		<div class="modal-wrapper">
			<div class="modal-container">

				<div class="modal-header">
					<slot name="header">						
						<button class="close-btn" @click="showModal1 = false">
							Sluiten
						</button>
					</slot>
				</div>

				<div class="modal-body">
					<slot name="body">			
						<slick
							ref="slick"
							:options="slickOptions"
							@afterChange="handleAfterChange"
							@beforeChange="handleBeforeChange"
							@breakpoint="handleBreakpoint"
							@destroy="handleDestroy"
							@edge="handleEdge"
							@init="handleInit"
							@reInit="handleReInit"
							@setPosition="handleSetPosition"
							@swipe="handleSwipe"
							@lazyLoaded="handleLazyLoaded"
							@lazyLoadError="handleLazeLoadError">
							<div class="product-modal" v-for="(products, index) in receipt" v-bind:key="products.ean + '-' + index">				
			<!-- Group by product categorie -->
									<div class="eanrow"><span class="ean" v-if="products.ean != null">{{products.ean}}</span></div>
									<div class="eanrow"><span class="ean" v-if="products.title != null">{{products.title}}</span></div>
										
									<barcode v-bind:value="products.ean" ref="barcode" :options="{height: 150}">
										Show this if the rendering fails.
									</barcode>
								<hr>
								{{index+1}}/{{receipt.length}}
							</div>
							<div class="product-modal-end">	
								<h2>Controlleer of alle producten zijn gescand en voer de gegeven Kassa Bonnummer in.</h2>
							</div>
						</slick>
					</slot>
				</div>

				<div class="modal-footer">
					<slot name="footer">
					
						<div class="btns">
							<div class="back-btn">
								<button @click="prev()" :disabled="page == 0" class="btn previous round">&#9665;</button>
							</div>									
							<button class="" @click="showModal1 = false">
								Sluiten
							</button>
							<div class="next-btn">
								<button @click="next()" class="btn nextbtn round">&#9655;</button>
							</div>
						</div>
					</slot>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {HTTP} from '@/assets/services/http-common.js';
import moment from 'moment';
import VueBarcode from 'vue-barcode';
import Slick from 'vue-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Bonscan from '@/components/Bonscan.vue';

export default {
  name: 'HelloWorld',
  components: {
		'barcode': VueBarcode,
		Slick
    },
  props: {
    receipt: Array
  },
	data: function () {
		return {
		}
	},
	methods: {		
		show () {
			this.$modal.show(
				Bonscan,
				{item: this.item},
				{draggable: false}
			)
		},
		closeModal() {
			this.show = false;
			document.querySelector("body").classList.remove("overflow-hidden");
		},
		openModal() {
			this.show = true;
			document.querySelector("body").classList.add("overflow-hidden");
		},
		unescape: function(html){
			var txt = document.createElement('textarea');
			txt.innerHTML = html;
			return txt.value;
		},
		async loopBarcode(){
			var self = this
			this.barLoopCounter = 0
			this.maxcounter = 0
			this.orderProducts.forEach((element) => {
				self.maxcounter += element.picked
			});
			self.barcodeLoop = "0"
			self.$refs.barcode.$forceUpdate()
			await this.sleep(4000);
			
			for (let i = 0; i < this.orderProducts.length; i++) {
				for (let step = 0; step < this.orderProducts[i].picked; step++) {
					for (let step1 = 0; step1 < 2; step1++) {
						if(step1 == 0){
							self.barcodeLoop = "1"
							self.$refs.barcode.$forceUpdate()
						}
						else{
							self.barcodeLoop = this.orderProducts[i].ean
							self.barLoopCounter += 1
							self.$refs.barcode.$forceUpdate()
						}
						await this.sleep(1000);
					}
				}
			}
			
			self.barcodeLoop = "2"
			self.$refs.barcode.$forceUpdate()
			await this.sleep(2000);
		},
		generateItemList: function(){
			this.barcodeLoop2 = []
			for (let i = 0; i < this.orderProducts.length; i++) {
				for (let step = 0; step < this.orderProducts[i].picked; step++) {
					this.barcodeLoop2.push(this.orderProducts[i])
				}
			}
		},
		sleep: function(ms){
			return new Promise(resolve => setTimeout(resolve, ms));
		},
		getProducts: function(order){
			//const url = `${API_URL}/order/product/`+order;
			HTTP.get('/order/product/'+order)
			.then((response) => {
			console.log(response.data.docs)
				this.orderProducts = response.data.docs
			})
			.catch((errors) => {
				console.log(errors)
			})
		},
		even: function() {
			// Set slice() to avoid to generate an infinite loop!
			return this.productList.slice().sort(function(a, b) {
				return a.schapplaats - b.schapplaats;
			});
		},
		calculatePrice: function (item){
			var calcPrice;
			
			calcPrice = parseFloat(item.price).toFixed(2);
			//calcPrice = (calcPrice * (1-(parseFloat(item.hasflyeroffer)/100))).toFixed(2);
			return calcPrice;
		},
		onChange: function(evt){
			console.log(evt)
			for(var item in this.productList){
				this.productList[item].schapplaats = item
				this.updateProduct(this.productList[item])
			}			
		},
		addItem: function(ean){
			console.log(ean)
			for(var product in this.orderProducts){
				if(this.orderProducts[product].ean == ean){
					this.orderProducts[product].picked += 1
					if(this.orderProducts[product].picked == this.orderProducts[product].amount){
						alert("aantal correct")
					}
				}
			}
		},
		multiAlert: function(prod){
			if(prod.amount > 1 && prod.picked == 0){
				alert("Let op: dit product " + prod.amount + " keer")
			}
		},
		updateOrder: function(){
			console.log(this.$props.item)
			var data = {
				type: "Update",
				order: this.$props.item,
				items: this.orderProducts
			}
			HTTP.put(`/order/${this.$props.item.order_id}`, data)
			.then((response) =>{
				console.log(response)
			})
			.catch((errors) => {
				console.log(errors)
			})
		},
		updateOrderBon: function(){
			if(this.$props.item != null){
				this.updateOrder()
			}
		},
		picked: function(){
			var self = this
			console.log(this.$props.item)
			if(this.$props.item.finalPrice == null || this.$props.item.finalPrice == '0.00' || this.$props.item.winkelbon == null || this.$props.item.winkelbon == ""){
				alert("Voer boninformatie in.")
			}
			else{
				var data = {
					type: "Verwerking",
					order: this.$props.item,
					items: this.orderProducts,
					picker: localStorage.getItem('user_id')
				}
				HTTP.put(`/order/${this.$props.item.order_id}`, data)
				.then((response) =>{
					console.log(response)
					self.$parent.getOrders()
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
				order: this.$props.item
			}
			HTTP.put(`/order/${this.$props.item.order_id}`, data)
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

        // Events listeners
        handleAfterChange(event, slick, currentSlide) {
            console.log('handleAfterChange', event, slick, currentSlide);
        },
        handleBeforeChange(event, slick, currentSlide, nextSlide) {
            console.log('handleBeforeChange', event, slick, currentSlide, nextSlide);
        },
        handleBreakpoint(event, slick, breakpoint) {
            console.log('handleBreakpoint', event, slick, breakpoint);
        },
        handleDestroy(event, slick) {
            console.log('handleDestroy', event, slick);
        },
        handleEdge(event, slick, direction) {
            console.log('handleEdge', event, slick, direction);
        },
        handleInit(event, slick) {
            console.log('handleInit', event, slick);
        },
        handleReInit(event, slick) {
            console.log('handleReInit', event, slick);
        },
        handleSetPosition(event, slick) {
            console.log('handleSetPosition', event, slick);
        },
        handleSwipe(event, slick, direction) {
            console.log('handleSwipe', event, slick, direction);
        },
        handleLazyLoaded(event, slick, image, imageSource) {
            console.log('handleLazyLoaded', event, slick, image, imageSource);
        },
        handleLazeLoadError(event, slick, image, imageSource) {
            console.log('handleLazeLoadError', event, slick, image, imageSource);
        },
		checkBon: function(){
			console.log(this.item.winkelbon)
			if(this.item.winkelbon == "null" || this.item.winkelbon == null){
				this.item.winkelbon = "";
			}
		}
	},
	created(){
	},
	mounted(){
	},
	computed: {
		
	},
	watch:{	
	}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
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

.bon-container{
	width:100%;
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
.top button{
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
	padding:5px;
    width: 100%;
	border-bottom: 2px dotted #ececec;
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
	widht: 100%;
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
	display: block;
    padding-top: 20px;
    width: 90%;
    position: fixed;
    margin-left: 5%;
    margin-right: 5%;
    max-height: 90%;
}

.modal-container {
    width: 80%;
    margin: 0px auto;
    padding: 20px 30px;
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
.next-btn .btn{
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
.info{
	display: flex;
}
.title{
	font-weight: 800;
}
.top{
	display: inline-grid;
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
</style>