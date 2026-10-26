<template>
    <div class="product" @click="openEdit()">
        <img :src="`https://www.cooplubbers.nl${state.product?.product_information?.imgurl}`" />
        <div class="basic">
            <p v-html="`${state.product?.product_information?.title || ''}  ${state.product?.product_information?.variant || ''}`"></p>
            <p v-html="state.product?.ean || ''"></p>
            <!--<p v-html="item.schapcode || ''"></p>-->
            <p v-html="state.product?.price || ''"></p>
            <button @click="openEdit()">Open</button>
        </div>
        <!--<p v-html="item.btw || ''"></p>
        <p v-html="item.department?.label || ''"></p>-->
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
        product: null,
        edit: false
    })

    onMounted(() => {
        state.product = props.item
        if(("product_information" in state.product) == false){
            getInformation(state.product.ean)
        }
    })

    function getInformation(ean){    
		HTTP.get(`product/${ean}`)
		.then((response) => {
			state.product = response.data
		})
		.catch((e) => {
            console.log(e)
		})
    }

    function openEdit(){
        store.commit('settings/updateEditProduct', state.product)
    }
    
</script>
<style scoped>
    .product{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: space-evenly;
        border-bottom: 1px solid #ececec;
    }
    .product > *{
        max-width: 60%;
        white-space: break-spaces;
    }
    .product > img{
        width: 40%;
    }
    .product .modal-overlay{
        max-width: 100%;
    }
    .product .edit{
        width: 2.8rem;
    }
</style>