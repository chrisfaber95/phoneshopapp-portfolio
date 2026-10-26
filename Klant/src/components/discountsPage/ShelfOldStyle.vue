<script setup>
	import { reactive, onMounted, computed, watch, ref } from 'vue';
	import { useStore } from 'vuex'
	import Product from '@/components/shopPage/ProductOldStyle.vue'
	import {HTTP} from '@/assets/scripts/http-common.js';
	//import Departments from '@/components/shopPage/DepartmentsOldStyle.vue'
	//import Search from '@/components/shopPage/Search.vue'
	import router from '@/router';
	import {DateTime} from 'luxon'

	const store = useStore()

	const state = reactive({
		productList: [],
		selectedDepartment: null,
		removed: [],
        currentPage: router.currentRoute.value.path
	})

	function removeProduct(prod){
		state.removed.push(prod.id)
	}
	
	onMounted(() => {
		getDiscounts()
	})

	const shelf = ref();

	watch(() => store.getters['location/getCurrentSubDepartment'], (newVal, oldVal) => {
		if(newVal) {
			if(!isInViewport(document.getElementById(`${newVal}`))){
				document.getElementById(`${newVal}`).scrollIntoView({behavior: "smooth", block: "start", inline: "start"});
			}
		}

	})
	function isInViewport(element) {
		var rect = element.getBoundingClientRect();
		var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

		return (
			rect.top >= 0 &&
			rect.bottom <= viewportHeight
		);
	}

	function getDiscounts(){
		changeActiveDepartment(null)
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

	function changeActiveDepartment(department){
		store.commit('location/setAvailableSubDepartments', [])
		state.productList = []
		store.commit('location/changeDepartment', department)
	}
	watch(() => store.getters['location/getCurrentSubDepartment'], (newVal, oldVal) => {
		if(newVal) {
			if(!isInViewport(document.getElementById(`${newVal}`))){
				document.getElementById(`${newVal}`).scrollIntoView({behavior: "smooth", block: "start", inline: "start"});
			}
		}

	})

	watch(() => state.selectedDepartment, (newVal) => {
        changeActiveDepartment(newVal)
	})

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

</script>

<template>
	<div class="shop">		
		<div class="shelfunit" ref="shelf" :key="currentDepartment">			
			<Product 
                v-bind:product="item" 
                v-for="(item, index) in productList" 
                :first="item.categoryname2 != productList[index-1]?.categoryname2 || false" 
                v-bind:key="item.id" :id="`product-${item.id}`"
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
.departments{
	height: 100%;
	width: 100%;
	display: grid;
}
.shelfunit{
	display: grid;
    overflow-x: hidden;
    overflow-y: scroll;
    height: auto;
    max-height: 99%;
    width: calc(100% - 5px);
    grid-auto-flow: row;
    margin-left: 5px;
    grid-gap: 2px;
	grid-template-columns: 100%;
}
.header{
    display: flex;
    width: 100%;
	height: 8%;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    align-content: center;
}
.header .title{
    margin-left: 5px;
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

@media only screen and (min-width: 500.98px) and (orientation: portrait) {
	.shelfunit{
		grid-template-columns: repeat(2, 1fr);
	}
}
@media only screen and (min-height: 500.98px) and (orientation: landscape) {
	.shelfunit{
		grid-template-columns: repeat(2, 1fr);
	}
}
</style>