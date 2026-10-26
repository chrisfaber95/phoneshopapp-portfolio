<template>
	<div class="voucher">
        <!--<img class="background" :src="`${state.publicPath}img/stamp-background.png`"/>-->
        <div class="content">
            <img :src="stamp ? `${$imageHost}/${actie.stamp_imgurl}` : `${actie.imgurl}`" :class="{'visible_stamp': stamp}" />
            <img class='coin visible_stamp' :src="last ? `img/coin_exchange.png`: ``" v-if="last" style="max-width: 80%;"/>
            <div class="number" v-html="stamp_number" v-if="!stamp && !last"></div>
            <div class="number" v-html="custom.substring(0,8) + stamp_number" v-if="stamp"></div>
        </div>
	</div>
</template>

<script setup>
import { defineProps, onMounted } from 'vue';
	

defineProps({
    'actie': Object,
    'stamp': Boolean,
    'stamp_number': Number,
    'last': Boolean,
    'custom': String
});






	


		/*
		newline:function(html){
			html = html.replace(new RegExp('\r?\n','g'), '<br />');
			return html;
		}
		*/
        
        

    onMounted(() => {
        //getCustomerInfo()
        //getCustomerActies()   
	})



</script>

<style scoped>
.voucher{
    position: relative;
    height: 100%;
	display: flex;
	flex-direction: column;
	align-content: center;
    align-items: stretch;
    justify-content: center;
    flex-wrap: nowrap;
}
.background{
    opacity: 0.8;
}
.voucher .content{
    position: relative;
    width: 100%; 
    display: block;
    height: fit-content;
}
.voucher .content img{
    position: absolute;
    top: calc(50% - 1.5rem);
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    opacity: 0.4;
}
.voucher .content .visible_stamp{
    opacity: 1;
}
.voucher .content .number{
    position: absolute;
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, 100%);
    font-size: 2rem;
    color: #000000;
    font-weight: 600;
}
@media only screen and (min-height: 500.98px) and (orientation: landscape) {
    .voucher .content{
        height: 100%;
    }
    .number{        
        bottom: 30%;
    }
}
</style>