<script setup>
    import { onMounted, defineProps, reactive, computed, ref } from 'vue';
	//import {HTTP} from '@/assets/services/http-common.js';
    import VueBarcode from '@chenfengyuan/vue-barcode';
    import productin from '@/assets/icons/product-in.svg'
    import ReceiptExtraBags from '@/components/CollectingScreen/ReceiptExtraBags.vue';
	import ReceiptProduct from '@/components/CollectingScreen/ReceiptProduct.vue';
    import shoppingcart from '@/assets/icons/shopping-cart.svg'
    import basket from '@/assets/icons/shopping-basket-solid.svg'
    import rolcontainer from '@/assets/icons/rolcontainer.svg'
    import rolmandje from '@/assets/icons/rolmandje.svg'
    import shoppingbag from '@/assets/icons/shopping-bag-solid.svg'
	
    const props = defineProps({
        'order': Object
	})

    const state = reactive({
        chooseBags: false,
        productInformation: []
    })

	const bagtypes = ref(process.env.VUE_APP_BAGEAN.split(','))
     
    //const editOrderTitle = ref('')
   // const pickedMethodWarning = ref('Let op! Vergeet niet de gebruikte tassen toe te voegen op de bon')
    
    function moreProductAlert(){
        if(this.itemAmount.amount > this.itemAmount.max){
            alert("Het aantal producten kan hoger zijn dan de orginele bon wanneer er meerdere tassen zijn toegevoegd")
        }
    }

    function itemAmount(){
        return {
            amount: props.order.product_list.reduce((partialSum, a) => partialSum + a.picked, 0),
            max: props.order.product_list.reduce((partialSum, a) => partialSum + a.amount, 0),
        }
    }

    function getPickingType(){
        let crate = props.order.pickingcrate
        let obj;
        switch (crate) {
            case 'Winkelmandje':
                obj = {src:basket}
                break;     
            case 'Rolmandje':
                obj = {src:rolmandje}
                break;  
            case 'Rolcontainer':
                obj = {src:rolcontainer}
                break;  
            case 'Boodschappenkar':
                obj = {src:shoppingcart}
                break;     
            default:
                obj = {src:''}
                break;
        }
        return obj
    }
   
   function productStyleClass(product){
       if(product.amount == null || product.picked == null) return ''
       if(product.picked == 0) return 'noItem'
       if(product.picked > 0 && product.picked < product.amount) return 'someItems'
       if(product.picked >= product.amount) return 'pickedItems'
       return ''
   }

    onMounted(() => {
        console.log(props.order)
    })

    const sortedProducts = computed(() => {
        let list = props.order.product_list
        props.order.product_list.forEach(element => {
            if(bagtypes.value.some(el => el === element.product.ean)) {    
                list.splice(list.indexOf(element), 1)
                list.unshift(element)
            }
            else if(element.picked >= element.amount){
                list.splice(list.indexOf(element), 1)
                list.push(element)
            }
        });
        return list
    })
    
    </script>
<template>
    <div class="bon">
        <div class="header">
            <div class="productamount" @click="moreProductAlert()">
                <img :src=productin />
                <div v-bind:class="[{'moreproducts': itemAmount().amount > itemAmount().max}]" 
                    v-html="`${itemAmount().amount}/${itemAmount().max}`"></div>
            </div>
            <div class="order-number" v-html="`Bestelling: ${props.order.id}`"></div>
            <div class="picktype">
                <img :src="getPickingType().src" />
            </div>
        </div>
        <div class="offline-info" 
            v-if="order.winkelbon != null && order.winkelbon != 'null' && order.winkelbon != '' ">
            <h3>Winkelbon:</h3>
            <VueBarcode
                class="barcode"
                :value="order.winkelbon" 
                :options="{}"
                tag="img">
                Show this if the rendering fails.
            </VueBarcode>
        </div>
        <!--<h3>Coop Lubbers</h3>-->
        <div class="information">
            <div id="customer-name" v-html="`${order?.order_information.customerName || ''}`"></div>
            <div id="customer-card"  v-html="`Klantenkaart: ${order?.order_information.klantenkaart || ''}`"></div>
            <div id="stamps"  v-html="`Koopzegels: ${order?.koopzegels || 'n.v.t'}`"></div>
            <div id="stamps"  v-html="`Spaarzegels: ${order?.spaarzegels == 1 ? 'Ja' : 'Nee'}`"></div>
        </div>
        <div class="bags">
            <button v-if="(order.status == 'ordered')" @click="state.chooseBags = !state.chooseBags">
                <img :src=shoppingbag />
            </button>
        </div>
        <div class="modal-overlay" v-if="state.chooseBags">
            <ReceiptExtraBags 
                :order="order"
                @closeExtraBagsModal="()=>{state.chooseBags = false}"          
                />
        </div>
        <div class="product"
            v-for="product in sortedProducts"
            v-bind:key="product.product_id"
            :class="productStyleClass(product)">
            <ReceiptProduct 
                :products="product"
                :order="order"
                />
        </div>
    </div>
</template>
<style lang="scss" scoped>
    $product-background-color: #e3e3e3;

    .header{
        display: flex;
        align-items: flex-start;
        align-content: flex-start;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
        max-height: 100px;
    }
    .header .productamount,
    .header .picktype{
        width: 25%;
        font-size: 1.5rem;
    }
    .header .order-number{
        width: 50%;
        font-size: 1.9rem;
    }
    .information{
        font-size: 1.3rem;
        font-weight: 400;
    }
    .information > div{        
        padding-bottom: 10px;
    }
    .information #customer-name{
        font-size: 1.6rem;
        font-weight: 600;
    }
    .offline-info h3{
        margin-bottom: 0;
    }
    .barcode{
        width: 60%;
    }
    .bags{
        display: flex;
        width: 100%;
        flex-direction: row;
        justify-content: flex-end;
        margin-bottom: 10px;
    }
    .bags button{
        width: 20%;
        padding: 0;
        margin: 0;
    }
    .product{
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-content: stretch;
        justify-content: flex-start;
        align-items: stretch;
        padding: 20px 15px;
        border-bottom: 4px dotted #8f8f8f;
        background-color: $product-background-color;
    }

    .noItem{
    background: -moz-linear-gradient(left, #ff0000 0%, #ff0000 4%, $product-background-color 5%,$product-background-color 85%, $product-background-color 100%);
    background: -webkit-linear-gradient(left, #ff0000 0%,#ff0000 4%, $product-background-color 5%, $product-background-color 85%, $product-background-color 100%);
    background: linear-gradient(to right, #ff0000 0%,#ff0000 4%,$product-background-color 5%,$product-background-color 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ff0000', endColorstr=$product-background-color,GradientType=0 );
}
.someItems{
    background: -moz-linear-gradient(left, #ff9000 0%, #ff9000 4%, $product-background-color 5%, $product-background-color 85%, $product-background-color 100%);
    background: -webkit-linear-gradient(left, #ff9000 0%,#ff9000 4%,$product-background-color 5%,$product-background-color 100%);
    background: linear-gradient(to right, #ff9000 0%,#ff9000 4%, $product-background-color 5%, $product-background-color 85%,$product-background-color 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr=$product-background-color, endColorstr=$product-background-color,GradientType=0 );
}
.pickedItems{
    background: -moz-linear-gradient(left, #0baf00 0%, #0baf00 4%, $product-background-color 5%, $product-background-color 85%, $product-background-color 100%);
    background: -webkit-linear-gradient(left, #0baf00 0%,#0baf00 4%, $product-background-color 5%, $product-background-color 85%,$product-background-color 100%);
    background: linear-gradient(to right, #0baf00 0%,#0baf00 4%, $product-background-color 5%, $product-background-color 85%,$product-background-color 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#0baf00', endColorstr=$product-background-color,GradientType=0 );
}
</style>