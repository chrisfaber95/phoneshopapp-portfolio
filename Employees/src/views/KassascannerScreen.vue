<script setup>
// @ is an alias to /src
import { reactive, watch, computed, ref } from 'vue'
import {HTTP} from '@/assets/services/http-common.js'

import Header from '@/components/Basics/Header.vue'
import OrderSearch from '@/components/CollectingScreen/OrderSearch.vue'
import Order from '@/components/KassascannerScreen/Order.vue'
import DailyOrdersScreen from '@/components/KassascannerScreen/DailyOrdersScreen.vue'
	
import { useStore } from 'vuex'

	const store = useStore()

	const orderRefs = ref([])

	const state = reactive({
		orderDate: null,
		orders: []
	})

	function formattedDate(date){
		return new Date(date).toISOString().split('T')[0]
	}

	function getOrders(date) {
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
			store.commit('scanning/newOrdersList', state.orders)
		})
		.catch((errors) => {
			console.log(errors)
		})
	}

	watch(() => state.orderDate, (newVal) => {
		getOrders(formattedDate(newVal))
	})

	const filteredOrders = computed(() => {
		var list = []
		var allOrders
		const or = state.visibleOrders
		if(Object.keys(or).length > 0){

			allOrders = Object.values(or).filter(e => 
				(e.status == "picked" || 
				e.status =="scanned") &&
				e.pickingcrate != null ||
				e.pickingcrate != "null");
			allOrders.sort(function (a, b) {
				return a.pickupTime.localeCompare(b.pickupTime);
			});
			console.log(or)
			console.log(allOrders)
			list = allOrders
		}
		return list;
	})

	watch(() => store.getters['scanning/getOrders'], () => {
		state.visibleOrders = store.getters['scanning/getOrders']
	}, {immediate: true, deep: true})

</script>
<template>
  <div class="kassascanner-screen">
	<div class="screen">
		<OrderSearch ref="ordersearch" @changeOrderDate="(callback) => state.orderDate = callback" />
			<div class="daily-orders">
				<DailyOrdersScreen
					:date="state.orderDate"				
				/>
			</div>
			<hr />
			<div class="bonnen">
				<Order class="bon-block" 
					v-for="(order, i) in filteredOrders" 
					:ref="el => {orderRefs[i] = el}"
					:key="order.order_id+'row'" 								
					:order="order" />
			</div>
	</div>
	<Header />
  </div>
</template>

<style scoped lang="scss">
.kassascanner-screen{
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
    display: flex;
	overflow-x: hidden;
	flex-direction: column;
    flex-wrap: wrap;
    align-items: stretch;
    align-content: stretch;
    justify-content: flex-start;
}

/* 
  ##Device = Low Resolution Tablets, Mobiles (Landscape)
  ##Screen = B/w 481px to 767px
*/

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