<script setup>
    import { reactive, ref, defineProps, defineEmits, watch} from 'vue'
	import {HTTP} from '@/assets/services/http-common.js';
    import Warning from '@/components/KassascannerScreen/EpilepticWarning.vue'
    import ProductScreen from '@/components/KassascannerScreen/ProductScreen.vue'

		const props = defineProps({
            'order': Object,
            'closing': Boolean
        })
        const publicPath = ref(process.env.BASE_URL)
        const state = reactive({
            order: [],
            warning: false,
            startingoverlay: false,
            speed: 300
        })

        const emits = defineEmits(['closingmodal'])
        
        watch(() => props.closing, (newVal) => {
            if(newVal == true && !state.startingoverlay) {
                emits('closingmodal', false)
            }
        })

        
        function resendMail(){
            if(confirm("Weet je het zeker dat je de bestelling bon wilt versturen?")){
                var data = {
                    type: "Update",
                    order: props.order,
                    items: props.order.product_list
                }
                HTTP.put(`/order/${state.order.id}`, data)
                .then((response) =>{
                    console.log(response)
                    alert("Mail Verstuurd")
                })
                .catch((errors) => {
                    alert("Er ging iets verkeerd.")
                    console.log(errors)
                })
            }
        }

</script>
<template>
    <div class="scan-screen">					
        <div class="changer">
            <div class="top">
                <button class="resend" v-if="order.status == 'scanned'" @click="resendMail()" v-html="`Mail opnieuw versturen`"></button>
                <div class="help">
                    <img :src="`${publicPath}img/helpvideo.GIF`" />
                </div>
            </div>
            <div class="middle">
                <div class="warning">
                    <p>Waarschuwing ‘lichtgevoelige’ epilepsie</p>
                    <button @click="state.warning = !state.warning" v-html="`Meer informatie`"></button>
                    <div class="modal-overlay" v-if="state.warning">
                        <Warning 
                            @closeWarning="(callback) => {state.warning = false;}"/>
                    </div>
                </div>
            </div>
            <div class="bottom">
                <button class="start-button" @click="state.startingoverlay = true">Start</button>
            </div>
            <div class="modal-overlay" v-if="state.startingoverlay">
                <ProductScreen 
                    :order="order"
                    :closing="closing"
                    @closingmodal="(callback) => {emits('closingmodal', callback)}"/>
            </div>
        </div>
    </div>
</template>
<style scoped>
.changer{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    flex-wrap: wrap;
    align-content: center;
}
.resend{
    max-width: 50%;
}
.middle{
    display: flex;
    flex-direction: column;
    align-items: stretch;
    align-content: flex-start;
    flex-wrap: wrap;
}
.middle .warning{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: wrap;
    align-content: flex-start;
    padding-left: 15px;
}
.middle .warning p{
    font-weight: 600;
    font-size: 1.1rem;
}
.start-button{
    font-size: 4.5rem;
    padding: 2rem;
}
@media (min-width: 481px){
    .middle .warning p{
        font-size: 2rem;
    }
    button{
        font-size: 2rem;
    }

}
@media (min-width: 768px){
}

/* 
  ##Device = Tablets, Ipads (landscape)
  ##Screen = B/w 768px to 1024px
*/

@media (min-width: 768px) and (orientation: landscape) {
}


/* 
  ##Device = Laptops, Desktops
  ##Screen = B/w 1025px to 1280px
*/

@media (min-width: 1025px) {
  
}


@media (min-width: 1281px) {
  
  
}
</style>