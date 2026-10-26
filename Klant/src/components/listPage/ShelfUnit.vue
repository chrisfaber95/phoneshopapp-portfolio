<script setup>
	import { reactive, onMounted, computed, watch, ref, nextTick } from 'vue';
	import Product from '@/components/listPage/Product.vue'
	import {HTTP} from '@/assets/scripts/http-common.js';
	import Emptyproduct from '@/components/listPage/Emptyproduct.vue'
    
import { useStore } from 'vuex'
	const store = useStore()

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

	const shelf = ref();

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
	})

	//80 landscape 82 portrait
	async function changeWidth(e){
		try {			
			let percentage = 80
			if(screen.availWidth >= screen.availHeight){
				percentage = 80
			}
			else{
				percentage = 82
			}
			await nextTick()
			state.columnHeight = screen.availHeight / 100 * 0.92 * percentage
			state.columnWidth = state.columnHeight / amountOfShelf.value * 0.85
			state.shelfheight = shelf?.value?.offsetHeight || screen?.availHeight / 100 * percentage || document.documentElement.clientHeight
		} catch (err) {
			console.log(err )
		}
	}

	const currentDepartment = computed(() => { 
		return store.getters['location/getCurrentDepartment']
	})

	watch(() => store.getters['location/getCurrentDepartment'], (newVal) => {
        state.productList = []
        if(newVal?.department_id > 1){
            getProducts()
        }
        else if(newVal?.department_id == 1){
            getFavorites()
        }
	},{
		immediate: true,
		deep: true
	})

    watch(() => store.getters['shopsettings/getFavorites'], (newVal) => {
        let cart = store.getters['shopsettings/getFavorites']
        if(store.getters['location/getCurrentDepartment'].department_id == 1){
            if(Object.keys(cart).length != state.favorites.length){
                getFavorites()
            }
        }
	},{
		deep: true
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
			store.commit('shopsettings/updateFavorites', state.favorites)
		})
		.catch((e) => {
            console.log(e)
		})
	}

	function getProducts(){
		if(currentDepartment.value?.department_id){
			let params
			if(localStorage.getItem('user_id')){
				params = {
					department_id: currentDepartment.value.department_id,
					stock: 1,
					customer_id: localStorage.getItem('user_id')
				}
			}
			else{
				params = {
					department_id: currentDepartment.value.department_id,
					stock: 1
				}
			}
			HTTP.get(`product`, {params})
			.then((response) => {
				state.productList = response.data
			})
			.catch(() => {
			})
		}
	}

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

	const loggedIn = computed(() => {
		return true
	})

	function removeProduct(prod){
		state.removed.push(prod.id)
	}

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