 <template>
    <div class="departmentList">
		<div class="departments" v-for="item in state.departments" v-bind:key="item.department_id" v-bind:class="{active: store.getters['location/getCurrentDepartment'] == item.slug}"  @click="changeActiveDepartment(item)">
            <div class="content" :class="isPicnic ? 'picnic' : ''">

				<v-lazy-image 
                    class="department-img" 
                    v-bind:src="item.imgurl || ''" 
                    :intersection-option="state.lazyOptions " />
				<span v-html="`${item.label}`"></span>
			</div>
		</div>
    </div>
</template>

<script setup>
import { reactive, onMounted, computed, watch } from 'vue';
import {HTTP} from '@/assets/scripts/http-common.js';
import { useStore } from 'vuex'
import auth from '@/assets/scripts/auth'
import router from '@/router';
import VLazyImage from "v-lazy-image";
const store = useStore()

	const state = reactive({
		departments: [],
		picnic: false,
        currentPage: router.currentRoute.value.path,
    lazyOptions: {
        rootMargin: '50%',
        threshold: buildThresholdList()
    }
	})
function buildThresholdList() {
  let thresholds = [];
  let numSteps = 100;

  for (let i=1.0; i<=numSteps; i++) {
    let ratio = i/numSteps;
    thresholds.push(ratio);
  }

  thresholds.push(0);
  return thresholds;
}

	const currentPage = computed(() =>{
        return router.currentRoute.value.path
    })

	function getDepartments(){
		const params = {
			'visible': 1
		}
		HTTP.get(`departments`, {params})
		.then((response) => {
			state.departments = response.data
			if(currentPage.value == '/favorites'){
				store.commit('location/changeDepartment', state.departments[0])
			}
			else{
				if(!localStorage.getItem('user_id')) state.departments.shift()
				if(!auth.isNotUnderaged() && (localStorage.getItem('dob') || localStorage.getItem('dob') != '')){
					var deps = state.departments.filter(e => e.nix18 !== 1)
					state.departments = deps
				}
				store.commit('location/changeAvailableDepartment', state.departments)
			}
			//changeActiveDepartment(state.departments[0])
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

	watch(() => store.getters['location.getCurrentDepartment'], (newVal, oldVal) => {
		if(newVal != 0){
            if(newVal?.nix18){
                if(!localStorage.getItem('nix18') || localStorage.getItem('nix18') == 0){
                    if(confirm('NIX18 Waarschuwing')){
                        localStorage.setItem('nix18', 1)
                    }
                    else{
                        localStorage.setItem('nix18', 0)
                        store.commit('location/changeDepartment', oldVal)
                    }
                }
            }
        }	
	})

	watch(() => store.getters['shopsettings/getLoggedIn'], () => {
		getDepartments()
	})

	const shelfStyle = computed(() => { return store.getters['shopsettings/getShelfStyle'] || 0})

	const isPicnic = computed(() => { 
		if(shelfStyle.value == 2) return true
		return false
	})

</script>

<style scoped>
.departmentList{
	width: 100%;
	display: grid;
    grid-template-columns: repeat(1, 1fr);
    height: 100%;
    overflow-y: scroll;
    overflow-x: hidden;
    grid-gap: 20px;
    box-sizing: border-box;
    grid-auto-rows: minmax(8rem, 9rem);
    padding: 10px;
	height: 100%;	
}

.departments, .subDepartments{
    background-color: #f1f1f1;
    background: -webkit-gradient(linear, left, right, from(#fdfdfd),to(#f1f1f1));
    background: linear-gradient(to right, #fdfdfd 0%,#f1f1f1 100%);
    padding: 10px;
    color: #353535;
    font-weight: 700;
    border: 1px solid #fff;
    border-radius: 15px;
    -webkit-box-shadow: 4px 5px 4px 0 rgb(0 0 0 / 40%);
    box-shadow: 4px 5px 4px 0rgba(0,0,0,.4);
	display: block;
	border: 2px solid #c5c5c5;
	padding-left: 5px;
}

.departments .content{
	display: grid;
	grid-template-columns: 50% 50%;
	grid-template-rows: 100%;
	height: 100%;
	width: 100%;

}
.departments .content span{
	font-size: 1.2rem;
	padding: 2px;
    grid-column: 2;
	grid-row: 1;
    text-overflow: ellipsis;
    overflow: hidden;
}

.departments.active{
	background-color: var(--header-color);
}

.departments .content .department-img{
	height: auto; 
	max-height: 100%;
	grid-column: 1;
	grid-row: 1;
    max-width: calc(100% - 5px);
    width: auto;
    margin-left: 5px;
}

.departments .content.picnic{
	display: flex;
	flex-direction: column;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: space-between;
    align-items: center;	
	width: calc(100% - 16px);
    margin-left: auto;
    margin-right: auto;
}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {	
    .departmentList{
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: minmax(9rem, 11rem);
    }
	.departments span[data-v-396fd15e] {
		font-size: 1.2rem;
	}
}

@media only screen and (min-width: 500.98px) and (orientation: portrait) {	
    .departmentList{
		grid-template-columns: repeat(1, 1fr);
		grid-auto-rows: minmax(10rem, 11rem);
    }
	.departments span[data-v-396fd15e] {
		font-size: 1.8rem;
	}
}
</style>