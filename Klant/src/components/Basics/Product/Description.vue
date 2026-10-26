
<script setup>
import { defineProps} from 'vue'

defineProps({
    'product': Object
});

function newline(html){
		html = html.replace(/\n/g, '<br />');
		 
		html = html.replace(/\r?\n/g, '<br />');
		html = html.replace(new RegExp('--- ---','g'), '');
		html = html.replace(new RegExp('---','g'), '<br />');
		return html;
	}
</script>
<template>
<div class="description">
    <div class="title" v-html="`Omschrijving`"></div>
    <div class="omschrijving"
        v-html="newline(product.product_information?.omschrijving || '')">
    </div>	
</div>
</template>
<style lang="scss" scoped>  
    .description{
        width: 100%;
        height: auto;
    }
    .description .title{
       font-size: 1.5rem;
       font-weight: 600;
    }
    .description .omschrijving{
        font-size: 1rem;
    }
</style>