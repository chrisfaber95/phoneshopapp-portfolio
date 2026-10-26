<script setup>
    import { reactive, onMounted, ref, defineProps, defineEmits, watch} from 'vue'
	import {HTTP} from '@/assets/services/http-common.js';
    import Warning from '@/components/KassascannerScreen/EpilepticWarning.vue'
    import DailyProductScreen from '@/components/KassascannerScreen/DailyProductScreen.vue'

		const props = defineProps({
            'date': Date,
            'closing': Boolean
        })
        const publicPath = ref(process.env.BASE_URL)
        const state = reactive({
            orders: [],
            warning: false,
            startingOverlay: false,
            speed: 300
        })

        function formattedDate(date){
            console.log(new Date(date).toISOString())
            console.log(new Date(date).toISOString().split('T'))
            return new Date(date).toISOString().split('T')[0]
        }

        function getOrders(date) {
            if(date == ''){
			date = formattedDate(state.orderDate)
                }
                const params = {
                    0: [{
                        filterType: 'and',
                        value: [
                            {
                                pickupDate: date
                            }
                        ],
                        }
                    ],
                    1: [{
                        filterType: 'and',
                        value: [
                            {
                                status: {
                                    filterType: 'notLike',
                                    value: 'pending'
                                }
                            }
                        ]}
                    ]
                }
                HTTP.get(`order`, {params})
                .then((response) => {
                console.log(response)
                state.orders = response.data
                state.orders = state.orders.filter(e => (e.status == "afgehaald" || e.status =="scanned" || e.status == 'payed' || e.status == 'picked'))
            })
            .catch((errors) => {
                console.log(errors)
            })
        }

        const emits = defineEmits(['closingmodal'])
        
        watch(() => props.closing, (newVal) => {
            console.log(props.closing)
            if(newVal == true && !state.startingOverlay) {
                emits('closingmodal', false)
            }
        })

        onMounted(() => {
            getOrders(formattedDate(props.date))
        })


</script>
<template>
    <div class="daily-scan-screen">					
        <div class="changer">
            <div class="top">
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
                <button class="start-button" @click="state.startingOverlay = true">Start</button>
            </div>
            <div class="modal-overlay" v-if="state.startingOverlay">
                <DailyProductScreen 
                    :orders="state.orders"
                    :closing="props.closing"
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