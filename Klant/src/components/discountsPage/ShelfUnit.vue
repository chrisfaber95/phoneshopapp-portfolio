<script setup>
	import { reactive, defineProps, onMounted, computed, ref, nextTick } from 'vue';
	import Product from '@/components/shopPage/Product.vue'
	import Emptyproduct from '@/components/shopPage/Emptyproduct.vue'
	import {HTTP} from '@/assets/scripts/http-common.js';

	import {DateTime} from 'luxon'
	import { useStore } from 'vuex'
	const store = useStore()

	

	defineProps({
	});

	const state = reactive({
		productList: [],
		favorites: [],
		removed: [],
		columnHeight: 0,
		rotation: false,
		columnWidth: 0,
		color: 'black',
		shelfheight: 0
	})

	function removeProduct(prod){
		state.removed.push(prod.id)
	}

	

	
	function getDiscounts(){
		let params
			if(localStorage.getItem('user_id')){
				params = {
					date: '2023-04-05',
					customer_id: localStorage.getItem('user_id')
				}
			}
			else{
				params = {
					date: '2023-04-05',
				}
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

	
	onMounted(() => {
		
		changeWidth()
		screen.orientation.addEventListener("change", function(e) {
			try {
				state.rotation = !state.rotation
				changeWidth(e)
			} catch (error) {
				console.log(error)
			}
		}, false);
		getDiscounts()
	})
	
	//80 landscape 82 portrait
	async function changeWidth(e){
		try {			
			let percentage = 90
			if(screen.availWidth >= screen.availHeight){
				percentage = 90
			}
			else{
				percentage = 90
			}
			await nextTick()
			state.columnHeight = screen.availHeight / 100 * percentage
			state.columnWidth = state.columnHeight / amountOfShelf.value * 0.85
			state.shelfheight = shelf?.value?.offsetHeight || screen?.availHeight / 100 * percentage || document.documentElement.clientHeight
		} catch (err) {
			console.log(err,e )
		}
	}
	
	/*
	const currentDepartment = computed(() => { 
		return store.getters['location/getCurrentDepartment']
	})

	watch(() => store.getters['location/getCurrentDepartment'], (newVal, oldVal) => {
		console.log(newVal)
		try{
			if(newVal != 0){
				if(shelf.value){
					shelf.value.scrollTo({ left: 0, behavior: 'auto' });
				}
				console.log(newVal)
				if(newVal.department_id == 1){				
					getFavorites()
				}
				else{
					getProducts()
				}
			}

		}
		catch(error){
			if(error) console.log(error)
		}
	},{
		immediate: true
	})

	watch(() => store.getters['location/getCurrentDepartment'], (newVal, oldVal) => {
		try{
			if(newVal == false && currentDepartment.value.department_id == 1 ){
				state.productList = []
			}
		}
		catch(error){
			if(error) console.log('error')
		}
	})
*/
	const productList = computed(() => { 
		
		/*for (const key in state.favorites) {
			if (Object.hasOwnProperty.call(state.favorites, key)) {
				const element = state.favorites[key];
				element.product_discount_list.forEach(element1 => {
					var prod_info = element1.product_discount
					var discount = element1
					delete discount.product_discount
					var discount_info = element
					delete discount_info.product_discount_list
					var prod = {product: prod_info, discount: discount, discount_info: discount_info}
					list.push(prod)
				});
			}
		}
		*/
		var rest = state.productList.filter(
			(el) => {
				if (state.removed.includes(el.id)) return false
				else if(el.price > 99999) return false
				else if(!isDiscounted) return false
				else return true
			}
		)
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


	const shelf = ref();
	
	

	

	const extra = computed(()=>{
		var length = productList.value.length
		if(length < 25) length = 25
		var remainder = length % amountOfShelf.value
		if(remainder === 0 && state.productList.length > 25) return 0
		if(state.productList.length < 25) return (amountOfShelf.value - remainder) + 25 - state.productList.length
		return amountOfShelf.value - remainder
	})

	const amountOfShelf = computed(() => { return store.getters['shopsettings/getAmountOfShelf'] || 4})
	
	const rowTheme =  computed(() => {
		var percentage
		if(document.documentElement.clientWidth >= document.documentElement.clientHeight){
			percentage = 80
		}
		else{
			percentage = 82
		}

		return {
			rows: `repeat(${amountOfShelf.value}, calc(100% / ${amountOfShelf.value}))`,
			shelfheight: state.shelfheight,
			columnWidth: `calc((100vh * 0.92 * (${percentage} / 100)) / ${amountOfShelf.value} * 0.85)`
		}
	})
</script>

<template>
	<div 
		class="shelfunit test" 
		ref="shelf">
		<Product 
			v-bind:product="item" 
			v-for="item in productList" 
			v-bind:key="item.id" 
			:id="`product-${item.id}`"
			@removeProduct="(callback) => {removeProduct(callback)}" />
		<Emptyproduct v-for="item in extra" :key="`empty-${item}`"/>
	</div>
</template>

<style lang="scss" scoped>
.shelfunit{
	display: grid;
	overflow-x: scroll;
    overflow-y: hidden;
    height: calc(100% - 2px);
    width: 100%;
    grid-auto-flow: column;
    grid-template-rows: repeat(5, 1fr);
    grid-auto-columns: calc(100% / 5);
	grid-template-rows: v-bind('rowTheme.rows');
	grid-auto-columns: v-bind('rowTheme.columnWidth');
	padding-bottom: 5px;
}
.warning{
	width: 100%;
	height: 100%;
	position: fixed;
	top: 0;
	left: 0;
	display: inline-block;
	transform: translateY(50%);
}
</style>