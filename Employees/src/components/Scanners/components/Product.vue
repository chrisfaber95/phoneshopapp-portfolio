<template>
    <div class="scanned-product">
        <div class="head">
            <p class="title" v-html="product.product_information?.title"></p>
            <p class="variant" v-html="product.product_information?.variant"></p>
            <p class="code" v-html="`Barcode: ${product.ean}`"></p>
        </div>
        <div class="image-block">            
            <img class="nix18" v-if="product.nix18" :src="require('@/assets/icons/nix-18.svg')" />			
            <img class="product-image" :src="`https://www.cooplubbers.nl${product.product_information.imgurl}`" />
        </div>
        
        <div class="basic-info small">
            <div class="price-block">
              <FancyPrice 
                :price="`${product.price}`"
                class="colored"
                :class="{'discounted':(isDiscounted && currentCart.calculateDiscountPrice(product) != product.price && 
                (isDiscounted.discount_info.discount_type.min_amount == 1 || isDiscounted.isPercentage == 0))}"
                @click="currentCart.addItemToCart(product, 1)"
              />
              <FancyPrice 
                class="discount-price" 
                v-if="(currentCart.isDiscounted(product) && currentCart.calculateDiscountPrice(product) != product.price && 
              (isDiscounted.discount_info.discount_type.min_amount == 1 || isDiscounted.isPercentage == 0))" 
              :price="`${currentCart.calculateDiscountPrice(product)}`"
              @click="currentCart.addItemToCart(product, 1, actieproduct, null)"  
            />  
            </div>
            
            <div class="discount">
                <Actietag  
                v-if="isDiscounted"
                :label="isDiscounted.discount_info.discount_type.discounttype_label" />
            </div>
            <!--<span class="itembrand" v-html="product.product_information.variant"></span>-->            
            <div class="modal-overlay" v-if="state.productModalOpened">
                <ProductModal v-bind:product="product" 
                @closeModal="(callback) => {state.productModalOpened = false;}"/>
            </div>		
                
            <div class="nav-buttons">
                <button class=" return left-shadow" @click="state.productModalOpened = !state.productModalOpened; stopTimer()">Meer Informatie</button>
            </div>
        </div>
        <div class="add-item" :id="'prod-'+product.id">
            <button class="drop left left-shadow" 
                :disabled="currentCart.isItemInCart(product) == 0" 
                @click="currentCart.updateItemAmount(
                    product, parseInt(currentCart.isItemInCart(product)) - 1); stopTimer();">-</button>
                <b 
                    class="cartamount" 
                    name="input" 
                    v-html="currentCart.isItemInCart(product)" />
            <button class="drop right" @click="currentCart.updateItemAmount(product, parseInt(currentCart.isItemInCart(product)) + 1);stopTimer();">+</button>
        </div>    
      </div>    
</template>
<script setup>
import { reactive, onMounted, defineEmits, computed, defineProps } from 'vue'
import $ from 'jquery'



import {DateTime} from 'luxon'

import cart from '@/assets/cart'
import groceryList from '@/assets/groceryList'


import Actietag from '@/components/Basics/Product/Actietag.vue'
import FancyPrice from '@/components/Basics/Product/FancyPrice.vue'
import ProductModal from '@/components/shopPage/ProductModal.vue'

    const props = defineProps({
        'product': Object
    })

    const state = reactive({
        productModalOpened: false,
        timer: null
    })
    onMounted(() => {
        currentCart.value.updateItemAmount(props.product, parseInt(currentCart.value.isItemInCart(props.product)) + 1);
        state.timer = setTimeout(closeProduct, 10000)
    })
    const isDiscounted = computed(() => {
        var data = null
        if(Array.isArray(props.product.product_has_discount_list)){
            if(props.product.product_has_discount_list.length > 0)
            props.product.product_has_discount_list.forEach((element) => {
                if(DateTime.fromISO(element.discount_info.starting_date) <= DateTime.now() && DateTime.fromISO(element.discount_info.end_date) >= DateTime.now()){
                    data = element
                }
            });
        }
        return data
    })

    function closeProduct(){
        emits('close')
    }
    function stopTimer(){
        clearTimeout(state.timer)
        console.log(state.timer)
    }

    const emits = defineEmits(['close'])

    const currentCart = computed(() =>{
        var location = $('.view')[0].classList
        console.log(location)
        if(location.contains('home')){
            return cart
        }
        else{
            return groceryList
        }
    })
</script>
<style scoped>
.scanned-product{
    display: grid;
    grid-template-rows: max-content 30% 30% 10%;
    grid-template-columns: 100%;
}

.head{
    text-align: left;
    padding-left: 5px;
    width: calc(100% - 5px)
}
.head p{
    margin-top: 4px;
    margin-bottom: 2px;
}
.head .title{
    font-size: 1.5rem;
    font-weight: 600;
}
.head .variant{
    font-size: 1.2rem;
}
.head .code{
    font-weight: 600;
}
.product-image{    
    width: auto;
    max-height: 100%;
    margin-left: auto;
    margin-right: auto;
}
.image-block{
    position: relative;
}
.nix18{
    position: absolute;
    top: 10px;
    left: 10px;
    width: 15%;
    height: auto;
}

.basic-info{
    display: flex;
    flex-direction: column;
    align-items: center;
}

.price-block{
    width: 100%;
    display: flex;
    justify-content: center;
}
.discount{
    font-size: 1.3rem;
}
.nav-buttons{
    display: flex;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    flex-wrap: wrap;
}
.nav-buttons button{    
    color: #ffffff;
    font-size: 1rem;
}
.nav-buttons button.return{
    color: #000000;
}
.add-item{
    display: flex;
    align-items: center;
    justify-content: center;
}
.drop {
    background-color: var(--base-color);
    color: #ffffff;
    font-size: 2rem;
    width: 3.4rem;
    height: 3.4rem;
    line-height: 2rem;
}
.drop.left{
    border-radius: 100% 100% 0% 100%;
    background-color: #ff0000;
    border-color: #ff0000;
}
.drop.right{
    border-radius: 100% 100% 100% 0%;
    background-color: #13a000;
    border-color: #13a000;
}
.cartamount{
    font-size: 2.4rem;
    margin-left: 15px;
    margin-right: 15px;
}

.modal-overlay .product-modal{
    height: 85%;
}
</style>