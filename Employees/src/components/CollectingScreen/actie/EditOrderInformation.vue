<script setup>
    import { ref, reactive, onMounted, defineEmits, defineProps } from 'vue';
	import ReturnProductBarcode from '@/components/CollectingScreen/ReturnProductBarcode.vue'
	//import {HTTP} from '@/assets/services/http-common.js';
	import auth from '@/assets/services/auth'
    import pick from '@/assets/scripts/actie.js'

    const props = defineProps({
        'order': Object
	})

    const state = reactive({
        modalProduct: null,
        rescanBarcode: false
    })
     
    const editOrderTitle = ref('Bestelling wijzigen')
   // const pickedMethodWarning = ref('Let op! Vergeet niet de gebruikte tassen toe te voegen op de bon')
    
    async function cancelOrder(){
        const res = await pick.cancelOrder(props.order)
        if(res === true){
            emit('closeEditOrderModal')
        }
    }

   /* function formattedDate(date){
        return new Date(date).toISOString().split('T')[0]
    }*/

    const emit = defineEmits(['closeEditOrderModal'])

    onMounted(() => {
    })

    
    </script>
<template>
    <div class="edit-order">
        <div class="title" v-html="editOrderTitle"></div>
        <div class="top-buttons">
            <button v-if="auth.isAdmin()" @click="cancelOrder()" v-html="'Annuleren'"></button>
            <button class="btn" @click="emit('closeEditOrderModal')" v-html="'Sluiten'"></button>
        </div>
        <!--<div class="pickup-data">
            <div class="pickup-date" v-html="formattedDate(order.pickupDate)"></div>
            <div class="pickup-time" v-html="order.pickupTime"></div>
        </div>-->
        <div class="title" v-html="`Producten:`"></div>
        <div class="product-list">
            <div class="product" v-for="item in order.product_list" :key="'return' + item.ean">
                <div class="title" v-html="item.product.product_information.title"></div>		
                <div class="ean" v-html="`EAN: ${item.product.product_information.ean}`"></div>
                <button @click="state.rescanBarcode = true; state.modalProduct = item">Return</button>           
            </div>
        </div>
        <div class="modal-overlay" v-if="state.rescanBarcode">
            <ReturnProductBarcode 
                :product="state.modalProduct"
                :order="order"
                @closeBarcodeOverlay="() => state.rescanBarcode = false"/>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.edit-order{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    align-content: center;
}
.edit-order > div{
    width: 100%;
}

.title{
    font-size: 1.5rem;
    margin-top: 5px;
    margin-bottom: 5px;
    border-bottom-color: #a1a1a1;
    border-bottom-width: 2px;
    border-bottom-style: solid;
}

.top-buttons{
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-around;
    align-content: center;
    flex-wrap: wrap;
}

.pickup-data{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    align-content: flex-start;
    font-size: 1.2rem;
}
.product-list{
    width: 100%;
    height: min-content;
    overflow-y: scroll;
}

.product{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    align-content: center;
    border-bottom-color: #a1a1a1;
    border-bottom-width: 2px;
    border-bottom-style: solid;
    padding-bottom: 5px;
    margin-bottom: 5px;
}
.product .title{
    border: unset
}
.ean{
    color: #ff0000;
    font-size: 1.4rem;
}
.barcode-overlay{
    width: 96%;
    height: 98%;
    top: 1%;
    left: 2%;
    background-color: #ffffff;
}
</style>