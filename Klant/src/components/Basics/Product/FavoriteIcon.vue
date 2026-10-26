
<script setup>
import { defineProps, reactive, watch} from 'vue'
import {HTTP} from '@/assets/scripts/http-common.js';

const props = defineProps({
    'favoriteId': String,
    'productId': String
})

const state = reactive({
    favorite: false
})

function addToFavorite(){
    var params = {
        user_id: localStorage.getItem('user_id'),
        product_id: props.productId
    }
    HTTP.post(`customer_favorites`, params)
    .then((response) => {
        if(!response){
            alert("Something went wrong, try again or try later.")
        }
    })
    .catch(() => {
    })
}

function removeFavorite(){
    var params = {
        fav_id: props.favoriteId
    }
    HTTP.delete(`customer_favorites`, {data: params})
    .then((response) => {
        if(response.data.success){
            // ignore
        }
        if(!response){
            alert("Something went wrong, try again.")
        }
    })
    .catch(() => {
    })
}

watch(() => props.favoriteId, () => {
    if(props.favoriteId != null) state.favorite = true
    else state.favorite = false
},{immidiate: true, deep: true})

</script>
<template>
<div class="favorite-icon">
    <input 
        type="checkbox"
        class="star" 
        v-model="state.favorite" 
        @click="state.favorite ? removeFavorite() : addToFavorite()"/>
</div>
</template>
<style lang="scss" scoped>  
.favorite-icon{
	position: absolute;
    right: 5px;
    top: 5px;
    height: 3rem;
    width: 3rem;
}

.favorite-icon .star{
    font-size: 3rem;
}

.favorite-icon .star::before{
	transform: translateX(0%) translateY(-40%);
}

</style>