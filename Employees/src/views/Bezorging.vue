<template>
	<div class="delivery-screen">
		<div class="screen">
			<OrderSearch ref="ordersearch" @changeOrderDate="(callback) => state.orderDate = callback" />
			<div class="bonnen">				
				<Receipt class="bon-block" 
					v-for="(order) in filteredOrders" 
					:key="order.id+'row'" 
					v-bind:class="[{'singlebon': state.receiptAmount== 1},{'doublebon': state.receiptAmount== 2},{'triplebon': state.receiptAmount== 3}]"				
					:order="order" />
			</div>
		</div>
		<Header />
	</div>
</template>

<script setup>
// @ is an alias to /src
	import { reactive, watch, computed } from 'vue'
	import {HTTP} from '@/assets/services/http-common.js';
	import OrderSearch from '@/components/CollectingScreen/OrderSearch.vue';
import Receipt from '@/components/BezorgingScreen/Order.vue'
	import Header from '@/components/Basics/Header.vue'
import moment from 'moment';

	const state = reactive({
			refundAmount: 0,
			refund: null,
			orderProducts: null,
			page: 0,
			currentcrate: '',
			currentitem: '',
			receipts: 3,		

			orderDate: null,
			receiptAmount: 1,
			orders: []
		})
	function getOrders(date) {
		console.log(date)
		if(date == ''){
			date = formattedDate(state.orderDate)
		}
		const params = {
			0: [{
				filterType: 'and',
				value: [
					{
						pickupDate: date
					}
				],
				}
			],
			1: [{
				filterType: 'and',
				value: [
					{
						status: {
							filterType: 'notLike',
							value: 'pending'
						}
					}
				]}
			]
		}
		HTTP.get(`order`, {params})
		.then((response) => {
			console.log(response)
			state.orders = response.data
		})
		.catch((errors) => {
			console.log(errors)
		})
	}
		function formattedDate(date){
			return moment(date).format('YYYY/MM/DD');
		}

		const filteredOrders = computed(() => {
			var list = []
			var allOrders
			allOrders = state.orders.filter(e => e.status != 'afgehaald' && e.delivery == true);
			allOrders.sort(function (a, b) {
				return a.pickupTime.localeCompare(b.pickupTime);
			});
			console.log(allOrders)
			//list = allOrders.slice(state.page * state.receiptAmount, (state.page * state.receiptAmount + state.receiptAmount))
			console.table(list)
			return allOrders;
		})

	watch(() => state.orderDate, (newVal) => {
		getOrders(formattedDate(newVal))
	})

</script>
<style scoped>
.delivery-screen{
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.screen{
	overflow-y:scroll;
	height: 94%;
}
.bonnen{
	width: 100%;
	overflow-x: scroll;
    display: flex;
    overflow-x: scroll;
    flex-direction: column;
    align-items: stretch;
    flex-wrap: wrap;
    align-content: center;
}
.bon-block{
	width: 96%;
}
#header{
	background-color: orange;
	padding-top: 5px;
	height: 6%;	
   border-bottom: 2px solid rgba(0,0,0,0.6);
}
#header .row{
	height: 100%;
}

#header .row .col-8 {
	height: 100%;
}

#header .row .col-8 img{
	height: 100%;
}
#header .row .col-3 .logo{
	max-height: 100%;
}
#header .row .col-3{
	max-height: 100%;
}
#menu-btn center{
	height:100%;
}
	
#menu-btn center svg{
	height:100%;
	width: 100%;
}
.page{
	display: inline-flex;
	width: 100%;
}
.back{
	display: flex;
	width: 50%;
}
.next{
	display: flex;
	width: 50%;
	float: right;
}
.next .btn{
	margin-left: auto;
}
@media (max-width: 575px){
	.bonnen{
		width: 100%;
		display: flex;
		overflow-x: scroll;
	}
}
</style>
