<script setup>
	import { reactive, defineProps, onMounted, computed, ref, nextTick } from 'vue';
	import Product from '@/components/shopPage/Product.vue'
	import {HTTP} from '@/assets/scripts/http-common.js';
	import Emptyproduct from '@/components/shopPage/Emptyproduct.vue'
    
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
			})
	}


	function removeProduct(prod){
		state.removed.push(prod.id)
	}
	
	onMounted(() => {
		getFavorites()
		
		changeWidth()
		screen.orientation.addEventListener("change", function(e) {
			try {
				state.rotation = !state.rotation
				changeWidth(e)
			} catch (error) {
				console.log(error)
			}
		}, false);
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
			state.columnHeight = screen.availHeight / 100 * 0.92 * percentage
			state.columnWidth = state.columnHeight / amountOfShelf.value * 0.85
			state.shelfheight = shelf?.value?.offsetHeight || screen?.availHeight / 100 * percentage || document.documentElement.clientHeight
		} catch (err) {
			console.log(err,e )
		}
	}
	
	const amountOfShelf = computed(() => { return store.getters['shopsettings/getAmountOfShelf'] || 4})

	const currentDepartment = computed(() => { 
		
		return store.getters['location/currentDepartment']
	})

	const shelf = ref();
	
	const loggedIn = computed(() => {
		return store.getters['shopsettings/getLoggedIn']
	})

	const productList = computed(() => {
		var rest = state.productList.filter(
			(el) => {
				if (state.removed.includes(el.id)) return false
				else if(el.price > 99999) return false
				else return true
			}
		)
		return rest
	})

	const extra = computed(()=>{
		var length = productList.value.length
		if(length < 25) length = 25
		var remainder = length % amountOfShelf.value
		if(remainder === 0 && state.productList.length > 25) return 0
		if(state.productList.length < 25) return (amountOfShelf.value - remainder) + 25 - state.productList.length
		return amountOfShelf.value - remainder
	})

	const rowTheme =  computed(() => {
		var percentage
		if(document.documentElement.clientWidth >= document.documentElement.clientHeight){
			percentage = 90
		}
		else{
			percentage = 90
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
		<div class="warning" v-if="!loggedIn && currentDepartment?.department_id == 1" v-html="`Meld u aan om gebruik te maken van de favorieten producten`"></div>

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
@media only screen and (min-width: 500.98px) and (orientation: portrait) {
	.shelfunit{
	}
}
@media only screen and (min-height: 500.98px) and (orientation: landscape) {
	.shelfunit{
	}
}
</style>