<script setup>
    import { reactive, onMounted } from 'vue'
    import Cookies from "js-cookie";

    const state = reactive({
        deferredPrompt: null,
        closed: false
    })

    onMounted( () => {
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            // Stash the event so it can be triggered later.
            if (Cookies.get("add-to-home-screen") === undefined) {
                state.deferredPrompt = e;
            }
            });
        window.addEventListener("appinstalled", () => {
            state.deferredPrompt = null;
            });
        })
    
        async function dismiss() {
        Cookies.set("add-to-home-screen", null, { expires: 15 });
        state.deferredPrompt = null;
        state.closed = true;
        }
        async function install() {
        state.deferredPrompt.prompt();
        }
    
    onMounted(()=>{
        setTimeout(() => {
            try{
             document.getElementById('banner').classList.add('opening')
            }
             catch (e) {
                console.log(e)
            }
        }, 3000);
    })
</script>
<template>
    <div class="banner" id="banner" v-if="!state.closed" :style="state.deferredPrompt == null || state.closed ? {'display': 'block'}:{'display' : 'none'}">
        <div
            class="text-left"
        >
            <p>Download de app op uw mobiel voor nog snellere toegang tot uw boodschappen!</p>
            <div>
            <button text @click="dismiss">Sluiten</button>
            <button text @click="install">Installeren</button>
            </div>
        </div>
    </div>
</template>
<style scoped>
    .banner{
        top: -20vh;
        left: 1%;
        width: 98%;
        height: -webkit-fit-content;
        height: -moz-fit-content;
        height: fit-content;
        min-height: 10vh;
        position: absolute;
        background-color: white;
        border: 1px solid;
        z-index:10001;
        color: black;
    }
    
    #banner.opening{
        top: 10px;
        transition: top 1s;
    }
</style>