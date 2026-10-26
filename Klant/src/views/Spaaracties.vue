<template>
    <div class="acties" :style="state.currentActie?.maincolor ? { backgroundColor : state.currentActie.maincolor} : {backgroundColor : '#ffffff'}">
        <h1 v-html="`Acties`" v-if="!state.currentActie?.title"></h1>
        <div class="actie-list" v-if="!state.currentActie?.title">
            
            <div class="block coin">
                <div class="actie">
                    <button @click="openCoinActie()">
                        <img 
                            :src="`/img/acties/coopmunten.png`" 
                        />  
                    </button>                      
                </div>
            </div>
            <div class="block running">
                <h2 v-html="`Lopende acties`"></h2>
                <div class="actie" v-for="item in currentActie" :key="item.spaaractie_id">
                    <button @click="state.currentActie = item">
                        <img 
                            :src="`${item.list_image}`" 
                        />  
                    </button>
                    <router-link :to="`/actieshop/${item.slug}`"><button class="to-products" :style="{'color': '#ffffff', 'background-color': item.maincolor, 'border-color': item.maincolor}" v-html="`Actiewinkel`" v-if="item.spaaractie_products.length != 0" @click="state.currentActie = item"></button></router-link>  
                </div>
            </div>
            
            <div class="block coming">
                <h2 v-html="`Aankomende acties`"></h2>
                <div class="actie" v-for="item in comingActies" :key="item.spaaractie_id">
                    <button @click="state.currentActie = item">
                        <img 
                            :src="`${item.list_image}`" 
                        />  
                    </button>                      
                </div>
            </div>
            
            <div class="block finished">
                <h2 v-html="`Verlopen acties`"></h2>
                <div class="actie" v-for="item in closedActies" :key="item.spaaractie_id">
                    <button @click="state.currentActie = item">
                        <img 
                            :src="`${item.list_image}`" 
                        />  
                    </button>                      
                </div>
            </div>
        </div>
        <button class="return back" @click="state.currentActie = null;" v-html="`Terug`" v-if="state.currentActie?.title"></button>
       
        <Coinfield v-if="state.currentActie?.title && state.currentActie.actietype_id == 0"/>
        <Stampfield :actie="state.currentActie" v-if="state.currentActie?.title && state.currentActie.actietype_id == 1" :key="state.currentActie.spaaractie_id"/>
        <Voucherfield :actie="state.currentActie" v-if="state.currentActie?.title && state.currentActie.actietype_id == 2" :key="state.currentActie.spaaractie_id"/>
	</div>	
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue';
import {HTTP} from '@/assets/scripts/http-common.js';
import Stampfield from '@/components/SpaaractieScreen/Stampfield1.vue';
import Voucherfield from '@/components/SpaaractieScreen/Voucherfield1.vue';
import Coinfield from '@/components/SpaaractieScreen/CoinField.vue';

    import { DateTime } from "luxon";


   
   
	const state = reactive({
        publicPath: process.env.BASE_URL,
        acties: [],
        currentActie: null,
        today: DateTime.now(),
        coinPage: 0
	})

    onMounted(() => {
        getActies()
	})

    function getActies(){
        HTTP.get(`spaaractie`)
        .then((response) => {
            state.acties = response.data
        })
        .catch(() => {
            console.log("Kon acties niet ophalen")
        })
    }

    function openCoinActie(){
        var actie = {
            title: 'Muntenactie',
            actietype_id: 0
        }
        state.currentActie = actie
    }

    const currentActie = computed(() => {	
		return state.acties.filter((item) => {
				return DateTime.fromFormat(item.start_date, 'yyyy-MM-dd') < DateTime.now() && DateTime.now() < DateTime.fromFormat(item.end_date, 'yyyy-MM-dd')
			})
	}, {immediate: true, deep: true})


    const comingActies = computed(() => {		
        return state.acties.filter((item) => {
				return DateTime.fromFormat(item.start_date, 'yyyy-MM-dd') > DateTime.now()
			})
	}, {immediate: true, deep: true})

    const closedActies = computed(() => {		
        return state.acties.filter((item) => {
				return DateTime.now() > DateTime.fromFormat(item.end_date, 'yyyy-MM-dd')
			})
	}, {immediate: true, deep: true})

</script>
<style scoped>
.acties {
    overflow-y: scroll;
    overflow-x: hidden;
}

.acties h1{
    background-color: #ffffff;
    margin-top: 0;
    margin-bottom: 0;
    padding-top: 10px;
    padding-bottom: 10px;
}
.actie-list{
    height: 100%;
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
    align-content: center;
    width: 100%;
}

.actie-list .block{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
}
.actie{
    max-width: 80%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-content: center;
    flex-wrap: nowrap;
    justify-content: flex-start;
}
.actie button{
    width: 100%;
    background: unset;
    border: unset;
    box-shadow: unset;
    padding: 0px;
    margin: 5px 0;
}
.acties .to-products{
    background-color: var(--base-color);
    border: 2px solid var(--base-color);
    border-radius: 0.25rem;
    box-shadow: 4px 4px 3px 0px #00000066;
    -webkit-box-shadow: 4px 4px 3px 0px #00000066;
    padding: 10px;
    margin: 5px 0;
    font-weight: 600;
    color: #000000;
    font-size: 1.4rem;
    width: fit-content;
}
.actie button img{
    height: auto;
    width: 100%;
}
.back{
    position: fixed;    
    bottom: calc(5% + 10px);
    right: 10px;
    z-index: 12;    
    border-color: #000;
    font-size: 1.2rem;
}
.modal-overlay{
    height: 100%;
}
.modal-overlay .back{
    z-index: 20;
}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {
    .actie-list{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: min-content;
        height: unset;
        min-height: 100%;
    }
    .block{
        height: 100%;
    }
    .block.coin{
        grid-column: 2/4;
        grid-row: 1;
    }   
    .block.running{
        grid-column: 1/3;
        grid-row: 2;
    }  
    .block.coming{
        grid-column: 3/5;
        grid-row: 2;
    }  
    .block.finished{
        grid-column: 1/3;
        grid-row: 3;
    }  
    .back{        
        bottom: calc(6% + 10px);
    }
}


@media only screen and (min-width: 500.98px) and (orientation: portrait) {
    .actie-list{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-template-rows: min-content;
        height: unset;
        min-height: 100%;
    }
    .block{
        height: 100%;
    }
    .block.coin{
        grid-column: 2/4;
        grid-row: 1;
    }   
    .block.running{
        grid-column: 1/3;
        grid-row: 2;
    }  
    .block.coming{
        grid-column: 3/5;
        grid-row: 2;
    }  
    .block.finished{
        grid-column: 1/3;
        grid-row: 3;
    }  
}
</style>