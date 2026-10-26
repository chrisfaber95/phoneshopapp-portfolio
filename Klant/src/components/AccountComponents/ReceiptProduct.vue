<template>
    <div class="product">
        <div class="no-picking" v-if="picking === false">
            <div class="grid-item first"
                @click="state.productModalOpened = item.product;">
                <img :src="`${$imageHost}${item.product.product_information.imgurl}` || ''">
            </div>
            <div class="modal-overlay" v-if="state.productModalOpened">
                <ProductModal :product="state.productModalOpened" :discount="ïsDiscounted"
                @closeModal="(callback) => {state.productModalOpened = null;}"/>
            </div>
            <div class="grid-item second product-information" @click="state.productModalOpened = item.product;">
                <p>
                    <b v-html="`${item.product.product_information.title} `"></b>
                    <i class="variant" v-html="item.product.product_information.variant || ''"></i>
                </p>
                <i v-html="`${isPicked() ? item.amount : item.picked}x`"></i>
                <i v-if="item.product.statiegeld && item.product.statiegeld != '0.00'" v-html="`Statiegeld`"></i>
            </div>
            <div class="grid-item third amounts">
                <div class="total-price">
                    <p class="price" v-if="item.normal_total_price != null" v-html="`&euro; ${(+item.normal_total_price / (1 + (+item.product.btw/100))).toFixed(2)}`"></p>
                    <p class="price" v-if="item.normal_total_price == null" v-html="`&euro; ${(+item.price * +((isPicked() ? item.amount : item.picked)) / (1 + (+item.product.btw/100))).toFixed(2)}`"></p>
                    <p class="discount-price" v-if="item.discounted_price != null && item.discounted_price < item.normal_total_price" v-html="`- &euro; ${(+item.discounted_price / (1 + (+item.product.btw/100))).toFixed(2)}`"></p>
                    <p class="discount-price" v-if="item.discounted_price != null && item.discounted_price == item.normal_total_price" v-html="``"></p>
                    <p class="discount-price" v-if="!item.discounted_price == null" v-html="``"></p>
                </div>	            
            </div>
            <div class="grid-item fourth amounts">
                <div class="total-price">
                    <p class="price" v-if="item.normal_total_price != null" v-html="`&euro; ${item.normal_total_price}`"></p>
                    <p class="price" v-if="item.normal_total_price == null" v-html="`&euro; ${((+item.price * +(isPicked() ? item.amount : item.picked)).toFixed(2))}`"></p>
                    <p class="discount-price" v-if="item.discounted_price != null && item.discounted_price < item.normal_total_price" v-html="`- &euro; ${item.discounted_price}`"></p>
                    <p class="discount-price" v-if="item.discounted_price != null && item.discounted_price == item.normal_total_price" v-html="``"></p>
                    <p class="discount-price" v-if="!item.discounted_price == null" v-html="``"></p>
                </div>	            
                <i v-if="item.product.statiegeld && item.product.statiegeld != '0.00'" v-html="`&euro; ${(+item.product.statiegeld * (isPicked() ? item.amount : item.picked)).toFixed(2)}`"></i>
            </div>
        </div>
        
        <div class="no-picking" v-if="picking === true && order.delivery == 1">
            <div class="grid-item second product-information">
                <p>
                    <b v-html="`Bezorging`"></b>
                </p>
                <i v-html="`1x`"></i>
            </div>
            <div class="grid-item third amounts">
                <div class="total-price">
                    <p class="price" 
                        v-html="`&euro; ${(+(order.picking_price - 2) / (1 + (+21/100))).toFixed(2)}`"></p>
                </div>	            
            </div>
            <div class="grid-item fourth amounts">
                <div class="total-price">
                    <p class="price" v-html="`&euro; ${(order.picking_price - 2).toFixed(2)}`"></p>
                </div>	            
            </div>
        </div>
        <div class="no-picking" v-if="picking === true">
            <div class="grid-item second product-information">
                <p>
                    <b v-html="`Personal shopper`"></b>
                </p>
                <i v-html="`1x`"></i>
            </div>
            <div class="grid-item third amounts">
                <div class="total-price">
                    <p class="price" 
                        v-html="`&euro; ${(+2 / (1 + (+21/100))).toFixed(2)}`"></p>
                </div>	            
            </div>
            <div class="grid-item fourth amounts">
                <div class="total-price">
                    <p class="price" v-html="`&euro; 2.00`"></p>
                </div>	            
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, defineProps, onMounted, defineEmits } from 'vue';
	
import ProductModal from '@/components/shopPage/ProductModal.vue'



const props = defineProps({
    'item': Object,
    'status': String,
    'picking': Boolean,
    'order': Object
})

const state = reactive({
    productModalOpened: false,
    isFavorite: false,
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

const isPicked = () => {
    const status = props.status
    if(status == 'ordered'){
        return false
    }
    return true
}

	

    

    onMounted(() => {
    })


    defineEmits(['removeProduct']);

</script>

<style scoped>


.product .productheader{
}
.product > div{
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 25%);
    text-align: start;
    border-bottom: 1px solid #cdcdcd;
}
.product .first{
    grid-column: 1/3;
}
.product .amount{
    font-size: 0.8rem;
    font-style: italic;
}
.product .prijs.excl{
    grid-column: 3;
    text-align: end;
}
.product .prijs.incl{
    grid-column: 4;
    text-align: end;
}
.shopping-cart{
    border-bottom: 3px solid #ececec;
}
    .grid-container{
        display: grid;        
        grid-template-columns: repeat(8, 1fr);
        gap: 5px;
        /*grid-auto-rows: minmax(100px, auto);*/
        border-bottom: 1px solid #ececec;
        padding: 10px;
    }
    .first{
        grid-column: 1/3;
        display: none;
    }
    .second{        
        grid-column: 1/3;
        padding-left: 3px;
        text-align: left;
    }    
    .third{        
        grid-column: 3;
    }
    .fourth{
        grid-column: 4;
    }
    .third-long{
        grid-column: 4;
        padding-left: 3px;
        text-align: left;
    }
    .product-information{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        flex-wrap: wrap;
        justify-content: flex-start;
    }
    .product-information p{        
        text-align: left;
        margin: 4px 0px;
        font-weight: 600;
    }

    .product-information i{        
        font-size: 0.9rem;
    }
    
    .product-information p i {
        font-weight: 400;
        font-size: 0.9rem; 
    }

    .aantalInput{
        border-style: outset;
        text-align: center;
        width: 100%;
        font-weight: 600;
        background-color: var(--base-color) !important;
        margin: 10px 2px 10px 0;
        padding: 0;
        grid-column: 1;
        grid-row: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: clip;
        aspect-ratio: 1;        
    }
    .deleteProduct{
        margin-top: 0;
        grid-column: 2;
        grid-row: 1;
        background-color: var(--base-color-delete);        
        border: 2px solid #ededed;
        padding: 5px;
        margin: 10px 5px;

        margin-top: 0;
        background-color: var(--base-color-delete);
        border: unset;
        padding: 0px;	
        height: 2rem;
        margin-top: 10px;
        box-shadow: unset;
    }
    .deleteProduct img{
        width: 100%;
        height: 100%;
    }
    .deleteProduct:hover, .deleteProduct:focus, .deleteProduct:active{
        color: #000000;
    }
    .amounts{
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        align-content: flex-start;
        justify-content: space-between;
    
    }

    .total-price{
        grid-column: 1/3;
        grid-row: 2;
        width: 100%;
        margin-top: 5px;
        text-align: right;
        font-size: 1rem;
        font-weight: 600;
    }
    .total-price > p {
        margin: unset;   
    }
    .price-block{
        width: 100%;
        display: flex;
        margin-bottom: 5px;
    }
    .price-block .discount-price{
        padding-left: 5px;
    }

    .total-price .discounted{
        font-size: 1.2rem;
        text-decoration: line-through;
        font-weight: 600;
        color: #717171 !important;
    }

    .total-price .discount-price{
        color: #f00;
    }

    .grid-container.fat{
        font-size: 1.3rem;
        font-weight: 600;
    }
    @media only screen and (min-height: 500.98px) and (orientation: landscape) {
        .product-information{        
            grid-column: 2/3;
        }
        
    .product .first{
        grid-column: 1;
        display: block;
    }
    }
        
    @media only screen and (min-width: 500.98px) and (orientation: portrait) {
        .product-information{        
            grid-column: 2/3;
        }
        .product .first{
            grid-column: 1;
            display: block;
        }
    }
</style>