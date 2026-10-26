
<script setup>
import { defineProps, computed} from 'vue'

const props = defineProps({
    'price': String,
    'discount': Boolean
})

const whole = computed(() => {
  return props.price.split('.')[0]
})
const decimal = computed(() => {
  return props.price.split('.')[1]
})



</script>
<template>
    <div class="pricetag" :class="{'discounted' : discount }">
        <img class="img" :src="discount ? require('@/assets/kaart-actie.png') : require('@/assets/kaart1.png')"/>
        <div class="price" :class="{'discounted' : discount }">
            <div class="currency" v-html="`&euro;`"></div>
            <div class="whole" v-html="whole"></div>
            <div class="decimal" v-html="','"></div>
            <div class="decimal-part" v-html="decimal"></div>
            <div class="line-through"></div>
        </div>
    </div>
</template>
<style lang="scss" scoped>  
.pricetag{
    width: 65%;
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

.price{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    position: relative;
    max-width: 100%;
    width: min-content;
    z-index: 5;
    width: 100%;
    height: 95%;
    right: 0;
    top: 0;
    position: absolute;
}
.whole{
    font-size: 1.6rem;
    font-weight: 800;
}
.decimal-part{
    font-size: 1.2rem;
    font-weight: 600;
}
.currency{
    padding-left: 5px;
    padding-right: 2px;
    font-size: 1.6rem;
    font-weight: 600;
}
.decimal{
    font-size: 1.2rem;
    font-weight: 600;
}

.line-through{
    display: none;
}

.discount-price{
    color:#f00;
}
.discounted .price{
    color:#000;
    font-style: italic;
}
.discounted .whole{
    font-size: 1.6rem;
}
.discounted .decimal-part{
    font-size: 1.0rem;
}
.discounted .decimal{
    font-size: 1.0rem;
}
.discounted .currency{
    font-size: 1.6rem;
}

.discounted .line-through{
    display: block;
    width: 85%;
    height: 3px;
    background-color: #000;
    position: absolute;
    left: 10%;
    bottom: 30%;
    -webkit-transform-origin: bottom left;
    transform-origin: bottom left;
    -webkit-transform: rotate(-45deg);
    transform: rotate(349deg);
}
</style>