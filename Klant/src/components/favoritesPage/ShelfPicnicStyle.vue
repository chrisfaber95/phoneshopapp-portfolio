<script setup>
	import { reactive, defineProps, onMounted, computed } from 'vue';
	import Product from '@/components/shopPage/ProductPicnicStyle.vue'
	import {HTTP} from '@/assets/scripts/http-common.js';
	import $ from 'jquery'


	

	defineProps({
	});

	const state = reactive({
		productList: [],
		removed: []
	})
	
	function removeProduct(prod){
		state.removed.push(prod.id)
	}
	
	onMounted(() => {
		getFavorites()
		onScroll()
	})

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

	function getFavorites(){
		let params
			params = {
				stock: 1,
				customer_id: localStorage.getItem('user_id')
			}
			HTTP.get(`customer_favorites`, {params})
			.then((response) => {
				state.favorites = response.data
				state.productList = state.favorites.map(a => a.favorite_product);
			})
			.catch(() => {
				console.log('Kon producten niet laden')
			})
	}

	const productList = computed(() => {
		var rest = state.productList.filter(
			(el) => {
				if (state.removed.includes(el.id)) return false
				else if(el.price > 99999) return false
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

	



	
</script>

<template>
	<div class="shop">
        <div class="title" v-html="`Favorieten`">
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
    justify-content: space-between;
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
	height: 99%;
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
    
@media only screen and (min-height: 500.98px) and (orientation: landscape) {	
    .shelfunit{
        grid-template-columns: repeat(3, 1fr);
    }
	.shop .title{
		font-size: 1.4rem;
	}
}
</style>