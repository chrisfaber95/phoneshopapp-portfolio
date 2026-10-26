<template>
	<div class="scanner">
		<Header />
		<qrcode-stream :camera="camera" @decode="onDecode" @init="onInit"></qrcode-stream>
		<div class="modaloverlay" v-if="modalOpened" @click="fade(); order = null; qrcode = ''"></div>		
		<div class="scan-modal" v-if="order && modalOpened">		
			<b-button class="btn closebtn" @click="fade()" >X</b-button>	
			<div class="modal-body">
				<slot name="body">
					<div class="bondata">
						<p>Status:
							<b v-if="item.status == 'ordered'">Besteld</b>
							<b v-if="item.status == 'picked'">Verpakt</b>
							<b v-if="item.status == 'scanned'">Verwerkt bij de kassa</b>
							<b v-if="item.status == 'payed' && item.paycode">Betaald</b>
							<b v-if="item.status == 'afgehaald'">Afgehaald</b>
							<b v-if="item.status == 'rejected'">Geannuleerd</b></p>
						<p>Afhaaltijd: {{item.pickupTime}}</p>	
						<p>ID check: {{updatingIdCheck}}</p>
						<i v-if="id_checked != ''">Leeftijd: {{formatDate(id_checked)}}</i>
						<div class="modaloverlay" v-if="this.id_check && this.id_checked == ''"></div>
						<div class="id-check" v-if="this.id_check && this.id_checked == ''">
							<h2>ID controle</h2>					
							<b-form-group id="input-group-5" label="Leeftijd:" label-for="input-5">
								<datetime v-model="id_checked" placeholder="Leeftijd" ></datetime>
							</b-form-group>
						</div>
					</div>
					<div class="orderinfo">
						<div class="ordernumber">NR. {{item.order_id}}</div>						
						<div class="bags" v-if="filteredBags.length > 0">
							<p>Magazijn: {{bagCount(0)}}</p>
							<p>Diepvries: {{bagCount(1)}}</p>
						</div>
					</div>
					<div class="customerinfo">
						<p v-if="item.winkelbon">Winkelbon:</p>						
						<barcode v-bind:value="item.winkelbon" ref="barcode" :options="{height: 150}">
							Geen barcode beschikbaar
						</barcode>
					</div>
					<div class="buttons">
						<b-button v-if="item.status == 'payed' && item.paycode" @click="finishOrder()">Afgehaald</b-button>
						<b-button v-if="item.status == 'scanned'" @click="storePayment()">Winkel betaling</b-button>
						<b-button v-if="auth.isAdmin() && item.status != 'afgehaald'" @click="declineOrder()">Annuleren</b-button>
					</div>
				</slot>
			</div>
		</div>
		<!--<p class="decode-result">Last result: <b>{{ result }}</b></p>-->
	</div>
</template>

<script>
// @ is an alias to /src
import {HTTP} from '@/assets/services/http-common.js';
import _ from "lodash";
import { QrcodeStream } from 'vue-qrcode-reader'
import Header from '@/components/Basics/Header.vue'
import VueBarcode from 'vue-barcode';
import auth from '@/assets/services/auth'

import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'

export default {
	name: 'Home',
	components: {
		datetime: Datetime,
		QrcodeStream,
		Header,
		'barcode': VueBarcode
	},
	data: function () {
		return {
			auth: auth,
			isValid: undefined,
			qrcode: "",
			order: null,
			modalOpened: false,
			camera: 'auto',
			result: null,
			bagtypes: [
				{"type":"small", "ean": '8710725038685'},
				{"type":"normal", "ean": '8710725030573'},
				{"type":"big", "ean": '8710725030566'},
				{"type":"freeze", "ean": '8710725038678'},
			],
			orderProducts: [],
			id_check: false,
			id_checked: ''
		}
	},
	methods: {
		formatDate(date){
			return date.split('T')[0]
		},
		bagCount(type){
			var count = 0
			if(type==0){
				this.filteredBags.forEach(element => {
					if(element.ean != this.bagtypes[3].ean){
						count += element.picked
					}
				});
			}
			else if(type==1){
				this.filteredBags.forEach(element => {
					if(element.ean == this.bagtypes[3].ean){
						count += element.picked
					}
				});
			}
			return count
		},
		onInit (promise) {
		promise
			.catch(console.error)
			.then(this.resetValidationState)
		},
		fade() {
			this.modalOpened = !this.modalOpened
		},
		enter() {
			setTimeout(function() {
				this.modalOpened = false;
				}, 1500);
		},
		getOrders: function(orderid) {
			HTTP.get('order/single/'+orderid)
			.then((response) => {
			console.log(response.data.docs)
				this.order = response.data.docs[0]
			})
			.catch((errors) => {
				console.log(errors)
			})
		},		
		getProducts: function(order){
			//const url = `${API_URL}/order/product/`+order;

			HTTP.get('/order/product/'+order)
			.then((response) => {
				console.log(response)
				this.orderProducts = response.data.docs
			})
			.catch((errors) => {
				console.log(errors)
			})
		},
		onDecode (decodedString) {
			this.result = decodedString
			this.turnCameraOff()
			if(!this.modalOpened){
				this.qrcode = decodedString
				this.getOrders(decodedString)
			}
		},
		turnCameraOn () {
			this.camera = 'auto'
		},

		turnCameraOff () {
			this.camera = 'off'
		},
		finishOrder: function(){
			console.log(this.order)
			var data = {
				type: "Afgehaald",
				order: this.order
			}
			HTTP.put(`/order/${this.order.order_id}`, data)
			.then((response) =>{
				console.log(response)
				this.fade()
				this.getOrders(this.result)
			})
			.catch((errors) => {
				console.log(errors)
			})
		},
		storePayment: function(){
			console.log(this.order)
			var data = {
				type: "Storepayment",
				order: this.order,
				picker: localStorage.getItem('user_id')
			}
			HTTP.put(`/order/${this.order.order_id}`, data)
			.then((response) =>{
				console.log(response)
				alert("Bestelling is afgehaald")
				this.fade()				
			})
			.catch((errors) => {
				console.log(errors)
			})
		},
		declineOrder: function(){
			console.log(this.order)
			var data = {
				type: "Annuleren",
				order: this.order
			}
			HTTP.put(`/order/${this.order.order_id}`, data)
			.then((response) =>{
				console.log(response)
			})
			.catch((errors) => {
				console.log(errors)
			})
		},
		timeout (ms) {
			return new Promise(resolve => {
				window.setTimeout(resolve, ms)
			})
		}
	},
	created(){
	},
	computed: {
		item: function(){
			console.log(this.order)
			return this.order
		},
		filteredBags: function(){
			const prods = this.orderProducts
			const prodslist = []
			if(prods != null){
				prods.forEach((item) =>{
					if(item.ean == this.bagtypes[0].ean || item.ean == this.bagtypes[1].ean || item.ean == this.bagtypes[2].ean || item.ean == this.bagtypes[3].ean){
						prodslist.push(item);
					}
				});
				
			}
			return prodslist
		},
		filteredOrders:function()
		{
			return this.order
		},
		filteredQR:function()
		{
			return this.qrcode
		},
		filteredProducts:function()
		{
			return this.orderProducts
		},
		validationPending () {
		return this.isValid === undefined
			&& this.camera === 'off'
		},

		validationSuccess () {
		return this.isValid === true
		},

		validationFailure () {
		return this.isValid === false
		},
		updatingIdCheck(){
			if(this.id_check){
				return "JA"
			}
			else{
				return "NEE"
			}
			
		}
	},
	watch: {
		orderDate: function(){
			if(this.orderDate){
				this.getOrders(this.orderDate.split("T")[0])
			}
		},
		currentitem: _.debounce(function(){
			this.receiptItem()}, 200)
		,
		currentcrate: _.debounce(function(){
			this.receiptCrate()
		}, 200),
		modalOpened: function(){
			if(!this.modalOpened){
				this.qrcode = ""
				this.order = null
				this.turnCameraOn()
				this.result = null
			}
			console.log(this.$data)
		},
		order: function(){
			if(this.order.order_id){		
				this.fade()
				this.getProducts(this.order.order_id)
			}
		},
		orderProducts: function(){
			this.orderProducts.forEach(element => {
				if(element.categoryname1 == "wijn_bier_en_sterke_drank"){
					this.id_check = true
				}
			});
		}
	},
	mounted(){
	}
}
</script>
<style scoped>
.modaloverlay{
	position: fixed;
	width: 100vw;
	height: 100vh;
	top: 0;
	left: 0;
	background-color: #99999999;	
	z-index: 100
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s
}

.fade-enter,
.fade-leave-to
{
  opacity: 0
}
.scan-modal{
    -webkit-box-shadow: 4px 5px 4px 0px rgb(0 0 0 / 30%);
    box-shadow: 4px 5px 4px 0px rgb(0 0 0 / 30%);	
    background-color: #ffffff;
    height: 96vh;
    display: block;
    overflow-y: scroll;
    z-index: 100000;
    position: fixed;
    top: 2vh;
    width: 96vw;
	left: 2vw;
}
.closebtn{
	z-index:49;
	position: absolute;
    right: 5px;
    top: 5px;
    font-size: 1.5rem;
    padding: 0px 5px;
	background-color: #ffa500;
	color: white;
    -webkit-box-shadow: 6px 10px 5px 0px rgb(0 0 0 / 75%);
    box-shadow: 4px 4px 3px 0px rgb(0 0 0 / 40%);
    color: #ffffff;
    border: 2px solid #ffa500;
}
.bondata{    
	width: 85%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
}
.bondata p{
	font-weight: 600;
	font-size: 1.5rem;
}
.orderinfo{
	width: 100%;
	display: flex;
}
.orderinfo div{
	width: 50%;
}
.orderinfo .ordernumber{
	white-space: pre-line;
    font-size: 2.5rem;
    background: #ffa500;
    color: #ffffff;
    border-radius: 10px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    align-content: center;
}
.orderinfo .bags{
	font-weight: 600;
	font-size: 1.5rem;
}
.customerinfo p{
	margin: 0;
    padding: 0;
    margin-top: 10px;
    font-weight: 600;
}

.buttons{
	display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-around;
}

.buttons .btn{
	max-width: 49%;
}

 .btn{
	background-color: orange;
	color: #f8f8f8;
	font-size: 1.5rem;
	font-weight: 600;
	padding: 15px;
    -webkit-box-shadow: 6px 10px 5px 0px rgb(0 0 0 / 75%);
    box-shadow: 4px 4px 3px 0px rgb(0 0 0 / 40%);
    color: #ffffff;
    border: 2px solid #ffa500;
}

@media (min-width: 575px) {
	.btn{
		font-size: 2.5rem;
	}
}
.id-check{
	position: absolute;
	display: flex;
	width: 96%;
	height: 96%;
	background-color: #ffffff;
	z-index: 200;
	flex-direction: column;
    align-items: center;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
}

@media screen and (orientation: landscape) and (max-height:480px){
	.modal-body{
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		align-content: center;
		padding: 10px;
	}
	.bondata{
		width: 50%;
	}
	.orderinfo{
		width: 50%;
	}
	.btn{
		font-size: 2rem;
		padding: 5px;
	}
	.customerinfo{
		width: 50%;
	}
	.buttons{
		width: 50%;
	}
	.buttons .btn {
		max-width: unset;
	}
}
</style>