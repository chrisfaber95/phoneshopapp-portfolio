<script setup>
	import { reactive, defineProps, onMounted, computed } from 'vue';
	import Product from '@/components/shopPage/ProductPicnicStyle.vue'
	import {HTTP} from '@/assets/scripts/http-common.js';
	//import Departments from '@/components/shopPage/DepartmentsPicnicStyle.vue'
	//import OldDepartments from '@/components/shopPage/DepartmentsOldStyle.vue'
	import {DateTime} from 'luxon'
	import $ from 'jquery'


	

	defineProps({
	});

	const state = reactive({
		productList: [],
		removed: []
	})
	
	onMounted(() => {
		getDiscounts()
		onScroll()
	})
	function getDiscounts(){
		let params
			params = {
				date: '2023-04-05'
			}
			HTTP.get(`discounts`, {params})
			.then((response) => {
				state.favorites = response.data
				const transformedProducts = state.favorites.reduce((acc, discount) => {
					const discounts = { ...discount };
					delete discounts.product_discount;
					const products = discounts.product_discount_list.map(product => {
						const newProduct = { ...product.product_discount };
						let discount_base = { ...product}
						delete discount_base.product_discount
						let discount_info = { ...discount}
						delete discount_info.product_discount_list
						discount_base.discount_info = discount_info
						newProduct.product_has_discount_list = [discount_base];
						return newProduct;
					});
					return [...acc, ...products];
				}, []);
				state.productList = transformedProducts
			})
			.catch(() => {
			})
	}

	function onScroll(){
		window.addEventListener('scroll', function(e){
			try {
				
			var scrollLimit = 100;
			var shelfunit = $('#shelfunit')
			if (shelfunit.scrollTop() % scrollLimit < 10) {
				
				var subs = $('.first-sub')
				
				subs.each(function( index ) {
					if($(this).parent().offset().top > -300 && $(this).parent().offset().top < 250){
						
						if($(this).attr('id') != state.currentSub){
							state.currentSub = $(this).attr('id')
						}
					}
					if($(this).parent().offset().top > 300 && $(this).attr('id') == state.currentSub){
						state.currentSub = $(subs[index-1])?.attr('id') || null
					}
				})
			}
			} catch {
				// ignore
			}
		})
		window.addEventListener('wheel', function(e){

			try {
				
			var scrollLimit = 100;
			var shelfunit = $('#shelfunit')
			if (shelfunit.scrollTop() % scrollLimit < 10) {
				
				var subs = $('.first-sub')
				
				subs.each(function( index ) {
					if($(this).parent().offset().top > -300 && $(this).parent().offset().top < 250){
						
						if($(this).attr('id') != state.currentSub){
							state.currentSub = $(this).attr('id')
						}
					}
					if($(this).parent().offset().top > 300 && $(this).attr('id') == state.currentSub){
						state.currentSub = $(subs[index-1])?.attr('id') || null
					}
				})
			}
			} catch {
				// ignore
			}
		})
	}

	const productList = computed(() => {
		
		var rest = state.productList.filter(
			(el) => {
				if (state.removed.includes(el.id)) return false
				else if(el.price > 99999) return false
				else if(!isDiscounted) return false
				else return true
			}
		)
		rest.sort((a, b) => {
			if(a.categoryname2?.includes('FULL')) a.categoryname2 = null
			if(b.categoryname2?.includes('FULL')) b.categoryname2 = null
			let fa = a.categoryname2?.toLowerCase() || '',
				fb = b.categoryname2?.toLowerCase() || '';

			if (fa < fb) {
				return -1;
			}
			if (fa > fb) {
				return 1;
			}
			return 0;
		});
		return rest
	})

	function isDiscounted(product){
        var data = null
        if(Array.isArray(product.product_has_discount_list)){
            if(product.product_has_discount_list.length > 0)
            product.product_has_discount_list.forEach((element) => {
                if(DateTime.fromISO(element.discount_info.starting_date) <= DateTime.now() && DateTime.fromISO(element.discount_info.end_date) >= DateTime.now()){
                    data = element
                }
            });
        }
        return data
    }
	
function sanitizeText(item){
	if(item) return titleCase(item.replaceAll('_', ' '))
	return ''
}

function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length, as your for does that for you
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   // Directly return the joined string
   return splitStr.join(' '); 
}
	
</script>

<template>
	<div class="shop">
       <!-- <OldDepartments v-if="currentDepartment == '0'"/>-->
		<div class="title" v-html="sanitizeText(state.currentSub) || 'Aanbiedingen'">
		</div>
		<div class="shelfunit" 
			id="shelfunit" 
			ref="shelf" 
			:style="{ 'grid-template-columns': `1`,  'grid-auto-columns': `100%`}" 
			:on-scroll="onScroll()"
			:on-wheel="onScroll()"
			>
			<Product v-bind:product="item" v-for="(item, index) in productList" :first="item.categoryname2 != productList[index-1]?.categoryname2 || false" v-bind:key="item.id" :id="`product-${item.id}`"
			@removeProduct="(callback) => {removeProduct(callback)}" />
		</div>     
	</div>	
</template>

<style lang="scss" scoped>
.shop{
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
    justify-content: flex-start;
}

.shelfunit{
	display: grid;
    overflow-x: hidden;
    overflow-y: scroll;
    height: 100%;
    width: 98%;
    grid-auto-flow: row;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 5px;
    margin-left: auto;
    margin-right: auto;
    height: auto;
    max-height: 99%;
}
.departmentList{
	height: 7%;
	overflow-x: hidden;
}

.header{
    display: flex;
    width: 100%;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    align-content: center;
}

select{
	width: 100%;
    height: 80%;
    line-height: 2rem;
    font-size: 1.2rem;
    padding: 5px;
    margin: 5px;
    border: none;
}

.departmentList select{
	width: 100%;
}
.title{margin-left: 5px;
    font-size: 1.2rem;
    font-weight: 600;
}

.searchheader{
    width: 100%;
	height: 10%; 
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    position: relative;
    grid-auto-flow: column;
	grid-template-rows: 100%;
}
.searchheader .title{
    margin-left: 5px;
    font-size: 1.2rem;
    font-weight: 600;
}
.searchheader button{
    margin-right: 10px;
	padding: 5px;
}

.searchheader select{
	width: 90%;
    height: 90%;
    line-height: 2rem;
    font-size: 1.2rem;
    padding: 5px;
    margin: 5px;
    border: none;
}

.searchbutton{
	height: 100%;
	width: 50%;
    margin-left: 5px;
	margin-top: 5px;
}
.searchbutton button{
    height: 80%;
    padding: 2px;
    margin: 0;
}
.searchbutton button img{
	height: 100%;
	width: auto;
}


#search{
    position: absolute;
    z-index: 10;
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


    
@media only screen and (min-height: 500.98px) and (orientation: landscape) {	
    .shelfunit{
        grid-template-columns: repeat(4, 1fr);
    }
	.shop .title{
		font-size: 1.4rem;
	}
	
}
@media only screen and (min-width: 500.98px) and (orientation: portrait) {	
    .shelfunit{
        grid-template-columns: repeat(3, 1fr);
    }
	.shop .title{
		font-size: 1.4rem;
	}
}


</style>