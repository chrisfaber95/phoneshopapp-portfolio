
<script setup>
import { defineProps, computed} from 'vue'

const props = defineProps({
    'price': String,
    'discount': Object,
    'fontSize': Number
})

const computedFontSize = computed(() => {
  return `${props.fontSize}em`
})

</script>
<template>
    <div class="pricetag" :class="{'discounted' : discount }">
        <img class="img" :src="discount ? require('@/assets/kaart-actie.png') : require('@/assets/kaart1.png')"/>
        <div class="price-amount" 
            :style="[{'font-size': computedFontSize}]"
                v-html="`&euro;${price}`">
        </div>
    </div>
</template>
<style lang="scss" scoped>  

.pricetag{
    width: 100%;
    height: 100%;
	max-width: 100%;
    position: relative;
}
.pricetag .img{
    width: 100%;
    height: 100%;
	max-width: 100%;
    position: relative;
    -webkit-filter: drop-shadow(5px 5px 5px #222);
    filter: drop-shadow(-2px 2px 1px #00000066);
}

.pricetag.discounted img{
}
.price-amount{
    color: #000000;
    z-index: 5;
    width: 100%;
    height: 95%;
    right: 0;
    top: 0;
    position: absolute;
    display: inline-block;
    text-align: center;
    white-space: 'nowrap';
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
}
.pricetag.discounted .price-amount {
}
</style>