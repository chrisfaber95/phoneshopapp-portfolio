<script setup>
	import { reactive, defineProps, onMounted, computed, ref } from 'vue';
	import Product from '@/components/actieshopPage/ProductOldStyle.vue'
	import {HTTP} from '@/assets/scripts/http-common.js';
	

	

	const props = defineProps({
		"actie": Object,
		"products": Object
	})

	const state = reactive({
		productList: [],
		removed: [],
		currentSub: null
	})

	
	
	onMounted(() => {
		getProducts()
	})

	
	function getProducts(){
        const params = {
            product_id: props.actie.spaaractie_products.map(function (el) { return el.product_id; }),
            stock: 1
        }
        HTTP.get(`product`, {params})
        .then((response) => {
            state.productList = response.data
        })
        .catch(() => {
        })
	}
	
	
	const shelf = ref();
	
	
	const productList = computed(() => {
		var rest = []
		if(state.productList){
		rest = state.productList.filter(
			(el) => {
				if (state.removed.includes(el.id)) return false
				//else if(el.price > 99999) return false
				else return true
			}
		)
		rest.sort((a, b) => {
			if(a.categoryname2?.includes('FULL')) a.categoryname2 = null
			if(b.categoryname2?.includes('FULL')) b.categoryname2 = null
			let fa = a.id,
				fb = b.id;

			if (fa > fb) {
				return -1;
			}
			if (fa < fb) {
				return 1;
			}
			return 0;
		});}
		return rest
	})

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
function getProductFromList(item){
		var found = props.actie.spaaractie_products.find(el => el.product_id == item)
		return found
	}
	
</script>

<template>
	<div class="shop">
		<div class="title" v-html="sanitizeText(actie.title)">
		</div>
		<div class="shelfunit" 
			id="shelfunit" 
			ref="shelf" 
			:style="{ 'grid-template-columns': `1`,  'grid-auto-columns': `100%`}" 
			>
			<Product 
				v-for="item in productList" 
				:product="item"
				:key="item.id" 
				:actie="actie" 
				:actieproduct="getProductFromList(item.id)" 
				:id="`product-${item.id}`"
			/>
			<i class="disclaimer">*Alle actieartikelen zijn beschikbaar zolang de voorraad strekt. Als er een vervangend artikel beschikbaar is, bieden wij dit als alternatief aan. Op = op!</i>
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

.shelfunit .disclaimer{
	width: 90%;
    grid-column: 1/3;
    margin-left: auto;
    margin-right: auto;
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