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
		<!--<div class="departments" v-for="item in state.departments" v-bind:key="item.department_id" v-bind:class="{active: store.state.currentDepartment.department_id == item.department_id}" >
			<span @click="changeActiveDepartment(item)" v-html="`${item.label}`"></span>
		</div>-->
		<!--<div class="select-overlay" v-html="`Categorie`" v-if="!state.selectedDepartment || state.selectedDepartment == 0">
		</div>-->
		<select v-model="state.selectedDepartment" v-if="shelfStyle == 0">
			<!--<option 
				class="departments" 
				v-bind:key="`Categorie`" 
				:value="0"
				disabled="true"
				v-html="`Categorie`">
			</option>-->
		<option 
				class="departments" 
				v-for="item in state.departments" 
				v-bind:key="item?.department_id || 0" 
				:value="item"
				v-html="item.label">
			</option>
		</select>
		<select class="subs" v-model="state.selectedSubDepartment" v-if="shelfStyle != 0">
			<!--<option 
				class="departments" 
				v-bind:key="`Categorie`" 
				:value="0"
				disabled="true"
				v-html="`Categorie`">
			</option>-->
			<option :value="null" disabled selected>Selecteer een afdeling</option>
			<option 
				class="departments" 
				v-for="item in state.subDepartments" 
				v-bind:key="item" 
				v-bind:class="{active: store.getters['location/getCurrentSubDepartment'] == item}"
				:value="item"
				v-html="sanitizeText(item)">
			</option>
		</select>
		<div class="sizing" v-if="shelfStyle == 0 && (path == '/' || path=='/favorites' || path=='/discounts')">
			<button class="left-shadow" @click="changesize()" v-html="`H ${amountOfShelf}`"></button>
		</div>
		<div class="sizing" v-if="(shelfStyle == 1 || shelfStyle == 2) && (path == '/' || path=='/favorites' || path=='/discounts') && (state.selectedDepartment != 0)">
			<button class="left-shadow" @click="changeActiveDepartment('0')" v-html="`Terug`"></button>
		</div>
    </div>
</template>

<script setup>
import { reactive, defineProps, onMounted, computed, watch } from 'vue';
import {HTTP} from '@/assets/scripts/http-common.js';
import auth from '@/assets/scripts/auth';
import { useStore } from 'vuex'
	import {useRoute} from 'vue-router'
import Search from '@/components/shopPage/Search.vue'
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
		departments: [],
		selectedDepartment: null,
		showSearch: false,
		favoriteAmount: 0,
		subDepartments: [],
		selectedSubDepartment: null
	})

	function getDepartments(){
		const params = {
			'visible': 1
		}
		HTTP.get(`departments`, {params})
		.then((response) => {
			state.departments = response.data
			if(!localStorage.getItem('user_id')) state.departments.shift()
			if(!auth.isNotUnderaged() && (localStorage.getItem('dob') || localStorage.getItem('dob') != '')){
				var deps = state.departments.filter(e => e.nix18 !== true)
				state.departments = deps
			}
			store.commit('location/changeAvailableDepartment', state.departments)
			if(store.getters['shopsettings/getShelfStyle'] == 0){
				state.selectedDepartment = state.departments[0]
				changeActiveDepartment(state.departments[0])
			}
			else{
				state.selectedDepartment = 0
				changeActiveDepartment('0')
			}
		})
		.catch((e) => {
			console.log(e)
		})
	}

	onMounted(() => {
		getDepartments()
		getFavoritesDep()
	})
	
	function changeActiveDepartment(department){
		store.commit('location/setAvailableSubDepartments', [])
		state.selectedSubDepartment = null
		store.commit('location/changeSubDepartment', '')
		store.commit('location/changeDepartment', department)
	}

	function changeActiveSubDepartment(department){
		if(department != '' || department != null){
			store.commit('location/changeSubDepartment', department)
		}
	}

	watch(() => state.selectedDepartment, (newVal, oldVal) => {
		if(newVal != oldVal) changeActiveDepartment(newVal)
	})

	watch(() => store.getters['location/getCurrentDepartment'], (newVal, oldVal) => {
		if(newVal != oldVal) state.selectedDepartment = newVal
	})

	
	watch(() => store.getters['location/getCurrentSubDepartment'], (newVal, oldVal) => {
		if(newVal != oldVal) state.selectedSubDepartment = newVal
	})

	watch(() => store.getters['location/getAvailableSubDepartments'], (newVal, oldVal) => {
		state.subDepartments = newVal
	}, {
		immediate: true,
		deep: true
	})

	watch(() => state.selectedSubDepartment, (newVal, oldVal) => {
		if(newVal != oldVal) changeActiveSubDepartment(newVal)
	})

	

	watch(() => store.getters['shopsettings/getLoggedIn'], (newVal, oldVal) => {
		if(newVal == false && store.getters['location/getCurrentDepartment'].department_id == 1 ){
			state.departments.shift()
			store.commit('location/changeAvailableDepartment', state.departments)
			changeActiveDepartment(state.departments[0])
		}
		else if(newVal == true){
			getFavoritesDep()
		}
	})

	watch(() => store.getters['location/getAvailableSubDepartments'], () => {
		state.selectedSubDepartment = null
	}, {
		immediate: true, 
		deep: true
	})
	
	function getFavoritesDep(){
		let params
		params = {
			stock: 1,
			customer_id: localStorage.getItem('user_id')
		}
		HTTP.get(`customer_favorites`, {params})
		.then((response) => {
			if(response.data.length < 15){
				changeActiveDepartment(state.departments[1])
			}
		})
		.catch((err) => {
			console.log(err)
		})
	}
	function changesize(){
			if(amountOfShelf.value == 5){	
				store.commit('shopsettings/changeShelfSize', 3)
			}
			else{
				let size = amountOfShelf.value + 1
				store.commit('shopsettings/changeShelfSize',size)
			}
			
		}
	const shelfStyle = computed(() => { return store.getters['shopsettings/getShelfStyle'] || 0})
	
	const amountOfShelf = computed(() => { return store.getters['shopsettings/getAmountOfShelf'] || 4})
	
</script>

<style scoped>
.departmentList{
	width: 100%;
	overflow-x: scroll;
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
.departments, .subDepartments{
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
.departments span{
	font-size: 1.1rem;
	padding: 2px
}

.departments.active{
	background-color: var(--header-color);
}

select{
	width: 50%;
	height: 80%;
	line-height: 2rem;
	font-size: 1.2rem;
	padding: 5px;
    margin: 5px;
	border: none;
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

.subs{
	padding: 2px;
}
.select-overlay{
	display: block;
	position: absolute;
	left: 20px;
	font-size: 1.2rem;
	font-weight: 500;
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
</style>
