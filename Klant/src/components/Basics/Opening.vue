<script setup>
    import { reactive } from 'vue'
    import router from '@/router';

    import { useStore } from 'vuex'
	const store = useStore()

    const state = reactive({
        publicPath: process.env.BASE_URL
    })

    function appOpened(link){
        store.commit('shopsettings/updateOpened', 2)
        router.push(link)
    }

    
	

</script>
<template>
    <div class="opening">
        <img class="img-fluid logo" :src="`${state.publicPath}img/logo-supermarkt-coop.png`"/>
        <img class="img-fluid banner" :src="`${state.publicPath}img/background-opening.jpg`"/>
        <div class="account">
            <button class="login" @click="appOpened('/login')" v-html="`Inloggen`"></button>       
            <button class="register" :to="`/signup`" @click="appOpened('/signup')" v-html="`Account aanmaken`"></button>            
            <b>Of</b>
            <button class="nothing" :to="`/`" @click="appOpened('/')" v-html="`Winkelen zonder account`"></button>
        </div>
        <div class="temp" style="display: none;">Je kunt veilig en gemakkelijk bestellen zonder een account aan te maken. Houd er rekening mee dat je hierdoor geen gebruik kunt maken van de extra functionaliteiten, zoals het inzien van eerdere bestellingen.</div>
    </div>
</template>
<style scoped>
    .opening{
        width: 100%;
        height: 100%;
        background-color: var(--base-color);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        z-index: 10000;
    }

    .opening button{
        width: 80%;
        font-size: 1.2rem;
        padding: 15px;
        text-transform: uppercase;
        border-radius: 10px;
        color: #ffffff;
    }

    .logo{
        max-height: 12%;
        padding: 10px;
    width: auto;
    }
    .banner{
        height: 40%;
        object-fit: cover;
    }

    .account{
        width: 94%;
        margin-left: auto;
        margin-right: auto;
        background: #fafafa;
        border: 3px solid #a8a8a8;
        border-radius: 0.25rem;
        box-shadow: 4px 4px 3px 0px #00000066;
        -webkit-box-shadow: 4px 4px 3px 0px #00000066;
        margin-top: -10%;
        z-index: 2;
        position: relative;
        margin-bottom: 10%;
        min-height: 50%;

        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: center;
        flex-direction: column;
    }
    .login{
        background-color: #0b8600;
        border-color: #0b8600;
    }

    .account .nothing{
        background-color: #2F3032;
        border-color: #2F3032;
        color: #ffffff;
    }
    .no-account{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: wrap;
    }

    .no-account button{
        font-size: 1rem;
    width: 100%;
    }
</style>