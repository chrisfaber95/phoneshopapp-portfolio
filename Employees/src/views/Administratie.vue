<template>
	<div class="administratie">
			<Header />
		<div class="content">
			<div class="toolbar">
				<div class="toolbar-item" v-for="item in toolbar" v-bind:key="item.id">
					<b-button :d="item.id"  @click="selection = item.id" :class="{active: selection===item.id}">
						{{item.label}}
					</b-button>	
				</div>
				<div class="toolbar-item">
					<b-button id="download" @click="downloadData(filteredOrders)">
						Download
					</b-button>
				</div>
			</div>			
			<!--<datetime v-model="orderDate" style="display: none"></datetime>
			<div v-if="orders">
				<div class="overflow-auto">
					<b-table
					id="my-table"
					:items="filteredOrders"
					:per-page="perPage"
					:current-page="currentPage"
					:fields="fields"
					small
					></b-table>
				</div>			
				<b-pagination
				v-model="currentPage"
				:total-rows="rows"
				:per-page="perPage"
				aria-controls="my-table"
				></b-pagination>
				<p class="mt-3">Current Page: {{ currentPage }}</p>
			</div>-->
			<div class="charts">				
				<div class="totalen">
					<h2>Totalen</h2>
					<div id="chart">					
						<Sellcharts :key="selection" v-if="loaded" ref="chart" class="chart" :chart-data="chartdata" :chart-labels="chartdata.labels" :options="selectedoption" :width="300" :height="300"></Sellcharts>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
// @ is an alias to /src
import {HTTP} from '@/assets/services/http-common.js';
import Header from '@/components/Basics/Header.vue'
import moment from 'moment';
import { DateTime as LuxonDateTime } from 'luxon'
//import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
//import _ from "lodash";
import Sellcharts from '@/views/Sellcharts.vue'

export default {
	name: 'Home',
		components: {
		//apexchart: VueApexCharts,
		//datetime: Datetime,
		Header,
		Sellcharts
	},
	data: function () {
		return {
			toolbar: [
				{id: 'today', label: 'Vandaag'},
				{id: 'yesterday', label: 'Gisteren'},
				{id: 'week', label: 'Deze week'},
				{id: 'month', label: 'Deze maand'},
				{id: 'year', label: 'Dit jaar'},
				{id: 'all', label: 'Alles'}
			],
			datacollection: null,
			loaded: false,
			height: 30,
			orders: null,
			refundAmount: 0,
			refund: null,
			orderProducts: null,
			orderDate: LuxonDateTime.local().toISO(),
			endDate: LuxonDateTime.local().minus({days: 60}).toISO(),			
			selection: 'all',
			startday: LuxonDateTime.local().toISO(),
			endday: LuxonDateTime.local().toISO(),			
			perPage: 10,
			currentPage: 1,
			fields:[
				{	key: 'order_id',
					label: 'Bestelling',
					sortable: true
				},
				{	key: 'winkelbon',
					label: 'Winkelbon',
					sortable: true
				},
				{	key: 'finalPrice',
					label: 'Bedrag',
					sortable: false
				},
				{	key: 'picking_price',
					label: 'Inpakkosten',
					sortable: false
				},
				{	key: 'pickupDate',
					label: 'Afhaaldatum',
					sortable: true,
					formatter: "formatDateAssigned"
				},
				{	key: 'pickupTime',
					label: 'Afhaaltijd',
					sortable: true
				},
				{	key: 'status',
					label: 'Status',
					sortable: true
				},
				{	key: 'customerName',
					label: 'Naam'
				},
			],
			monthoption: {
				maintainAspectRatio:false,
				scales: {
					yAxes: [{
						display: true,
						ticks: {
							suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
							max: 2000,    // minimum will be 0, unless there is a lower value.
							// OR //
							beginAtZero: true   // minimum value will be 0.
						}
					}],
					xAxes: [{
						type: 'time',
						time:{
							unit: 'month',
							round: 'month',
							displayFormats: {
								quarter: 'MMM YYYY'
							}
						},
						distribution: 'linear',
						ticks:{
							min: null,
							max: null
						}
					}]
				}
			},			
			dayoption: {
				maintainAspectRatio:false,
				scales: {
					yAxes: [{
						display: true,
						ticks: {
							suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
							max: 2000,    // minimum will be 0, unless there is a lower value.
							// OR //
							beginAtZero: true   // minimum value will be 0.
						}
					}],
					xAxes: [{
						type: 'time',
						time:{
							unit: 'day',
							round: 'day',
							displayFormats: {
								day: 'MMM D'
							}
						},
						distribution: 'linear',
						ticks:{
							min: null,
							max: null
						}
					}]
				}
			},		
			houroption: {
				maintainAspectRatio:false,
				scales: {
					yAxes: [{
						display: true,
						ticks: {
							suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
							max: 2000,    // minimum will be 0, unless there is a lower value.
							// OR //
							beginAtZero: true   // minimum value will be 0.
						}
					}],
					xAxes: [{
						type: 'time',
						time:{
							unit: 'hour',
							round: 'hour',
							displayFormats: {
								day: 'HH'
							}
						},
						distribution: 'linear',
						ticks:{
							min: null,
							max: null
						}
					}]
				}
			},
		}
	},
	methods: {
		downloadData(arrData){
			arrData.forEach((obj)=>delete obj['cart']);
			let csvContent = "data:text/csv;charset=utf-8,";
			csvContent += [
			Object.keys(arrData[0]).join(";"),
			...arrData.map(item => Object.values(item).join(";"))
			]
			.join("\n")
			.replace(/(^\[)|(\]$)/gm, "");
			const data = encodeURI(csvContent);
			const link = document.createElement("a");
			link.setAttribute("href", data);
			link.setAttribute("download", "export.csv");
			link.click();
			return false;
		},
		formatDateAssigned(value) {
			const date = LuxonDateTime.fromISO(value)
			const formattedDate = date.toISODate();
			return formattedDate;
		},
		getOrders: function() {
			this.loaded = false
			var self = this
			HTTP.get('order')
			.then((response) => {
				this.orders = response.data.docs
				setTimeout(function () {
					self.loaded = true
				}, 1000);
			})
			.catch(() => {
				//console.log(errors)
			})
		},
		newOrders: function(){
			const date = this.orderDate.split("T")[0]
			HTTP.get('order/'+date)
			.then((response) => {
				const orders = response.data.docs
				if(orders.length > this.orders && this.orders != null){
					for(var item in orders){
						try{					
							const found = this.orders.some(el => el.order_id === item.order_id);
							if (!found) this.orders.push(item);
						}
						catch(e){
							console.log(e)
						}
					}
				}
			})
			.catch(() => {
				//console.log(errors)
			})
		},
		transformData(data, format) {
			const result = [];
			const length = data.length;
			for (let i = 0; i < length; i++) {
				if(	moment(new Date(data[i].pickupDate)).isValid() && (data[i].status == "payed" || data[i].status == "afgehaald")){
					let hasPresentOn = result.find(
						function(el) {
							var iso1 =  el.date
							var iso2 =  moment(new Date(data[i].pickupDate)).format(format)
							return iso1 == iso2
						}
					)
					if(hasPresentOn){
						if(!data[i].finalPrice || data[i].finalPrice.length === 0){
							data[i].finalPrice = parseFloat(0.00)
						}
							hasPresentOn.y += parseFloat(data[i].finalPrice)
					}
					else{
						result.push({
							date: moment(new Date(data[i].pickupDate)).format(format),
							x: moment(new Date(data[i].pickupDate)).format(format),
							y: data[i].finalPrice
						});
					}
				}
				/*if(	moment(new Date(data[i].orderDate)).isValid()){
					let hasPresentOn = result.find(
						function(el) {
							var iso1 =  el.date
							var iso2 =  moment(new Date(data[i].orderDate)).format(format)
							return iso1 == iso2
						}
					)
					if(hasPresentOn){
						if(!data[i].picking_price || data[i].picking_price.length === 0){
							data[i].picking_price = parseFloat(0.00)
						}
							hasPresentOn.y += parseFloat(data[i].picking_price)
					}
					else{
						result.push({
							date: moment(new Date(data[i].orderDate)).format(format),
							x: moment(new Date(data[i].orderDate)).format(format),
							y: data[i].picking_price
						});
					}
				}*/
			}
			var labels = result.map(dat => dat.x)
			var sortedlabels = labels.sort((a, b) => moment(a).diff(moment(b)))
			var sortedresult = result.sort((a, b) => moment(a.x).diff(moment(b.x)))
			var datacollection = {
				labels: sortedlabels,
				datasets:[
					{
						data: sortedresult,
						backgroundColor: '#f87979'
					}
				]
			}
			console.log(datacollection)
			return datacollection;
		}
	},
	created(){
		setInterval(this.newOrders, 60000);
		this.getOrders()
	},
	computed: {	
		rows() {
			if(this.filteredOrders){
				return this.filteredOrders.length
			}
			else{
				return 0
			}
		},
		filteredOrders:function(){
			var yearsAgo;
			var filtered = [];
			var data = this.orders
			if(this.orders != [] || this.orders != null){
				if(this.selection == 'today'){
					yearsAgo = moment().subtract(0, "days")
					data.forEach(function(item){
						if(moment(new Date(item.pickupDate)).format('YYYY-MM-DD') == moment(new Date(yearsAgo.format())).format('YYYY-MM-DD')){
							filtered.push(item)
						}
					});	
					
					return filtered
				}
				else if(this.selection == 'yesterday'){
					yearsAgo = moment().subtract(1, "days")
					data.forEach(function(item){
						if(moment(new Date(item.pickupDate)).format('YYYY-MM-DD') == moment(new Date(yearsAgo.format())).format('YYYY-MM-DD')){
							filtered.push(item)
						}
					});	
					return filtered
				}
				else if(this.selection == 'week'){
					yearsAgo = moment().subtract(1, "weeks")
					data.forEach(function(item){
						if(moment(new Date(item.pickupDate)).format('YYYY-MM-DD') > moment(new Date(yearsAgo.format())).format('YYYY-MM-DD')){
							filtered.push(item)
						}
					});	
					return filtered
				}
				else if(this.selection == 'month'){
					yearsAgo = moment().subtract(1, "month")
					data.forEach(function(item){
						if(moment(new Date(item.pickupDate)).format('YYYY-MM') > moment(new Date(yearsAgo.format())).format('YYYY-MM')){
							filtered.push(item)
						}
					});	
					return filtered
				}
				else if(this.selection == 'year'){
					yearsAgo = moment().subtract(1, "years")
					data.forEach(function(item){
						if(moment(new Date(item.pickupDate)).format('YYYY') > moment(new Date(yearsAgo.format())).format('YYYY')){
							filtered.push(item)
						}
					});	
					return filtered
				}
				else if(this.selection == 'all'){		
					data.forEach(function(v){
						filtered.push(v)
					});	
					return filtered
				}
			}
			else{
				return this.orders
			}
			return this.orders
		},
		chartdata(){
			var numberOfYears;
			var yearsAgo;
			var filtered;
			var format;
			if(this.orders == null){
				return []
			}
			if(this.orders != [] || this.orders != null){
				if(this.selection == 'today'){
					format = 'YYYY-MM-DD HH'
					numberOfYears = parseInt(0)
					yearsAgo = moment().subtract(numberOfYears, "days")
					filtered = this.orders.filter(item => {
						return (
							moment(new Date(item.pickupDate)).startOf('day').format('YYYY-MM-DD') == moment(new Date(yearsAgo.format())).format('YYYY-MM-DD')
						);
					});
					
					filtered.forEach(element => {
						element.pickupDate = moment(new Date(element.pickupDate)).startOf('day').add(element.pickupTime.split(':')[0], 'h').add(element.pickupTime.split(':')[1], 'm').format('YYYY-MM-DD HH:MM')
					});
					return this.transformData(filtered, format);
				}
				else if(this.selection == 'yesterday'){
					format = 'YYYY-MM-DD HH'
					numberOfYears = parseInt(1)
					yearsAgo = moment().subtract(numberOfYears, "days")
					filtered = this.orders.filter(item => {
						return (
							moment(new Date(item.pickupDate)).startOf('day').format('YYYY-MM-DD') == moment(new Date(yearsAgo.format())).format('YYYY-MM-DD')
						);
					});
					filtered.forEach(element => {
						console.log(element)
						element.pickupDate = moment(new Date(element.pickupDate)).startOf('day').add(element.pickupTime.split(':')[0], 'h').add(element.pickupTime.split(':')[1], 'm').format('YYYY-MM-DD HH:MM')
					});
					console.log(filtered)
					return this.transformData(filtered, format);
				}
				else if(this.selection == 'week'){
					format = 'YYYY-MM-DD'
					const today = moment();
					const from_date = today.clone().isoWeekday(1);
					const to_date = today.clone().isoWeekday(7);
					filtered = this.orders.filter(item => {
						return (							
							moment(new Date(item.pickupDate)).isBetween(from_date, to_date, undefined, '[]')
						);
					});
					return this.transformData(filtered, format);
				}
				else if(this.selection == 'month'){
					format = 'YYYY-MM-DD'
					numberOfYears = parseInt(1)
					yearsAgo = moment().subtract(numberOfYears, "months")
					filtered = this.orders.filter(item => {
						return (
							moment(new Date(item.pickupDate)).format('YYYY-MM') >= moment(new Date(yearsAgo.format())).format('YYYY-MM')
						);
					});
					return this.transformData(filtered, format);
				}
				else if(this.selection == 'year'){
					format = 'YYYY-MM'
					numberOfYears = parseInt(1)
					yearsAgo = moment().subtract(numberOfYears, "years")
					filtered = this.orders.filter(item => {
						return (
							moment(new Date(item.pickupDate)).format('YYYY') > moment(new Date(yearsAgo.format())).format('YYYY')
						);
					});
					return this.transformData(filtered, format);
				}
				else if(this.selection == 'all'){		
					format = 'YYYY-MM'
					numberOfYears = parseInt(5)
					yearsAgo = moment().subtract(numberOfYears, "years")
					filtered = this.orders.filter(item => {
						return (
							moment(new Date(item.pickupDate)).format('YYYY') > moment(new Date(yearsAgo.format())).format('YYYY')
						);
					});
					return this.transformData(filtered,format);
				}
			}
			return this.transformData();
		},
		selectedoption: function(){
			var selected = ''
			switch (this.selection) {
				case 'all':
					selected = this.monthoption
					break;
				case 'year':
					selected = this.monthoption
					selected.scales.xAxes[0].ticks.min = moment().startOf('year')
					selected.scales.xAxes[0].ticks.max = moment().endOf('year')
					break;
				case 'month':
					selected = this.dayoption
					selected.scales.xAxes[0].ticks.min = moment().startOf('month')
					selected.scales.xAxes[0].ticks.max = moment().endOf('month')
					break;
				case 'week':
					selected = this.dayoption
					selected.scales.xAxes[0].ticks.min = moment().isoWeekday(1)
					selected.scales.xAxes[0].ticks.max = moment().isoWeekday(7)
					break;
				case 'yesterday':
					selected = this.houroption
					selected.scales.xAxes[0].ticks.min = moment().startOf('day')
					selected.scales.xAxes[0].ticks.max = moment().endOf('day')
					break;
				case 'today':
					selected = this.houroption
					selected.scales.xAxes[0].ticks.min = moment().startOf('day')
					selected.scales.xAxes[0].ticks.max = moment().endOf('day')
					break;
				default:
					break;
			}
			console.log(this.chartdata.datasets[0].data)
			var max = Math.max.apply(Math, this.chartdata.datasets[0].data.map(function(o) { return o.y; }))
			selected.scales.yAxes[0].ticks.max = Math.ceil((max * 1.1)/100)*100
			return selected
		}
	},
	watch: {
		orderDate: function(){
			if(this.orderDate){
				this.getOrders()
			}
		}
	},
	mounted(){
	}
}
</script>
<style scoped>
.administratie{
	width:100%;
}

.content{
	display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;
    flex-wrap: wrap;
}
.toolbar{
    width: 10%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: flex-start;
}
.toolbar button{
	margin: 5px;
}
.toolbar button.active{
	color: white;
	background-color: orange;
}
.btn{
	background-color: orange;
	color: #f8f8f8;
	font-size: 1.1rem;
	font-weight: 600;
	padding: 5px;
    -webkit-box-shadow: 6px 10px 5px 0px rgb(0 0 0 / 75%);
    box-shadow: 4px 4px 3px 0px rgb(0 0 0 / 40%);
    color: #ffffff;
    border: 2px solid #ffa500;
}

.charts{
	max-height: 80vh;
	overflow-y: scroll;
	width: 80%;
}
.totalen{
	width: 80%;
}
@media only screen and (max-width: 1023px) {	
	.content{
		flex-direction: column;
	}
	.toolbar{
		width: 100%;
		display: flex;
		flex-direction: row;
	}
	.charts{
		width: 95%;
		margin-left: auto;
		margin-right: auto;
	}
	.totalen{
		width: 100%;
	}
}
</style>
<style>
.date .vdatetime-input{
	font-size: 1.3rem;
	text-align: center;
	background-color: #000000;
	border-radius: 10px;
	color: #ffffff;
}
</style>