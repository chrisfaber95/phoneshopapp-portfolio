<template>
    <div class="departmentList"
        :class="isPicnic ? 'picnic' : ''">
		<div class="departments" 
            v-for="item in availableDepartments" 
            v-bind:key="item.department_id" 
            v-bind:class="{active: store.getters['location/getCurrentDepartment'] == item.slug}"  
            @click="changeActiveDepartment(item)">
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
import { reactive, computed } from 'vue';
import { useStore } from 'vuex'
import router from '@/router';
import VLazyImage from "v-lazy-image";
const store = useStore()

	const state = reactive({
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

	
	
	function changeActiveDepartment(department){
		store.commit('location/changeDepartment', department)
	}

    const availableDepartments = computed(() => {
        return store.getters['location/getAvailableDepartments']
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

.departmentList.picnic .departments .content{
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

.departmentList.picnic{
    grid-template-columns: repeat(2, 1fr);
	height: 100%;
    grid-auto-rows: auto;
	background: rgb(255,255,255);
	grid-gap: 1px;
	padding: 5px;
}


.departmentList.picnic .departments span{
    width: 100%;
}
.departmentList.picnic .content .department-img{
    height: auto;
    max-width: 75%;
    padding: 5px;
}
.departmentList.picnic .departments{
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

.departmentList.picnic .departments:nth-child(2n){
	border-right: 2px solid #ececec00;

}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {	
	.departmentList.picnic{
		grid-template-columns: repeat(3, 1fr);
	}
	.departmentList.picnic .departments .department-img{
		max-width: 60%;
	}
	
	.departmentList.picnic .departments{
		border: unset;
        border-bottom: 2px solid #ececec;
		background: unset;
	}

    .departmentList.picnic .departments{
		border-right: 2px solid #ececec;	
	}
	.departmentList.picnic .departments:nth-child(2n){
		border-right: 2px solid #ececec;	
	}
	.departmentList.picnic .departments:nth-child(3n){
		border-right: 2px solid #ececec00;	
	}
	
}
@media only screen and (min-width: 500.98px) and (orientation: portrait) {	
	.departmentList.picnic{
		grid-template-columns: repeat(2, 1fr);
	}
	.departmentList.picnic .department-img{
		max-width: 60%;
	}
}
</style>