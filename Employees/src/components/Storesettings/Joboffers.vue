<template>
    <div class="joboffer">
        <h1 v-html="`Vacatures`"></h1>
        <div class="joboffer-list">
            <div class="offer" v-for="item in joboffers" :key="item.job_offer_id">
                <offerSmall :offer="item" />
            </div>
        </div>
    </div>	
</template>

<script setup>
import { reactive, onMounted, computed } from 'vue';
//import {useRoute} from 'vue-router'
import {HTTP_Store} from '@/assets/services/http-common.js';
import offerSmall from '@/components/Storesettings/Jobs/offer-small.vue'

    import { DateTime } from "luxon";

	//const route = useRoute();

  // const path = computed(() =>route.path)
   
	const state = reactive({
        publicPath: process.env.BASE_URL,
        offers: [],
        today: DateTime.now()
	})

    onMounted(() => {
        getJobs()
	})

    function getJobs(){
        HTTP_Store.get(`job_offer`)
        .then((response) => {
            state.offers = response.data
            console.log(response)
        })
        .catch((err) => {
            console.log(err)
            console.log("Kon vacatures niet ophalen")
        })
    }

    const joboffers = computed(() => {		
		return state.offers.filter((item) => {
           // return DateTime.now() < DateTime.fromISO(item.expires_at)
            return item
        })
	}, {immediate: true, deep: true})
</script>
<style scoped>
.joboffer {
    overflow-y: scroll;
    overflow-x: hidden;
}

.joboffer-list{
    width: 98%;
    margin-lefT: auto;
    margin-right: auto;
    display: flex;
    justify-content: center;
}
.offer{
    border: 1px solid #ececec;
    padding: 3px;
    width: 98%;
}

</style>