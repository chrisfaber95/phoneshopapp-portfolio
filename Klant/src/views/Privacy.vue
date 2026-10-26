<template>
	<div class="privacy">
		<!--<pdf id="pdf-iframe"  v-for="i in 10"
			:key="i"
			:page="i"
			:src="`${state.publicPath}CoopLubbers-gebruiksvoorwaarden-online.pdf`"
			@loaded="showProgress($event)"
			@error="showProgress($event)"
			></pdf>-->
			<div class="tac-text" v-html="state.tac.content">
			</div>
			
			<div class="acties-tac">
				<div class="actie">
					<div class="title" v-html="`Lubbers Munten`"></div>
					<button class="actie-tac-button" @click="state.tacopen = 'Lubbersmunten' " v-html="`Algemene voorwaarden`"></button>
					<div class="modal-overlay" v-if="state.tacopen == 'Lubbersmunten'">
						<div class="tac">
							<Tacpdf
								:pdfurl="`spaarmunten_tac.pdf`"
								:pdfLength="4"
							/>
							<button class="return" @click="state.tacopen = false" v-html="`Sluiten`"></button>
						</div>                
					</div>
				</div>
				<div class="actie" v-for="actie in state.acties" :key="actie.spaaractie_id">
					<div class="title" v-html="`${actie.title}`"></div>
					<div class="time" v-html="`Looptijd: ${actie.start_date} - ${actie.end_date}`"></div>
					<button class="actie-tac-button" @click="state.tacopen = actie.spaaractie_id " v-html="`Algemene voorwaarden`"></button>
					<div class="modal-overlay" v-if="state.tacopen == actie.spaaractie_id">
						<div class="tac">
							<Tacpdf
								:pdfurl="actie.tac"
								:pdfLength="actie.tac_pages"
								:tac="actie.terms?.content"
							/>
							<button class="return" @click="state.tacopen = ''" v-html="`Sluiten`"></button>
						</div>                
					</div>
				</div>
			</div>
	</div>	
</template>

<script setup>
import { reactive, onMounted, watch } from 'vue';
import {HTTP, HTTP_Store} from '@/assets/scripts/http-common.js';
//import pdf from 'vue3-pdf'
import Tacpdf from '@/components/SpaaractieScreen/TAC.vue'


	const state = reactive({
        publicPath: process.env.BASE_URL,
        acties: [],
        tacopen: '',
		loadedRatio: 0,
		tac: '',
		info: null
	})

	onMounted(() => {
        getActies()
        getStoreInformation()   
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
	

	
    function getStoreInformation(){
        var params = {
            "domain": 'cooplubbers.nl'
        }
        HTTP_Store.get(`shops`, {params})
        .then((response) => {
            state.info = response.data[0]
        })
        .catch((err) => {
            console.log(err)
        })
    }

	function getTac(id){
        var params = {
            "TAC_id": id
        }
        HTTP_Store.get(`terms`, {params})
        .then((response) => {
            state.tac = response.data[0]
        })
        .catch((err) => {
            console.log(err)
        })
    }

	watch(() => state.info, () => {
		getTac(state.info.TAC_id)
	},{deep: true})


</script>
<style scoped>
	.spelregels{
		overflow-y: scroll;
		overflow-x: hidden;
	}
	.privacy{		
		overflow-y: scroll;
		overflow-x: hidden;
	}

	.privacy .tac-text{
		text-align: left;
		width: 98%;
		margin-left:auto;
		margin-right: auto;
		font-size: 1rem;
	}
	
	.privacy .tac-text h1,
	.privacy .tac-text h2{
		font-size: 1.3rem;
	}
	.acties-tac{
		margin-top: 20px;
		border-top: 1px solid #cccccc;
	}
	.acties-tac .actie{
		padding-top: 3px;
		padding-bottom: 3px;
		border-bottom: 1px solid #cccccc;
		display: inline-block;
		text-align: left;
		padding-left: 5px;
		width: 100%;
	}
	.actie .title{
		font-size: 1.2rem;
		font-weight: 600;
	}
	.actie .time{
		font-size: 0.9rem;
		font-style: italic;
	}
	.actie-tac-button{
		font-size: 1rem;
		padding: 3px;
	}
	.tac{		
		position: fixed;
		display: -webkit-box;
		display: -ms-flexbox;
		display: flex;
		width: 94%;
		height: 94%;
		border: 1px solid black;
		background-color: #ffffff;
		-webkit-box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
		box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
		z-index: 101;
		-webkit-box-pack: justify;
		-ms-flex-pack: justify;
		justify-content: space-between;
		top: 10px;
		left: 3%;
		flex-direction: column;
		align-items: center;
		flex-wrap: nowrap;
		padding-top: 10px;
	}
</style>
<style>
	#pdf-iframe canvas{
		position: inherit;
	}
</style>