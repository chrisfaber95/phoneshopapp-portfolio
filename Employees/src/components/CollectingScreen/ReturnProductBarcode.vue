<script setup>
    import { onMounted, reactive, ref, defineEmits, defineProps } from 'vue';
    import { createApp } from 'vue';
    import VueSimpleAlert from 'vue3-simple-alert';
	//import {HTTP} from '@/assets/services/http-common.js';
	//import auth from '@/assets/services/auth'
    import VueBarcode from '@chenfengyuan/vue-barcode';
    import pick from '@/assets/scripts/picking.js'
	import { useStore } from 'vuex'
    
    const app = createApp({});
    app.use(VueSimpleAlert);
	const store = useStore()


    const props = defineProps({
        'product': Object,
        'order': Object
	})
    const options = ref([
        { text: 'Defect', value: 'Defect' },
        { text: 'THT', value: 'THT' }
    ])

    const state = reactive({
        returnAmount: 0,
        reasonReturn: ''
    })
     
    //const editOrderTitle = ref('Bestelling wijzigen')
   // const pickedMethodWarning = ref('Let op! Vergeet niet de gebruikte tassen toe te voegen op de bon')
    

    const emit = defineEmits(['closeBarcodeOverlay'])

    onMounted(() => {
    })

    function saveProduct(){
        var order = props.order
        let id = order.product_list.map(e => e.id).indexOf(props.product.id)
        order.product_list[id].returned = state.returnAmount
        order.product_list[id].reason_return = state.reasonReturn
        store.commit('picking/updateOrderInList', order)
        emit('closePickingMethodChooser')
        pick.updateOrder(order)        
    }

    function validateAmount(){
        if(state.returnAmount > props.product.picked - props.product.returned){
            app.$alert(                    
                `Aantal producten kan niet hoger zijn dan het aantal producten in de bestelling.`,
                "Teveel producten",
                'warning',
                {
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#F58320',
                    cancelButtonColor: '#e4e4e4',
                    duration: 10000,
                }
            )
            .then(() => {
                state.returnAmount = 0
            })
            .catch(() => {
            state.returnAmount = 0
            })
        }
    }
    
    </script>
<template>    
    <div class="barcode-overlay">
        <div class="info">
            <div class="title" v-html="props.product.product.product_information.title"></div>
            <div class="ean" v-html="`EAN: ${props.product.product.product_information.ean}`"></div>
            <div class="amount" v-html="`Aantal: ${props.product.picked}x`"></div>
        </div>
        <div class="change">
            <label for="return-amount" v-html="`Aantal retour`"></label>
            <input name="return-amount" 
                type="number" 
                :max="props.product.picked - props.product.returned" 
                :min="0" 
                v-model.number="state.returnAmount"
                 @blur="validateAmount()"/>
            <label for="reason-return" v-html="`Reden retour`"></label>
            <select name="reason-return" v-model="state.reasonReturn">
                <option v-for="option in options" :value="option.value" :key="option.value">
                    {{ option.text }}
                </option>
            </select>
            <div class="" v-html="`Aantal geretourneerd: ${props.product.returned}x`"></div>
            <div class="" v-html="`Reden retour: ${props.product.returned > 0 ? props.product.reason_return : ''}`"></div>
        </div>
        
        <div class="buttons">
            <button @click="emit('closeBarcodeOverlay')" v-html="`Sluiten`"></button>
            <button @click="saveProduct()" v-html="`Opslaan`"></button>
        </div>
        <VueBarcode
            class="barcode"
            :value="product.product.product_information.ean" 
            :options="{}"
            tag="img">
            Show this if the rendering fails.
        </VueBarcode>
    </div>
</template>
<style lang="scss" scoped>
.barcode-overlay{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: space-between;
    align-content: center;
    align-items: center;
}
.title{
    font-size: 1.5rem;
    margin-top: 5px;
    margin-bottom: 5px;
    border-bottom-color: #a1a1a1;
    border-bottom-width: 2px;
    border-bottom-style: solid;
}
.ean{
    color: #ff0000;
    font-size: 1.4rem;
}
.buttons{
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    align-content: center;
    flex-direction: row;
    width: 50%;
    flex-wrap: wrap;
}
.barcode{
    width: 100%;
}
@media (min-width: 481px){
    .title{
        font-size: 2.5rem;
    }
    .ean,
    .amount,
    .change,
    button,
    select{
        font-size: 2rem;
    }
}
@media (min-width: 768px){
    .barcode-overlay{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-content: stretch;
        align-items: flex-start;
    }
}

/* 
  ##Device = Tablets, Ipads (landscape)
  ##Screen = B/w 768px to 1024px
*/




/* 
  ##Device = Laptops, Desktops
  ##Screen = B/w 1025px to 1280px
*/

@media (min-width: 1025px) {
  
}


@media (min-width: 1281px) {
  
  
}
@media (orientation: landscape){
	.barcode-overlay{
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-content: flex-start;
        align-items: center;
    }
    .info{
        width: 50%;
        font-size: 1.4rem;
    }
    .info > *{
        font-size: 1.4rem;
    }
    .change{
        width: 50%;
        font-size: 1.4rem;
    }
    .barcode {
        width: 50%;
    }
}
@media (min-width: 768px) and (orientation: landscape) {
    .info{
        width: 50%;
        font-size: 2rem;
    }
    .info > *{
        font-size: 2rem;
    }
    .change{
        width: 50%;
        font-size: 2rem;
    }
    .barcode {
        width: 50%;
    }
}
</style>