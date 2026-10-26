<template>
    <div class="departmentList">
		<div class="searchbutton">
			<button @click="state.showSearch = !state.showSearch">
				<img class="pricetag" :src="require('@/assets/icons/search.svg')" />
			</button>

			<div id="search" v-if="state.showSearch">
				<div class="searchoverlay" @click="state.showSearch = !state.showSearch"></div>				
				<transition name="fade">
					<Search 
						@closeModal="(callback) => {state.showSearch = false;}"
						@goToProduct="(callback) => {state.showSearch = false;}"
					/>
				</transition>
			</div>
		</div>
		<select class="cats" v-model="state.selectedDepartment" v-if="shelfStyle == 0 || (shelfStyle != 0 && currentDepartment == 0)">
			<option v-if="shelfStyle == 0" :value="null" disabled selected>Selecteer een afdeling</option>
			<option v-if="(shelfStyle != 0 && currentDepartment == 0)" :value="0" disabled selected>Selecteer een afdeling</option>
            <option 
				class="departments" 
				v-for="item in availableDepartments" 
				v-bind:key="item.department_id"
				:value="item"
				v-html="item.label">
			</option>
		</select>
		<select class="subs" v-model="state.selectedSubDepartment" v-if="shelfStyle != 0 && currentDepartment != 0">
			<option :value="null" disabled selected>Selecteer een afdeling</option>
			<option 
				class="departments" 
				v-for="item in availableSubDepartments" 
				:key="item" 
				:value="item"
				v-html="sanitizeText(item)">
			</option>
		</select>
		<div class="fav"  v-if="shelfStyle == 0  && path=='/favorites'">
			Favorieten
		</div>
		<div class="sizing" v-if="shelfStyle == 0 && (path == '/' || path=='/favorites' || path=='/grocerylist' || path=='/discounts')">
			<button class="left-shadow" @click="changesize()" v-html="`H ${amountOfShelf}`"></button>
		</div>
		<div class="sizing back" v-if="(shelfStyle == 1 || shelfStyle == 2) && (path == '/' || path=='/discounts' || path=='/grocerylist') && (state.selectedDepartment != 0)">
			<button class="left-shadow" @click="returnToDeps()" v-html="`Terug`"></button>
		</div>
    </div>
</template>

<script setup>
import { reactive, defineProps, onMounted, computed, watch } from 'vue';
import { useStore } from 'vuex'
import {useRoute} from 'vue-router'
import Search from '@/components/listPage/Search.vue'
const store = useStore()

function sanitizeText(item){
	return titleCase(item.replaceAll('_', ' '))
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

const route = useRoute();
const path = computed(() =>route.path)
	defineProps({
	});

	const state = reactive({
        selectedDepartment: null,
		selectedSubDepartment: null
	})

	const shelfStyle = computed(() => { return store.getters['shopsettings/getShelfStyle']})
	
	const amountOfShelf = computed(() => { return store.getters['shopsettings/getAmountOfShelf']})

    const availableDepartments = computed(() => {
        return store.getters['location/getAvailableDepartments']
    })

    const availableSubDepartments = computed(() => {
        return store.getters['location/getAvailableSubDepartments']
    })

	const currentDepartment = computed(() => { 
		return store.getters['location/getCurrentDepartment']
	})

    onMounted(() => {
    })

    watch(() => state.selectedDepartment, (newVal) => {
        store.commit('location/changeDepartment', newVal)
	})

	watch(() => state.selectedSubDepartment, (newVal) => {
        store.commit('location/changeSubDepartment', newVal)
	})

	watch(() => store.getters['location/getCurrentDepartment'], () => {
		state.selectedDepartment = store.getters['location/getCurrentDepartment']
	}, {
		immediate: true, 
		deep: true
	})

	function changesize(){
		if(amountOfShelf.value == 5){	
			store.commit('shopsettings/changeShelfSize', 3)
		}
		else{
			let size = amountOfShelf.value + 1
			store.commit('shopsettings/changeShelfSize',size)
		}
		
	}

	function returnToDeps(){
		state.selectedDepartment = 0
		state.selectedSubDepartment = null
        store.commit('location/changeSubDepartment', null)
	}
	
</script>

<style scoped>
.departmentList{
	width: 100%;
	overflow-y: hidden;
	display: inline-flex;
	white-space: nowrap;
	border-bottom: 2px solid #666666;
	border-top: 2px solid #666666;
	border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
	align-items: center;
    align-content: center;
    flex-wrap: nowrap;
    flex-direction: row;
	height: 100%;
    box-shadow: 3px 4px 3px 0px rgba(0,0,0,0.3);
}
.departments{
	background-color: #3a3a3a;
    padding: 2px;
	margin: 0px 5px;
	display: inline-flex;
	color: #f6f6f6;
    font-weight: 700;
    border: 1px solid #ffffff;
	border-radius: 10px;	
    box-shadow: 4px 5px 4px 0px rgba(0,0,0,0.4);
    border: 2px solid #c5c5c5;
}
select{
	width: 100%;
    height: 80%;
    line-height: 2rem;
    font-size: 1.2rem;
    padding: 5px;
    margin: 5px;
    border: none;
    white-space: nowrap;
}

.favorites .cats{
	display: none;
}
.fav{
	display: none;
}
.favorites .fav{
	width: 100%;
    line-height: 2rem;
    font-size: 1.4rem;
    padding: 5px;
    margin: 5px;
    border: none;
    white-space: nowrap;
	font-weight: 600;
	text-align: left;
	display: block;
}
.sizing{	
    max-width: 25%;
    display: contents;
	height: 100%;
}
.sizing button{
	padding: 2px;
	margin:0;
	height: 90%;
	color: #ffffff;
	background-color: #424242;
	border-color: #424242;
}
.favorites .searchbutton{
	display: none;
}

.favorites .back{
	display: none;
}
.searchbutton{
	width: fit-content;
	height: 100%;
	max-width: 25%;
    display: contents;
}
.searchbutton button{
	height: 90%;
	padding: 2px;
	margin: 0;
	color: #ffffff;
	background-color: #424242;
	border-color: #424242;
}
.searchbutton button img{
	height: 100%;
	width: auto;
	filter: invert(1);
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
	.favorites .fav{
		font-size: 2rem;
	}
}
@media only screen and (min-width: 500.98px) and (orientation: portrait) {	
	.favorites .fav{
		font-size: 2rem;
	}
	
}
</style>
