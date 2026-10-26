<template>
    <div class="product-modal">
        <div class="header">
			<div class="title">
				<p v-html="product.product_information?.title"></p>
			</div>
        </div>
        <div class="content">
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
			</div>
			
			<div class="discount">
				<Actietag  
				v-if="isDiscounted"
				:label="isDiscounted.discount_info.discount_type.discounttype_label" />
				<i class="geldig" v-if="isDiscounted" v-html="`Geldig van ${formatDate(isDiscounted?.discount_info.starting_date)}<br>tot ${formatDate(isDiscounted?.discount_info.end_date)}`"></i>
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
        <div class="footer">
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
<script>
import { defineProps, defineEmits } from 'vue';



    defineProps({
		'location': String,
        'product': Object
	});
    
	defineEmits(['closeModal']);

</script>
<style scoped>
    .product-modal{

    }

</style>