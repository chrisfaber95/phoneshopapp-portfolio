<template>
	<div class="product">
        <div class="information">
            <span class="itembrand" v-html="' '"></span>
            <div class="background">
                <img 
                    :src="require('@/assets/icons/background.png')" 
                    :intersection-options="{rootMargin: '10%'}"
                    />
            </div>
        </div>
        <div class="price">
            <img class="img-fluid pricetag" v-bind:src="require('@/assets/kaart1.png')"/>
        </div>
	</div>
</template>

<script setup>
import { reactive, defineProps, onMounted} from 'vue';
const props = defineProps({
    'product': Object
})

const state = reactive({
    productModalOpened: false,
    favorite: false
})

onMounted(() => {
    if(props.product?.favorite_products_list?.length > 0) state.favorite = true
})

</script>

<style scoped>
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
.background{
    position: absolute;
    bottom: 0;
    z-index: 3;
}
.background img{
    width: 100%;
    height: auto;
    z-index: 2;
    transform: scaleY(1.4) translateY(0px) translateX(-1px);
}
.information{
    display: block;
    position: absolute;
    width: 100%;
    height: 80%;
}
.itembrand{
    width: 100%;
    display: block;
    position: absolute;
    bottom: 12%;
    background-color: #dfdfdf82;
    z-index: 2;
    right: 0;
    height: 17%;
}
.itembrand.lessrows{
	font-size: 0.9rem;
	height:20%;
	font-weight: 600;
}
.price{
    margin: 0;
    height: 25%;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    bottom: 0;
    width: 100%;
    z-index: 4;    
    left: 1%;
}

@media screen and (min-width: 768px) {
	.itembrand{
		font-size: 1rem;
	}
}
.price .pricetag{
    width: 90%;
    height: 100%;
	max-width: 100%;
    position: absolute;
    left: 5%;
}
</style>