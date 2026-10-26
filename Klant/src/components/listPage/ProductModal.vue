<script setup>
	import { reactive, defineProps, onMounted, computed, defineEmits, watch } from 'vue';
import {HTTP} from '@/assets/scripts/http-common.js';
	import cart from '@/assets/groceryList'
	import { DateTime } from 'luxon';
	import Actietag from '@/components/Basics/Product/Actietag.vue'
import FancyPrice from '@/components/Basics/Product/FancyPrice.vue'
    import VueBarcode from '@chenfengyuan/vue-barcode';
	import Description from '@/components/Basics/Product/Description.vue';
	import Ingredients from '@/components/Basics/Product/Ingredients.vue'
	import Nutrients from '@/components/Basics/Product/Nutrients.vue'
	import Additional from '@/components/Basics/Product/StandardInfo.vue'
	import { useStore } from 'vuex'
	const store = useStore()

	const props = defineProps({
		'product': Object,
		'discount': Object,
		'ísFavorite': Boolean
	})

	const state = reactive({
		isFavorite: false,
		information: null,
	})

	onMounted(() => {
		getProductInformation()
	})

	watch(() => props.ísFavorite, (newVal) => {
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

	const emit = defineEmits(['closeModal'])
	
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

	
	const loggedIn = computed(() => {
		return store.getters['shopsettings/getLoggedIn']
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
				store.commit('shopsettings/addFavorite', response.data[0])
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

	function getProductInformation(){
		HTTP.get(`product/${props.product.ean}`)
		.then((response) => {
			state.information = response.data
		})
		.catch(() => {
		})
	}
	
	
	function formatDate(date){
		if(date){
			const parts = date.split('-');
			const formattedDate = parts.reverse().join('\u200B-');
			return formattedDate 
		}
		else {
			return ''
		}
	}
</script>
<template>
	<div class="product-modal">
		<div class="modalheader">
			<div class="title">
				<p v-html="product.product_information?.title"></p>
			</div>
			
		</div>
		<div class="modalcontent">	
			<div class="variant">				
				<p v-html="product.product_information?.variant"></p>
                <img class="nix18" v-if="product.nix18" :src="require('@/assets/icons/nix-18.svg')" />					
				<div class="amountoverlay" v-if="cart.isItemInCart(product)">
					<p v-if="cart.isItemInCart(product)" @click="cart.updateItemAmount(product, 0)">Aantal: {{cart.isItemInCart(product)}}</p>
				</div>
			</div>
			<div class="modal-img">
				<img class="img-fluid" v-bind:src="`${$imageHost}${product.product_information?.imgurl}` || ''"/>			
				<div class="favorite" :class="{'inactive' : !loggedIn}">
					<input type="checkbox" class="star"  v-model="state.isFavorite" @click="state.isFavorite ? removeFavorite() : addToFavorite()"/>
				</div>
			</div>
			<div class="basic-info small">
				<p class="code" v-html="`Barcode: ${product.ean}`"></p>
				
					<div class="price-block">
						<FancyPrice 
							:price="`${product.price}`"
							class="colored"
							:class="{'discounted':(isDiscounted && cart.calculateDiscountPrice(product) != product.price && 
							(isDiscounted.discount_info.discount_type.min_amount == 1 || isDiscounted.isPercentage == 0))}"
							@click="cart.addItemToCart(product, 1)"
						/>
						<FancyPrice 
							class="discount-price" 
							v-if="(isDiscounted && cart.calculateDiscountPrice(product) != product.price && 
						(isDiscounted.discount_info.discount_type.min_amount == 1 || isDiscounted.isPercentage == 0))" 
						:price="`${cart.calculateDiscountPrice(product)}`"
						@click="cart.addItemToCart(product, 1, actieproduct, state.currentVariant)"  
					/>  
					</div>
				
				<div class="discount">
					<Actietag  
					v-if="isDiscounted"
					:label="isDiscounted.discount_info.discount_type.discounttype_label" />
					<i class="geldig" v-if="isDiscounted" v-html="`Geldig van ${formatDate(isDiscounted?.discount_info.starting_date)}<br>tot ${formatDate(isDiscounted?.discount_info.end_date)}`"></i>
				</div>
			</div>
			<div class="barcode big">
				<VueBarcode
					class="barcode"
					:value="product.ean" 
					:options="{}"
					tag="img">
					Barcode: {{product.ean}}
				</VueBarcode>
			</div>
			<div class="information">
				<Description :product="product" />
				<Ingredients 
					:product="product" 
					v-if="product.product_information?.ingredients && product.product_information?.ingredients != ''"
				/>
				<Additional
					v-if="product.product_information?.product_additional_information_list && product.product_information?.product_additional_information_list.length > 0"
					:product="product.product_information?.product_additional_information_list"
				/>
				<Nutrients
					v-if="state.information?.nutrients"
					:nutrients="state.information?.nutrients[0]"
				/>
			</div>
		</div>
		<div class="modalfooter">	
			<div class="buttons">
				<!--<button size="sm" @click="state.favorite ? removeFavorite() : addToFavorite()">
					Favoriet
				</button>-->
				<button class="return left-shadow" size="sm" @click="emit('closeModal')">
					Sluiten
				</button>
				<button size="sm" @click="cart.addItemToCart(product, 1)">					    							    
					<div class="cartoverlay">
						<div id="amount" 
							class="amountcircle" 
							v-if="cart.isItemInCart(product) > 0" 
							v-html="cart.isItemInCart(product)"></div>
					</div>
					Toevoegen
				</button>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.modal-overlay .product-modal{
	position: fixed;
    display: block;
    width: 94%;
    height: 94%;
    border: 1px solid black;
    background-color: #ffffff;
    -webkit-box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
    box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
    z-index: 101;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
    top: 10px;
    left: 3%;
}

.modalheader{
    display: flex;
    border-bottom: 1px solid #dddddd;
    flex-direction: row;
    justify-content: flex-start;
    padding-left: 10px;
    padding-right: 5px;
    flex-wrap: nowrap;
    align-items: center;
	height: 10%;
}

.modalheader .title{
	white-space: initial;
    text-align: left;
    font-weight: 600;
    font-size: 1.2em;
    width: -webkit-fill-available;
}

.modal-img{
	max-height: 50vh;
	width: auto;
	max-width: 80%;	
	position: relative;
}
.variant{
	display: inline-block;
    width: 100%;
    text-align: left;
    font-size: 1.3rem;
    font-weight: 600;
}
.variant .nix18{
	max-height: 1.3rem;
	width: auto;
}
.amountoverlay{
	width:100%;
	color: var(--base-color);
}
.amountoverlay p{
	background: var(--base-color);
    border: 2px solid var(--base-color);
    color: #ffffff;
    text-align: center;
    font-size: 1rem;
    line-height: normal;
    margin-bottom: unset;
}

.modalcontent{
	padding-left: 10px;
	height: 75%;
	overflow-y: scroll;
    white-space: break-spaces;
    overflow-wrap: anywhere;
    padding-right: 10px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    align-content: flex-start;
	width: 95%;
    overflow-x: hidden;
}

.modalcontent .basic-info{
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-wrap: nowrap;
    justify-content: space-between;
}

.basic-info .discount{
	display: flex;
	flex-direction: column;
	align-items: center;
}
.modalcontent p{
	font-size: 1.3rem;
	font-weight: 600;
	margin-top: 2px;
	margin-bottom: 5px;
}
.modalcontent .title{
	width:100%;
}
.price-block{
    width: 100%;
    display: flex;
    margin-bottom: 5px;
    overflow-wrap: initial;
    margin-bottom: 5px;
    overflow-wrap: initial;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}
.price-block .colored{
	color: var(--base-color);
}
.price-block .discount-price{
    padding-left: 5px;
}

.modalcontent .omschrijving{
	width:100%;
}
.modalcontent .information > div{
	border-bottom: 3px solid #ececec;
	padding-bottom: 5px;
}
.modalfooter{
    height: 14%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: column;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: stretch;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
	justify-content: flex-end;
    flex-wrap: nowrap;
    align-content: center;
	padding-top: 0;
	padding-bottom: 5px;
}
.modalfooter p{
	margin-top: 0;
}

.modalfooter .buttons{
	display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: flex-start;
    justify-content: space-evenly;
    align-items: flex-start;
	position: relative;
}

.modalfooter .buttons button{
	position: relative;
}

.modalfooter .buttons .cartoverlay{
	position: absolute;
    color: red;
    top: -15px;
    right: -15px;
    display: block;
}
.modalfooter .buttons .cartoverlay .amountcircle{
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

.modalfooter .buttons .cartoverlay .amountcircle p{
	margin: unset;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey;
  border-radius: 10px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: var(--base-color);
  border-radius: 10px;
}
@media only screen and (max-width: 425px){	
	.product-modal{
		width: 80vw;
		height: 70vh;
	}
	.modalcontent label,input{
		width: 90%;
		margin-left: auto;
		margin-right: auto;
	}
	.modalcontent textarea{
		width: 90%;
		height: 50%;
		margin-left: auto;
		margin-right: auto;
	}
} 


.modalcontent .favorite{
	position: absolute;
    right: 5px;
    top: 5px;
    height: 3rem;
    width: 3rem;
}

.modalcontent .favorite .star{
    font-size: 3rem;
}

.modalcontent .favorite .star::before{
	transform: translateX(0%) translateY(-40%);
}

.big{
	display: none;
}


@media only screen and (min-height: 500.98px) and (orientation: landscape) {
	.big{
		display: block;
	}
	.modalheader{
		height: unset;
		max-height: 10%;
	}

	.modalheader .title{
		margin: unset;
		font-size: 1.6rem;
	}

	.modalheader .star{
		margin-right: 20px;
		width: 100%;
		height: 100%;
		font-size: 4rem;
	}
	.modalcontent{
		padding-left: 10px;
		height: 80%;
		overflow-y: hidden;
		white-space: break-spaces;
		overflow-wrap: anywhere;
		padding-right: 10px;
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		grid-template-rows: repeat(10, 10%);
	}

	.modalcontent p{
		font-size: 1.5rem;
	}

	.modalcontent .variant{
		grid-column: 4/6;
		grid-row: 6/8;
		width: 100%;
		height: 100%;
		align-items: left;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}
	.modalcontent .variant > P{
		padding-left: 5px;
		font-size: 1.9rem;
		max-width: 100%;
	}

	.modalcontent .variant .amountoverlay{
		max-width: 100%;
		width: unset;
	}
	.modalcontent .variant .amountoverlay p{
		width: fit-content;
		padding-left: 5px;
		padding-right: 5px;
		font-size: 1.7rem;
	}
	.modalcontent .modal-img{
		grid-column: 1/4;
		grid-row: 1/7;
		max-width: 100%;
		height: 100%;
	}

	.modal-img img{
		max-width: 100%;
		width: auto;
		height: auto;
		max-height: 100%;
	}
	.modalcontent .basic-info{
		font-size: 2rem;
		grid-column: 4/6;
		grid-row: 8;
		align-items: baseline;
	}

	.basic-info .discount{
		font-size: 1.7rem;
		max-width: 90%;
		width: fit-content;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.basic-info .discount i{
		font-size: 1.2rem;
	}
	.modalcontent .basic-info p{
		font-size: 1.9rem;
	}

	.modalcontent .basic-info .code{
		display: none;
	}
	.modalcontent .information{
		grid-column: 6/9;
		grid-row: 1/11;
		height: 100%;
		overflow-y: scroll;
	}

	.modalcontent .barcode{
		grid-column: 1/4;
		grid-row: 7/11;
		max-width: 100%;
		height: 90%;
	}

	.modalcontent .barcode img{
		height: 100%;
		width: auto;
		max-width: 100%;
		max-height: 100%;
	}

	.modalfooter button{
		font-size: 1.4rem;
	}
	.modalcontent .favorite{
		display: none;
	}

	.modalfooter .buttons{
		width: 96%;
		margin-left: auto;
		margin-right: auto;
		justify-content: space-around;
	}
}


@media only screen and (min-width: 500.98px) and (orientation: portrait) {
	.big{
		display: block;
	}
	.modalheader{
		height: unset;
		max-height: 10%;
	}

	.modalheader .title{
		font-size: 1.6rem;
	}
	.modalcontent{
		padding-left: 10px;
		white-space: break-spaces;
		overflow-wrap: anywhere;
		padding-right: 10px;
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-template-rows: repeat(8, 1fr);
		overflow-y: scroll;
	}
	.modalcontent p{
		font-size: 1.5rem;
	}

	.modalcontent .variant{
		grid-column: 1;
		grid-row: 1;
		width: 100%;
	}
	.modalcontent .modal-img{
		grid-column: 3/7;
		grid-row: 1/5;
		height: 100%;
		max-width: 90%;
	}

	.modalcontent .modal-img img{
		max-height: 100%;
		height: auto;
		width:auto;
		max-width: 100%;
	}
	.modalcontent .basic-info{
		grid-column: 1/3;
		grid-row: 2;
		text-align: left;
	}

	.basic-info .discount{
		font-size: 2rem;
		max-width: 90%;
		width: fit-content;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.basic-info .discount i{
		font-size: 1.2rem;
	}
	.modalcontent .basic-info p{
		width: 96%;
	}

	.modalcontent .barcode{
		grid-column: 1/3;
		grid-auto-rows: 2fr;
	}
	.modalcontent .information{
		grid-column: 1/7;
		grid-row: 5/10;
		height: fit-content;
	}
}
</style>