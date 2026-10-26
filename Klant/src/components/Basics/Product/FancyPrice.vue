
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
    <div class="price" :class="{'discounted' : discount }">
        <div class="currency" v-html="`&euro;`"></div>
        <div class="whole" v-html="whole"></div>
        <div class="decimal" v-html="','"></div>
        <div class="decimal-part" v-html="decimal"></div>
        <div class="line-through"></div>
    </div>
</template>
<style lang="scss" scoped>  

.price{
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: flex-start;
    flex-wrap: nowrap;
    position: relative;
    max-width: 100%;
    width: min-content;
}
.whole{
    font-size: 2.2rem;
    font-weight: 800;
}
.decimal-part{
    font-size: 1.6rem;
    font-weight: 600;
}
.currency{
    padding-left: 5px;
    padding-right: 2px;
    font-size: 2.2rem;
    font-weight: 600;
}
.decimal{
    font-size: 1.6rem;
    font-weight: 600;
}

.price.small .whole{
    font-size: 1.4rem;
}
.price.small .decimal-part{
    font-size: 1.0rem;
}
.price.small .currency{
    font-size: 1.4rem;
}
.price.small .decimal{
    font-size: 1.0rem;
}

.price.med .whole{
    font-size: 1.7rem;
}
.price.med .decimal-part{
    font-size: 1.3rem;
}
.price.med .currency{
    font-size: 1.7rem;
}
.price.med .decimal{
    font-size: 1.3rem;
}



.line-through{
    display: none;
}

.discount-price{
    color:#f00;
}
.discounted.price{
    color:#717171 !important;
}
.discounted .whole{
    font-size: 1.7rem;
}
.discounted .decimal-part{
    font-size: 1.4rem;
}
.discounted .decimal{
    font-size: 1.4rem;
}
.discounted .currency{
    font-size: 1.7rem;
}

.discounted.med .whole{
    font-size: 1.4rem;
}
.discounted.med .decimal-part{
    font-size: 1.0rem;
}
.discounted.med .currency{
    font-size: 1.4rem;
}
.discounted.med .decimal{
    font-size: 1.0rem;
}


.discounted .line-through{
    display: block;
    width: 100%;
    height: 2px;
    background-color: #717171 !important;
    position: absolute;
    left: 0px;
    bottom: 30%;
    -webkit-transform-origin: bottom left;
    transform-origin: bottom left;
    -webkit-transform: rotate(-45deg);
    transform: rotate(349deg);
}
</style>