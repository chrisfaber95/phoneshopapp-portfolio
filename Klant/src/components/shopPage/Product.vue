<template>
	<div class="product">
        <div class="information">
            <div class="itembrand" v-html="product.product_information?.variant || ''"></div>
            <div class="product-image"  @click="state.productModalOpened = !state.productModalOpened">
                <v-lazy-image 
                    class="img-fluid" 
                    @error="removeProduct()" 
                    v-bind:src="`${$imageHost}${product.product_information?.imgurl}` || ''" 
                    :intersection-option="state.lazyOptions " />
            </div>
            <div class="background" @click="state.productModalOpened = !state.productModalOpened">
                <img 
                    :src="require('@/assets/icons/background.png')" 
                    :intersection-options="state.lazyOptions"
                    />
            </div>          
            <div class="cartoverlay">
                <div class="favorite" :class="{'inactive' : !loggedIn}">
                    <input type="checkbox" class="star" v-model="state.isFavorite" @click="state.isFavorite ? removeFavorite() : addToFavorite()"/>
                </div>
                <img class="nix18" v-if="product.nix18" :src="require('@/assets/icons/nix-18.svg')" />
                <div id="amount" class="amountcircle" v-if="cart.isItemInCart(product) > 0" @click="cart.updateItemAmount(product, 0)" v-html="cart.isItemInCart(product)"></div>
            </div>
            <div class="modal-overlay" v-if="state.productModalOpened">
                <ProductModal :product="product" :discount="ïsDiscounted"
                @closeModal="(callback) => {state.productModalOpened = false;}"/>
            </div>
        </div>
        <div class="price">
            <!--:price1="isDiscounted ? cart.calculateDiscountPrice(product) : product.price"-->
            <Pricetag 
                @click="cart.addItemToCart(product, 1); "
                :price="product.price"
                :discount="isDiscounted"
                :isFavorite="state.isFavorite"
                :fontSize="1.4 - (+amountOfShelf-2)/10"
                />
        </div>
	</div>
</template>

<script setup>
import { reactive, defineProps, onMounted, computed, defineEmits, watch } from 'vue';
	
import {HTTP} from '@/assets/scripts/http-common.js';
import cart from '@/assets/cart'
import ProductModal from '@/components/shopPage/ProductModal.vue'
import Pricetag from '@/components/Basics/Product/Pricetag.vue';
import VLazyImage from "v-lazy-image";

import {DateTime} from 'luxon'

import { useStore } from 'vuex'
const store = useStore()

const props = defineProps({
    'product': Object
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

	const loggedIn = computed(() => {
		return store.getters['shopsettings/getLoggedIn']
	})

const amountOfShelf = computed(() => { return store.getters['shopsettings/getAmountOfShelf'] || 4})



    watch(() => store.getters['shopsettings/getFavorites'], (newVal) => {
        let cart = store.getters['shopsettings/getFavorites']
        if(cart[props.product.id]) {
            state.isFavorite = true
        }
        else{
            state.isFavorite = false
        }
	},{
		immediate: true,
		deep: true
	})

    onMounted(() => {
		if(props.product?.favorite_products_list?.length > 0) state.favorite = true
	})

    function addToFavorite(){
        var params = {
            user_id: localStorage.getItem('user_id'),
            product_id: props.product.id
        }
        HTTP.post(`customer_favorites`, params)
		.then((response) => {
			if(!response){
				alert("Something went wrong, try again or try later.")
			}
            else{
                console.log(response)
            }
		})
		.catch(() => {
		})
    }

    function removeFavorite(){
        var params = {
            fav_id: props.product?.favorite_products_list[0].customer_has_favorite_id
        }
        HTTP.delete(`customer_favorites`, {data: params})
		.then((response) => {
			if(!response){
				alert("Something went wrong, try again.")
			}
            else{
                store.commit('shopsettings/removeFavorite', props.product?.id)
            }
		})
		.catch((e) => {
            console.log(e)
		})
    }

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

    

    function removeProduct(){
        emit('removeProduct', props.product)
    }

    const emit = defineEmits(['removeProduct'])

</script>

<style scoped>
.active.product .information .itembrand{
	background: #ff000082 !important;
}
.product{
    position: relative;
    height: 100%;
	display: flex;
	flex-direction: column;
	align-content: center;
    align-items: stretch;
    justify-content: space-between;
    flex-wrap: nowrap;
}

.product-image{
    width: 100%;
    height: 99%;
    overflow-y: hidden;
}
.product-image img{
    height: 100%;
    width: auto;
    max-width: 100%;
}
.background{
    position: absolute;
    bottom: 0;
    z-index: 3;
}
.background img{
    width: 100%;
    height: auto;
    z-index: 2;
    transform: scaleY(1.4) translateY(0px);
}
.information{
    display: block;
    position: absolute;
    width: 100%;
    height: 80%;
}
.information > img{
    max-width: 100%;
    height: 100%;
    position: relative;
    display: block;
    margin-left: 3%;
    margin-right: auto;
}
.product-line{   
	position: absolute;
    height: 50%;
    bottom: 25%;
    border-right: 4px solid grey;
    margin-left: -5px;
    -webkit-box-shadow: 5px 0px #888888;
    box-shadow: 1px 0px #888888;
    box-shadow: 2px -5px #c1c1c1;
    display: none;
}
.itembrand{
    width: 100%;
    display: block;
    font-size: .8rem;
    font-weight: 600;
    font-style: italic;
    position: absolute;
    bottom: 13%;
    background-color: #dfdfdf82;
    z-index: 2;
    right: 0;
    /*height: 17%;*/
    line-height: 1.2rem;
    color: #ffffff;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;

    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: stretch;
}
.itembrand.lessrows{
	font-size: 0.9rem;
	height:20%;
	font-weight: 600;
}
.price{
    display: block;
    position:absolute;
    left: 10%;
    bottom: 0;
    width: 80%;
    height: 25%;
    color: #ffffff;
    font-size: 0.9rem;
    font-weight: 600;
    z-index: 4;   
}
.price .pricetag{
    width: 100%;
}

.shelfunit{
	height:100%;
}
.itemprice{
    color: #000;
    border-left: none;
    border-right: none;
    border-radius: unset;
    font-size: 0.9rem;
    width: 66%;
    position: absolute;
    top: 0;
    left: 60%;
    transform: translate(-56%, 30%);
    height: 80%;
    display: inline;
    line-height: 100%;
}
.itemprice.lessrows{
	font-size: 1rem;
	font-weight: 600;
}
@media screen and (min-width: 768px) {
	.itembrand{
		font-size: 1rem;
	}
	.itemprice{
		font-size: 1.1rem;
	}
}
.discount .itemprice{
	color: red;
}
.cartoverlay{
	position: absolute;
    color: red;
    top: 0;
    left: auto;
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    width: 90%;
}
.cartoverlay .icon{
	width: 2.215em;
	height: 1.4em;
}
.cartoverlay .amountcircle{
    border-radius: 50%;
    min-width: 20px;
	aspect-ratio: 1;
    background: #f00;
    border: 2px solid #f00;
    color: #ffffff;
    text-align: center;
    font-size: 0.9rem;	
    line-height: normal;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cartoverlay .nix18{    
	width: 2em;
    height: auto;
}
.cartoverlay .amountcircle p{
	margin: unset;
}

.modaloverlay{
	position: fixed;
	width: 100vw;
	height: 100vh;
	top: 0;
	left: 0;
	background-color: #99999999;	
	z-index: 100
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s
}

.fade-enter,
.fade-leave-to
{
  opacity: 0
}

.favorite.inactive .star:before {
    visibility:hidden;
}


@media only screen and (min-height: 500.98px) and (orientation: landscape) {	
    .itembrand{
        font-size: 0.8rem;
    }
    .price-amount{
        font-size: 0.9rem;
        white-space: nowrap;
    }
}
@media only screen and (min-width: 500.98px) and (orientation: portrait) {	
    .itembrand{
        font-size: 1.1rem;
        line-height: 1.5rem;
    }
    .price-amount{
        font-size: 1.3rem;
        white-space: nowrap;
    }
}
</style>