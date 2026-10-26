<template>
    <div class="product">
        <div class="basic">
            <img :src="`https://www.cooplubbers.nl/${item.imgurl}`" />
            <p v-html="item.department_id ? `ID: ${item.department_id}` : ''"></p>
            <!--<p v-html="item.slug || ''"></p>-->
        </div>
        <div class="info">
            <p v-html="item.label || ''"></p>
            <p v-html="item.main_department ? `Hoofd afdeling: ${item.main_department}` : ''"></p>
        </div>
        <div class="extra">
            <p v-html="`NIX18: ${item.nix18 ? 'Ja' : 'Nee'}`"></p>
        <p v-html="`Zichtbaar: ${item.visible ? 'Ja' : 'Nee'}`"></p>
        <div class="buttons">
            <button @click="deleteDepartment()"><svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M17 5V4C17 2.89543 16.1046 2 15 2H9C7.89543 2 7 2.89543 7 4V5H4C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H5V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H17ZM15 4H9V5H15V4ZM17 7H7V18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18V7Z"
                fill="currentColor"
            />
            <path d="M9 9H11V17H9V9Z" fill="currentColor" />
            <path d="M13 9H15V17H13V9Z" fill="currentColor" />
            </svg></button>
        </div>
        
        </div>
        
    </div>
</template>
<script setup>
import { defineProps, reactive, onMounted } from 'vue'
import {HTTP} from '@/assets/services/http-common.js';
import { useStore } from 'vuex'
const store = useStore()

    const props = defineProps({
        'item': Object
    })

    const state = reactive({
        product: null
    })

    function deleteDepartment(){
        var params = {
            'department_id': props.item.department_id
        }
        console.log(params)
        HTTP.delete(`departments`, {params: params})
        .then((response) => {
            if(response.data == 1){
                var filtered = store.getters['settings/getDepartments'].filter((e) => {
                    return e.department_id !== props.item.department_id;
                })
                store.commit('settings/updateDepartments', filtered)
            }
        })
        .catch((e) => {
            console.log(e)
        })
    }

    onMounted(() => {
        state.product = props.item
    })
    
</script>
<style scoped>
.product{
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
}
.product > *{
    max-width: 100%;
    white-space: break-spaces;
}
.product .basic{
    grid-row: 1/4;
    grid-column: 1;
}
.basic img{
    width: 80%;
    margin-left: auto;
    margin-right: auto;
}
.product .info{
    grid-row: 1;
    grid-column: 2;
}
.product .extra{
    grid-row: 2/4;
    grid-column: 2;
}
.product .modal-overlay{
    max-width: 100%;
}
</style>