<template>
    <div class="products">
        <h3>Products</h3>
        <!--<div class="filter">
            <select v-model="state.filters.department">
                <option 
                    v-for="option in departments" 
                    :key="option.department_id" 
                    :value="option.department_id">
                    {{ option.label }}
                </option>
                <option 
                    :value="`-1`">
                    Geen afdeling
                </option>
            </select>
        </div>-->
        <div class="product-list">
            <Department
                v-for="item in departments" 
                :key="item.id"
                :item="item"
            />
        </div>
    </div>
</template>
<script setup>
import { computed,  onMounted } from 'vue'
import {HTTP} from '@/assets/services/http-common.js';
import Department from '@/components/Storesettings/Departments/Department.vue'
import { useStore } from 'vuex'
const store = useStore()


   /* const state = reactive({
        products: [],
        departments: [],
        page: 0,
        filters: {
            department: null
        }
    })*/

    onMounted(() => {
        getDepartments()
    })
    
    function getDepartments(){
        var params = {
        }
        HTTP.get(`departments`, {params})
        .then((response) => {
            console.log(response)
            store.commit('settings/updateDepartments', response.data)
        })
        .catch((e) => {
            console.log(e)
        })
	}
    
    const departments = computed(()=>{
		return store.getters['settings/getDepartments']
	})

</script>
<style scoped>
.products{
    max-width: 100%;
    overflow-x: hidden;
}
</style>