<template>
    <div class="modal-overlay temp" v-if="klantenkaart != '6207038699858' && klantenkaart != '6472351750024' && klantenkaart != '1000000000001'">
        <router-link to='loyalty_card' v-if="klantenkaart">
            <button>Klantenkaart tonen</button>
        </router-link>        
        <router-link to='spaaracties' v-if="klantenkaart">
            <button>Onze lokale acties!</button>
        </router-link>
        <router-link to="signup" v-if="!klantenkaart">
            <button>Registeer hier om alvast te gaan sparen!</button>
        </router-link>
        <img :src="`${state.publicPath}img/soon.jpg`"/>
    </div>
</template>

<script setup>
import { reactive, computed} from 'vue';
	import { useStore } from 'vuex'
	const store = useStore()

const state = reactive({
    publicPath: process.env.BASE_URL,
})
const klantenkaart = computed(() => {
    return store.getters['shopsettings/getUserinfo'].klantenkaart
})

</script>

<style scoped>
.modal-overlay.temp{
    top: 0;
    background-color: #F58320;
    height: 95%;
    overflow: hidden;
    z-index: 10;
        
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    align-content: stretch;
}
.modal-overlay.temp button{
    background-color: #ffffff;
    border-color: #000000;
    color:#000000;
}
.modal-overlay.temp img{
    max-height: 85%;
    max-width: 100%;
    width: auto;
}
</style>
