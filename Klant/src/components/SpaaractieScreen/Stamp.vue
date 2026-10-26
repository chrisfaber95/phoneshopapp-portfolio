<template>
	<div class="stamp">
        <img class="background" :src="`${state.publicPath}img/stamp-background.png`"/>
        <div class="content">
            <img :src="stamp ? `${$imageHost}/${actie.stamp_imgurl}` : `${$imageHost}/${actie.imgurl}`" :class="{'visible_stamp': stamp}" />
            <img class='coin visible_stamp' :src="last ? `img/coin_exchange.png`: ``" v-if="last" style="max-width: 80%;"/>
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
	display: flex;
	flex-direction: column;
	align-content: center;
    align-items: stretch;
    justify-content: space-between;
    flex-wrap: nowrap;
}
.background{
    opacity: 0.8;
}
.content{
    position: absolute;
    width: 100%;
    height: 100%;
    display: inline-block;
}
.content img{
    position: absolute;
    top: 50%;
    left: 50%;
    margin-right: -50%;
    transform: translate(-50%, -50%);
    opacity: 0.4;
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