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
		<!--<select class="cats" v-model="state.selectedDepartment" v-if="shelfStyle == 0 || (shelfStyle != 0 && currentDepartment == 0)">
			<option v-if="shelfStyle == 0" :value="null" disabled selected>Selecteer een afdeling</option>
			<option v-if="(shelfStyle != 0 && currentDepartment == 0)" :value="0" disabled selected>Selecteer een afdeling</option>
            <option 
				class="departments" 
				v-for="item in availableDepartments" 
				v-bind:key="item.department_id"
				:value="item"
				v-html="item.label">
			</option>
		</select>-->
		<div class="cats subs" v-if="shelfStyle != 0 && currentDepartment != 0 && currentDepartment !== null">
			<Select 
			:options="state.openSubs" 
			:current="state.selectedSubDepartment" 
			:nothing="{disabled: true, selected: true, value: 'null', label:'Productgroep'}"
			@updateSelected="(callback) => {state.selectedSubDepartment = callback}" 
		/>
		</div>
		<div class="cats">
			<Select 
				:options="availableDepartments" 
				:current="state.selectedDepartment" 
				:nothing="{disabled: true, selected: true, value: 'null', label:'Selecteer een afdeling'}"
				@updateSelected="(callback) => {state.selectedDepartment = callback}" 
			/>
		</div>
		<div class="fav"  v-if="shelfStyle == 0  && path=='/favorites'">
			Favorieten
		</div>
		<div class="sizing" v-if="shelfStyle == 0 && (path == '/' || path=='/favorites' || path=='/discounts')">
			<button class="left-shadow" @click="changesize()" v-html="`H ${amountOfShelf}`"></button>
		</div>
		<div class="sizing back" v-if="(shelfStyle == 1 || shelfStyle == 2) && (path == '/' || path=='/discounts') && (state.selectedDepartment != 0)">
			<button class="left-shadow" @click="returnToDeps()" v-html="`Terug`"></button>
		</div>
    </div>
</template>

<script setup>
import { reactive, defineProps, onMounted, computed, watch } from 'vue';
import { useStore } from 'vuex'
import {useRoute} from 'vue-router'
import Search from '@/components/shopPage/Search.vue'
import Select from '@/components/Basics/Selection/Select.vue'
const store = useStore()





const route = useRoute();
const path = computed(() =>route.path)
	defineProps({
	});

	const state = reactive({
        selectedDepartment: null,
		selectedSubDepartment: null,
		openSubs: []
	})

	const shelfStyle = computed(() => { return store.getters['shopsettings/getShelfStyle']})
	
	const amountOfShelf = computed(() => { return store.getters['shopsettings/getAmountOfShelf']})

    const availableDepartments = computed(() => {
        return store.getters['location/getAvailableDepartments']
    })

    

	const currentDepartment = computed(() => { 
		return store.getters['location/getCurrentDepartment']
	})

    onMounted(() => {
    })

    watch(() => state.selectedDepartment, (newVal) => {
		state.selectedSubDepartment = null
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
	watch(() => store.getters['location/getAvailableSubDepartments'], () => {
		state.openSubs = store.getters['location/getAvailableSubDepartments']
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
    width: calc(100% - 10px);
	padding-left: 5px;
	padding-right: 5px;
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

.cats{
	width: 100%;
    height: 80%;
    line-height: 2rem;
    font-size: 1.2rem;
    padding: 0px;
    margin: 5px;
    border: none;
    white-space: nowrap;
    overflow-x: hidden;
}

.favorites .cats{
	display: none;
}
.favorites .cats.subs{
	display: block;
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
	height: 80%;
	color: #ffffff;
	background-color: #424242;
	border-color: #424242;
    font-size: 1rem;
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
	height: 80%;
	padding: 2px;
	margin: 0;
	color: #ffffff;
	background-color: #424242;
	border-color: #424242;
}
.searchbutton button img{
	height: 80%;
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


	.searchbutton button{
		height: 3.5rem;
		width: 3.5rem;
		aspect-ratio: 1;
	}
	.sizing button{
		height: 3.5rem;
		width: 3.5rem;
		aspect-ratio: 1;
	}
}
@media only screen and (min-width: 500.98px) and (orientation: portrait) {	
	.favorites .fav{
		font-size: 2rem;
	}
	
}
</style>
