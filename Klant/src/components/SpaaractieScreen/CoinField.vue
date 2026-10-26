<template>
    <div class="actiepage coinpage">
        <div class="actieinfo" v-if="!state.openShop">
            <div class="stampfield frontpage">
                <div class="front-image">
                    <img :src="`img/acties/spaarmunten-back.jpeg`" />
                    <div class="coins" v-html="coin_amount"></div>
                </div>
            </div>
            <p class="error">Coop munten worden berekend over het restwaarde van het bedrag na het berekenen van de zegels van de overige acties. Klik op spelregels voor meer informatie</p>
            <div class="info">
                <span @click="state.tacopen = true">&#9432; Spelregels</span>
            </div>            
            <div class="modal-overlay" v-if="state.tacopen">
                <div class="tac">
                    <Tacpdf
                        :pdfurl="`spaarmunten_tac.pdf`"
                        :pdfLength="4"
                    />
                    <button class="close-button" @click="state.tacopen = false" v-html="`Sluiten`"></button>
                </div>                
            </div>
        </div>
       <!-- </div>
        
        <div class="coinexchange">
            <Coinexchange 
                :actie="actie" />
        </div>-->
	</div>
</template>

<script setup>
import { reactive, defineProps, onMounted, computed, onBeforeUpdate } from 'vue';
	
import {HTTP} from '@/assets/scripts/http-common.js';
import { useStore } from 'vuex'

import Tacpdf from '@/components/SpaaractieScreen/TAC.vue'


const store = useStore()

const props = defineProps({
})

const state = reactive({
    publicPath: process.env.BASE_URL,
    productModalOpened: false,
    customer_actie: [],
    stamp_amount: null,
    pages: 3,
    currentPage: 0,
    openShop: false,
    customer_info: null,
    tacopen: false
})

        function getCustomerInfo(){
            const id = localStorage.getItem("user_id");
            const token = localStorage.getItem("access_token");

            const params = {
                customer_id: id,
                accessToken: token
            }
            HTTP.get("customer", {params})

            .then(response => {
                state.customer_info = response.data[0]
            })
            .catch(() => {
            })
        }
const coin_amount = computed(() => {
    return state.customer_info?.storepoints || 0
})







onMounted(() => {
        store.commit('changeActie', props.actie)
        getCustomerInfo()
	})


onBeforeUpdate(() => {
})

</script>

<style scoped>
    .actiepage.coinpage{
        background-color: var(--base-color);
        min-height: 100%;
    }
    .error{
        max-width: 90%;
        font-size: 1rem;
        color:#ffffff;
        margin-left: auto;
        margin-right: auto;
    }
    .close-button{
        position: relative;
        margin-left: auto;
        right: 10px;
    }
    .tac{
        display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: flex-start;
    align-items: stretch;
	padding-top: 10px;
    }
    .actiepage{
    height: inherit;
}
.actieinfo{
    height: 90%;
    width: 100%;
    overflow-y: scroll;
    padding-bottom: 20px;
}
.actieshop{
    height: 99%;
}
.header{
    display: flex;
    width: 100%;
    font-size: 1.4rem;
    color: #ffffff;
    stroke: 1px solid #000000;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    padding-top: 10px;
    align-items: center;
}

.header .amount{
    border: 1px solid;
    padding: 5px;
    border-radius: 10px;
    margin: 2px;
}
.header button{
    margin: 5px 0;
}
.stampfield{
    background-repeat: no-repeat;
    background-size: cover;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    height: fit-content;
    position: relative;
}
.front-image{
    height: fit-content;
    width: auto;
    position: relative;
}
.front-image img {
    max-height: 100%;
    width: 100%;
}
.to-products{
    font-size: 1.1rem;
    background-color: #ffffff;
    border-color: #ececec;
}
.stampfield h1{
    color: #ffffff;
    padding-top: 0px;
    padding-bottom: 0px;
    font-size: 1.3rem;
}
.stamps{
    position: relative;
    width: 95%;
	display: grid;
	grid-template-rows: repeat(5, 1fr);
    grid-gap: 5px;
    margin-left: auto;
    margin-right: auto;
    padding-bottom: 10px;
    padding-top: 10px;
}


.slider{
    width: 100%;
    height: 550px;
    margin: 0 auto;
    position: relative;    
}

.slides{
    height: 100%;
    left: 100%;
}

.slides .active {
    left: 0;
    z-index: 10;
}
.slides .back {
    left: 100%;
    z-index: 2;
}
.slides .front {
    left: -100%;
    z-index: 2;
}
.slides>div{
    width:100%;
    height: min-content;
    position: absolute;
    transition: all 1s;
    background-size: contain;
    background-repeat: no-repeat;
    height: fit-content;    
    background-position: top;
}
.slider span{
    height: 50px;
    width: 50px;
    position: absolute;
    top:50%;
    margin:-25px 0 0 0;
    background-color: rgba(0, 0, 0, 0.4);
    color:#fff;
    line-height: 50px;
    text-align: center;
    cursor: pointer;
    z-index: 11;
}
.title{
    top:80% !important;
    font-size: 30px;
    font-weight: 800;
    text-align: center;
    cursor: auto !important;
    padding: 0 20px;
}
.slides{
    font-size: 30px;
    text-align: center;
    text-transform: uppercase;
    color: #fff;
}
#prev{
    left:0;
    border-radius: 0 10px 10px 0;
}
#next{
    right:0;
    border-radius:10px 0 0 10px;
}
#prev svg,#next svg{
    width:100%;
    fill: #fff;
}
#prev:hover,
#next:hover{
    background-color: rgba(0, 0, 0, 0.8);
}
.info{
    font-size: 1.8rem;
    z-index: 11;
    display: inline-block;
    text-align: left;
    color: #000000;
    left: 0;
    position: absolute;
    width: 100%;    
    bottom: calc(5% + 10px);
}

.coins{
    position: absolute;
    display: block;
    left: 20%;
    bottom: 15%;
    color: #ffffff;
    font-size: 3.5rem;
}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {
    .actieinfo{
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        height: unset;
        max-height: 100%;
    }
    .stampfield{
        grid-row: 1/3;
        grid-column: 1;
        height: unset;
        max-height: 100%;
    }
    .front-image{
        height: 100%;
    }
    .coins{
        left: 18%;
        bottom: 12%;
        font-size: 4rem;
    }
    .error{
        font-size: 1.5rem;
        grid-row: 1;
        grid-column: 2;
    }
    .info{
        grid-row: 2;
        grid-column: 2;
        width: unset;
        position: relative;
        color: #ffffff;
        font-size: 2.3rem;
    }
}
</style>