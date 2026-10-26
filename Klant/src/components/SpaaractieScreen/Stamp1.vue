<template>
	<div class="stamp">
        <img class="background" :src="`${state.publicPath}img/stamp-background.png`"/>
        <div class="content">
            <img :src="stamp ? `${$imageHost}/${actie.stamp_imgurl}` : `${$imageHost}/${actie.imgurl}`" :class="{'visible_stamp': stamp}" />
            <img class='coin visible_stamp' :src="last ? `img/coin_exchange.png`: ``" v-if="last" style="max-height: 80%;"/>
            <div class="number" v-html="stamp_number" v-if="!stamp && !last"></div>
        </div>
	</div>
</template>

<script setup>
import { reactive, defineProps, onMounted } from 'vue';
	

defineProps({
    'actie': Object,
    'stamp': Boolean,
    'stamp_number': Number,
    'last': Boolean
});


const state = reactive({
    publicPath: process.env.BASE_URL,
    productModalOpened: false
})



	


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
.stamp{
    position: relative;
    height: 100%;
	display: block;
    text-align: left;
}
.background{
    opacity: 0.8;
    position: absolute;
    display: inline-block;
    top: 50%;
    left: 50%;
    margin-right: -50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    max-height: 100%;
    max-width: 100%;
    width: auto;
    height: auto;
}
.content{
    position: absolute;
    width: 97%;
    height: 97%;
    display: inline-block;
    top: 0;
    left: 0;
}
.content img{
    position: absolute;
    top: 50%;
    left: 50%;
    margin-right: -50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    opacity: 0.4;
    max-height: 100%;
    max-width: 100%;
    width: auto;
    height: auto;
}
.content .visible_stamp{
    opacity: 1;
}
.content .number{
    position: absolute;
    top: 50%;
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    font-size: 2rem;
    color: #0010ee;
    font-weight: 600;
}
</style>