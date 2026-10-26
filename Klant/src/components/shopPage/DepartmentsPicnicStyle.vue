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
		<div class="dep">
			<div class="select-overlay" v-html="`Categorie`" v-if="!state.selectedDepartment || state.selectedDepartment == 0">
			</div>
			<select v-model="state.selectedDepartment">
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
					v-bind:key="item.department_id" 
					:value="item"
					v-html="item.label">
				</option>
			</select>

		</div>

		
		<!--<div class="departments" v-for="item in state.departments" v-bind:key="item.department_id" v-bind:class="{active: store.state.currentDepartment.department_id == item.department_id}" >
			<span @click="changeActiveDepartment(item)" v-html="`${item.label}`"></span>
		</div>-->
    </div>
</template>

<script setup>
import { reactive, defineProps, onMounted, watch } from 'vue';
import {HTTP} from '@/assets/scripts/http-common.js';
import { useStore } from 'vuex'
import auth from '@/assets/scripts/auth'
import Search from '@/components/shopPage/Search.vue'
const store = useStore()

	defineProps({
	});

	const state = reactive({
		departments: [],
		selectedDepartment: 0
	})

	function getDepartments(){
		const params = {
			'visible': 1
		}
		HTTP.get(`departments`, {params})
		.then((response) => {
			state.departments = response.data
			if(!localStorage.getItem('user_id')) state.departments.shift()
			if(!auth.isNotUnderaged()){
				var deps = state.departments.filter(e => e.nix18 !== 1)
				state.departments = deps
			}
			store.commit('location/changeAvailableDepartment', state.departments)
		})
		.catch(() => {
		})
	}

	onMounted(() => {
		getDepartments()
	})
	
	function changeActiveDepartment(department){
		store.commit('location/resetAvailableSubDepartments')
		store.commit('location/changeDepartment', department)
	}

	watch(() => store.getters['location/getCurrentDepartment'], (newVal, oldVal) => {
		if(newVal === null){
			newVal = oldVal
		}
		state.selectedDepartment = newVal
	})
	
	watch(() => state.selectedDepartment, (newVal, oldVal) => {
		if(newVal != oldVal) changeActiveDepartment(newVal)
	})

	
	watch(() => store.getters['shopsettings/getLoggedIn'], (newVal, oldVal) => {
		getDepartments()
	})

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
}
.departmentList{
	height: 7%;	
    box-shadow: 3px 4px 3px 0px rgba(0,0,0,0.3);
}
.departments, .subDepartments{
    padding: 2px;
	margin: 0px 5px;
	display: inline-flex;
	color: #f6f6f6;
    font-weight: 700;
    border: 2px solid #c5c5c5;
}
.departments span{
	font-size: 1.1rem;
	padding: 2px
}

.departments.active{
	background-color: var(--header-color);
}
.dep{
	width: 75%;
	position: relative;
	height: 100%;
}

select{
	width: 100%;
    height: 100%;
    line-height: 2rem;
    font-size: 1.2rem;
    border: none;
    white-space: nowrap;
}
.select-overlay{
	display: flex;
	position: absolute;
	left: 10px;
	font-size: 1.2rem;
	font-weight: 500;	
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
	height: 100%;
}

.searchbutton{
	height: 100%;
	width: 20%;
    margin-left: 5px;
}
.searchbutton button{
	height: 100%;
	padding: 2px;
	margin: unset;
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

</style>
