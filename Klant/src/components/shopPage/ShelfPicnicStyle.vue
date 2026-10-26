<script setup>
	import { reactive, defineProps, onMounted, computed, watch, ref } from 'vue';
	import { useStore } from 'vuex'
	import Product from '@/components/shopPage/ProductPicnicStyle.vue'
	import {HTTP} from '@/assets/scripts/http-common.js';
	import Departments from '@/components/shopPage/DepartmentsPicnicStyle.vue'
	import OldDepartments from '@/components/shopPage/DepartmentsOldStyle.vue'
	import $ from 'jquery'

	const store = useStore()

	

	defineProps({
	});

	const state = reactive({
		productList: [],
		selectedDepartment: null,
		removed: [],
		subDepartments: [],
		currentSub: null
	})

	function getProducts(){
		if(currentDepartment.value?.department_id && currentDepartment.value?.department_id != 0){
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
				initSwipe()
			})
			.catch((err) => {
				console.log(err)
			})
		}
	}

	function removeProduct(prod){
		state.removed.push(prod.id)
	}
	
	onMounted(() => {
		getProducts()
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
	const currentDepartment = computed(() => { 
		
		return store.getters['location/getCurrentDepartment']
	})

	const availableDepartments = computed(() => { 
		
		return store.getters['location/getAvailableDepartments']
	})

	watch(() => store.getters.getAvailableSubDepartments, (newVal, oldVal) => {
		if(newVal != oldVal) state.subDepartments = newVal
	})

	watch(() => store.getters['location/getCurrentSubDepartment'], (newVal) => {
		try{
			if(state.currentSub != newVal){
				if(newVal != null){
					scrollParentToChild( document.getElementById('shelfunit') , document.getElementById(`${newVal}`))
					//document.getElementById(`${newVal}`).scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
					state.currentSub = newVal
				}
				else{
					$('#shelfunit').animate({
						scrollTop: 0
					},'slow');
				}
			}
			else{
				scrollParentToChild( document.getElementById('shelfunit') , document.getElementById(`${newVal}`))
			}
		}
		catch{// ignore
		}
	})

	const shelf = ref();
	
	watch(() => store.getters['location/getCurrentDepartment'], (newVal, oldVal) => {
		if (newVal == null || newVal == '') newVal = 0
		else{
			if(newVal.department_id == 1){				
				getFavorites()
			}
			else{
				getProducts()
			}
		}
			
		state.selectedDepartment = newVal
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
				initSwipe()
			})
			.catch(() => {
			})
	}
	function changeActiveDepartment(department){
		store.commit('location/changeSubDepartment', null)
		state.currentSub = null
		store.commit('location/setAvailableSubDepartments', [])
		state.productList = []
		store.commit('location/changeDepartment', department)
	}

	function goNext(){
		var index = availableDepartments.value.findIndex(el => el.department_id == currentDepartment.value.department_id)
		if (availableDepartments.value.length -1 != index) changeActiveDepartment(availableDepartments.value[index+1])
		else{
			changeActiveDepartment(availableDepartments.value[0])
		}

    }

	function goPrev(){
		var index = availableDepartments.value.findIndex(el => el.department_id == currentDepartment.value.department_id)
		if (index != 0) changeActiveDepartment(availableDepartments.value[index-1])
		else{
			changeActiveDepartment(availableDepartments.value.at(-1))
		}
	}

	function initSwipe(){
        let touchstartX = 0
        let touchendX = 0
            
        function checkDirection() {
        if (touchendX < touchstartX - (screen.availWidth/2)) goNext()
        if (touchendX > touchstartX + (screen.availWidth/2)) goPrev()
        }

        document.getElementById('shelfunit').addEventListener('touchstart', e => {
			touchstartX = e.changedTouches[0].clientX
        })

        document.getElementById('shelfunit').addEventListener('touchend', e => {
			touchendX = e.changedTouches[0].clientX
			checkDirection()
        })
    }
	
	watch(() => state.selectedDepartment, (newVal, oldVal) => {
        changeActiveDepartment(newVal)
	})

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
	
function scrollParentToChild(parent, child) {

// Where is the parent on page
var parentRect = parent.getBoundingClientRect();
// What can you see?
var parentViewableArea = {
  height: parent.clientHeight,
  width: parent.clientWidth
};

// Where is the child
var childRect = child.getBoundingClientRect();
// Is the child viewable?
var isViewable = (childRect.top >= parentRect.top) && (childRect.bottom <= parentRect.top + parentViewableArea.height);

// if you can't see the child try to scroll parent
if (!isViewable) {
	// Should we scroll using top or bottom? Find the smaller ABS adjustment
	const scrollTop = childRect.top - parentRect.top;
	//const scrollBot = childRect.bottom - parentRect.bottom;
	//if (Math.abs(scrollTop) < Math.abs(scrollBot)) {
		// we're near the top of the list
		var scroll = parent.scrollTop + scrollTop;
		$('#shelfunit').animate({
			scrollTop: scroll
		},'slow');
//	} else {
		// we're near the bottom of the list
//		parent.scrollTop += scrollBot;
//	}
}

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
        <Departments v-if="currentDepartment == '0'" style="display: none;"/>
		<div class="old-departments" ref="dep" v-if="currentDepartment == '0'">
            <OldDepartments/>
		</div>
		<div class="title" v-html="sanitizeText(state.currentSub) || currentDepartment?.label">
		</div>
		<div class="shelfunit" 
			id="shelfunit" 
			ref="shelf" 
			:style="{ 'grid-template-columns': `1`,  'grid-auto-columns': `100%`}" 
			v-if="currentDepartment != '0'" :key="currentDepartment"
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
.old-departments{
	height: 100%;
}
.departmentList{
	height: 7%;
	overflow-x: hidden;
}
.old-departments .departmentList{
    grid-template-columns: repeat(2, 1fr);
	height: 100%;
    grid-auto-rows: auto;
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
	.old-departments .departmentList{
		grid-template-columns: repeat(3, 1fr);
	}
	.old-departments .departmentList .departments .department-img{
		max-width: 60%;
	}
	
	.old-departments .departmentList .departments{
		border: unset;
		background: unset;
	}

	
}
@media only screen and (min-width: 500.98px) and (orientation: portrait) {	
    .shelfunit{
        grid-template-columns: repeat(3, 1fr);
    }
	.shop .title{
		font-size: 1.4rem;
	}
	.old-departments .departmentList{
		grid-template-columns: repeat(2, 1fr);
	}
	.old-departments .departmentList .department-img{
		max-width: 60%;
	}
}


</style>
<style>

.old-departments .departmentList .departments span{
    width: 100%;
}
.old-departments .departmentList .content .department-img{
    height: auto;
    max-width: 75%;
    padding: 5px;
}
.old-departments .departmentList .departments{
	flex-direction: column !important;
	padding: 5px;
	border: unset;
	background: unset;
	border-radius: unset;
	box-shadow: unset;
	background-color: #ffffff;
	border-right: 2px solid #ececec;
	border-bottom: 2px solid #ececec;
}
.old-departments .departmentList{
	background: rgb(255,255,255);
	grid-gap: 1px;
	padding: 5px;

}

.old-departments .departmentList .departments:nth-child(2n){
	border-right: 2px solid #ececec00;

}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {	
	.old-departments .departmentList .departments:nth-child(3n){
		border-right: 2px solid #ececec00;
	
	}
}
</style>