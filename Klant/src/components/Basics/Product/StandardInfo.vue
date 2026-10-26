
<script setup>
import { defineProps, reactive, onMounted} from 'vue'

defineProps({
    'product': Object
});
const state = reactive({
		show: false
	})
function newline(html){
		html = html.replace(/\n/g, '<br />');
		 
		html = html.replace(/\r?\n/g, '<br />');
		html = html.replace(new RegExp('--- ---','g'), '');
		html = html.replace(new RegExp('---','g'), '<br />');
		return html;
	}
    onMounted(() => {
    })

    function changeTitle(name){
        if(name == 'ContactName') return "Contact"
        if(name == 'BrandAddress') return "Contactgegevens"
        return name
    }
</script>
<template>
<div class="ingredients">
    <button class="title" @click="state.show = !state.show">
        Informatie
    </button>
        <div class="omschrijving">
            <div v-for="item in product" :key="item.name">
                <h4 v-html="changeTitle(item.name)"></h4>
                <p v-html="newline(item.value)"></p>
            </div>
        </div>
</div>
</template>
<style lang="scss" scoped>  
    .ingredients{
        width: 100%;
        height: auto;
        border-bottom: 2px solid #ececec;
        
    }
    .ingredients .title{
       font-size: 1.5rem;
       font-weight: 600;
       color: #000000;
    }
    .title{
        background-color: #ffffff;
        border: unset;
        box-shadow: unset;
      }
      
      .product-nutrients .title{
        font-size: 1.5rem;
        font-weight: 600;
      }
      .v-enter-active,
      .v-leave-active {
        transition: opacity 0.5s ease;
      }
      
      .v-enter-from,
      .v-leave-to {
        opacity: 0;
      }
    .ingredients .omschrijving{
        font-size: 1rem;
    }
</style>