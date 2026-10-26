<template>
	<div class="time-picker">
        <div class="slot-chooser">
            <div class="header">
                <h3>Ochtend</h3><b>Beschikbare tijden &#8594;</b>
            </div>
            
            <div class="slots">
                <div class="no-slots" v-if="availableTimeslotsMorning.length == 0">
                    <b>Geen tijden beschikbaar</b>
                </div>
                <button 
                    class="timeslot" 
                    v-for="time in availableTimeslotsMorning" 
                    :key="`${time?.hours}:${time?.minutes}`" 
                    @click="emit('chooseTimeslot', time); state.pickedTime = time" 
                    :disabled="time?.orderCount >= time.available_slots" 
                    :class="[{ active: time?.hours == state.pickedTime?.hours && time.minutes == state.pickedTime?.minutes }]">
                    <div v-html="`${String(time?.hours).padStart(2, '0')}:${String(time?.minutes).padStart(2, '0')}`"></div>
                </button>
            </div>
        </div>
        <div class="slot-chooser">
            <div class="header">
                <h3>Middag</h3><b>Beschikbare tijden &#8594;</b>
            </div>
            <div class="no-slots" v-if="availableTimeslotsAfternoon.length == 0">
                <b>Geen tijden beschikbaar</b>
            </div>
            
            <div class="slots">
                <button class="timeslot"  
                    v-for="time in availableTimeslotsAfternoon" 
                    :key="`${time?.hours}:${time?.minutes}`" 
                    @click="emit('chooseTimeslot', time); state.pickedTime = time" 
                    :disabled="time?.orderCount >= time.available_slots" 
                    :class="[{ active: time?.hours == state.pickedTime?.hours &&  time.minutes == state.pickedTime?.minutes }]">
                    <div v-html="`${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`"></div>
                </button>
            </div>
        </div>
        
        <div class="slot-chooser">            
            <div class="header">
                <h3>Avond</h3><b>Beschikbare tijden &#8594;</b>
            </div>           
            <div class="no-slots" v-if="availableTimeslotsEvening.length == 0">
                <b>Geen tijden beschikbaar</b>
            </div> 
        <div class="slots">
            <button class="timeslot" 
            v-for="time in availableTimeslotsEvening" 
            :key="`${time?.hours}:${time?.minutes}`" 
            @click="emit('chooseTimeslot', time); state.pickedTime = time" 
            :disabled="time?.orderCount >= time.available_slots" 
            :class="[{ active: time?.hours == state.pickedTime?.hours &&  time.minutes == state.pickedTime?.minutes }]">
                <div v-html="`${String(time?.hours).padStart(2, '0')}:${String(time?.minutes).padStart(2, '0')}`"></div>
                <!--<div v-html="formatDate"> </div>-->
            </button>
        </div>
        </div>
	</div>	
</template>

<script setup>
import { reactive, defineProps, computed, defineEmits, onMounted, watch} from 'vue';
    import {HTTP, HTTP_Store} from '@/assets/scripts/http-common.js';
    import { DateTime } from "luxon";
    import moment from 'moment';

const props = defineProps({
		'date': String,
        'startPickupHour': Number,
		'endPickupHour': Number,
        'minuteGap': Number,
        'delivery': Boolean
	})

	const state = reactive({        
        pickedTime: {hours: 0, minutes: 0},
        morning: false,
        afternoon: false,
        evening: false,
        timeslots: []
	})

    const availableSlots = computed(() => {
        var delivery = props.delivery? 1 : 0
        var slots = state.timeslots.filter(e => {
            return (e.timeslot_date == DateTime.fromFormat(props.date, 'yyyy-MM-dd').toFormat('yyyy-MM-dd'))
        })
        var slots_deliv = slots.filter(e => {
            return (e.is_delivery == true)
        })
        slots = slots.filter(e => {
            return (e.is_delivery == false)
        })
        if(delivery == 1){
            return slots_deliv
        }
        else{
            return slots
        }
    })

    const availableTimeslotsMorning = computed(() => {
        let timeslots = []
        for(var i = 0; i < availableSlots.value.length; i++){
            var time = moment(availableSlots.value[i].timeslot_start, 'HH:mm')
            while (time < moment(availableSlots.value[i].timeslot_end, 'HH:mm')) {
                if(time.hour() >= 12) break
                var orderCount = null;
                if(state.orderCount){
                    orderCount = state.orderCount.find((orderCount) => {
                        const orderPickupTime = moment(orderCount.pickupTime, 'HH:mm');
                        return (
                            orderPickupTime.hour() === time.hour() &&
                            orderPickupTime.minute() === time.minute()
                        );
                    });
                }
                var disabled = false
                if( DateTime.fromFormat(props.date, 'yyyy-MM-dd').startOf("day") <= DateTime.now().startOf("day")){
                  //  console.log(DateTime.now().add({'2': 'hours'}))
                   // console.log(DateTime.now().plus({hours: 2}))
                    if(DateTime.now().plus({hours: 2}) > DateTime.now().startOf("day").plus({hours: time.hour(), minutes: time.minute()})){
                       disabled = true
                    }
                }
                if(disabled === false){
                    timeslots.push({
                        'hours': time.hour(), 
                        'minutes': time.minute(),
                        'available_slots': availableSlots.value[i].available_slots,
                        'orderCount': orderCount ? orderCount.orderCount : null,
                    });
                }
                time.add(props.minuteGap, 'm')
            }
        }        
        return timeslots
    })
    
    const availableTimeslotsAfternoon = computed(() => {
        let timeslots = []
        for(var i = 0; i < availableSlots.value.length; i++){
            var time = moment(availableSlots.value[i].timeslot_start, 'HH:mm')
            while (time < moment(availableSlots.value[i].timeslot_end, 'HH:mm')) {
                if(time.hour() >= 12 && time.hour() < 18) {
                    var orderCount = null;                    
                    if(state.orderCount){
                        orderCount = state.orderCount.find((orderCount) => {
                            const orderPickupTime = moment(orderCount.pickupTime, 'HH:mm');
                            return (
                                orderPickupTime.hour() === time.hour() &&
                                orderPickupTime.minute() === time.minute()
                            );
                        });
                    }
                    var disabled = false
                    if( DateTime.fromFormat(props.date, 'yyyy-MM-dd').startOf("day") <= DateTime.now().startOf("day")){
                    //  console.log(DateTime.now().add({'2': 'hours'}))
                    // console.log(DateTime.now().plus({hours: 2}))
                        if(DateTime.now().plus({hours: 2}) > DateTime.now().startOf("day").plus({hours: time.hour(), minutes: time.minute()})){
                            disabled = true
                        }
                    }
                    if(disabled === false){
                        timeslots.push({
                            'hours': time.hour(), 
                            'minutes': time.minute(),
                            'available_slots': availableSlots.value[i].available_slots,
                            'orderCount': orderCount ? orderCount.orderCount : null,
                        });
                    }
                }
                time.add(props.minuteGap, 'm')
            }
        }        
        return timeslots
    })
    
    const availableTimeslotsEvening = computed(() => {
        let timeslots = []
        for(var i = 0; i < availableSlots.value.length; i++){
            var time = moment(availableSlots.value[i].timeslot_start, 'HH:mm')
            while (time < moment(availableSlots.value[i].timeslot_end, 'HH:mm')) {
                if(time.hour() >= 18 && time.hour() < 23) {
                    var orderCount = null;
                    if(state.orderCount){
                        orderCount = state.orderCount.find((orderCount) => {
                            const orderPickupTime = moment(orderCount.pickupTime, 'HH:mm');
                            return (
                                orderPickupTime.hour() === time.hour() &&
                                orderPickupTime.minute() === time.minute()
                            );
                        });
                    }
                    var disabled = false
                    if( DateTime.fromFormat(props.date, 'yyyy-MM-dd').startOf("day") <= DateTime.now().startOf("day")){
                    //  console.log(DateTime.now().add({'2': 'hours'}))
                    // console.log(DateTime.now().plus({hours: 2}))
                        if(DateTime.now().plus({hours: 2}) > DateTime.now().startOf("day").plus({hours: time.hour(), minutes: time.minute()})){
                            disabled = true
                        }
                    }
                    if(disabled === false){
                        timeslots.push({
                            'hours': time.hour(), 
                            'minutes': time.minute(),
                            'available_slots': availableSlots.value[i].available_slots,
                            'orderCount': orderCount ? orderCount.orderCount : null,
                        });
                    }
                }
                time.add(props.minuteGap, 'm')
            }
        }        
        return timeslots
    })

    

    function getTimeslots(){
        var params = {
           //customer_id: localStorage.getItem('user_id'), 
            //accessToken: localStorage.getItem('access_token')
        }
		HTTP_Store.get(`timeslot`, { params: params })
        .then((response) => {
            state.timeslots = response.data
        })
        .catch(() => {
        })
	}
    function getUsedSlots(){
        var params = {
           //customer_id: localStorage.getItem('user_id'), 
            //accessToken: localStorage.getItem('access_token')
        }
		HTTP.get(`order/count/${props.date}`, { params: params })
        .then((response) => {
            state.orderCount = response.data
        })
        .catch((e) => {
            console.log(e)
        })
	}

    onMounted(() => {
        getTimeslots()
        getUsedSlots()
    })

    
	watch(() => props.date, (newVal) => {
        emit('chooseTimeslot', null); state.pickedTime = null
		getUsedSlots()
	})

    const emit = defineEmits(['chooseTimeslot', 'closeTimeslot'])
</script>
<style scoped>
	.active{
        background-color: rgb(6, 180, 0);
        border-color: rgb(6, 180, 0);
        color: #ffffff;
    }
    .time-picker{
        overflow-y: scroll;
        max-height: 100%;
    }
    .slot-chooser{
        border-top: 1px solid #b3b3b3;
        width: 100%;
        margin-top: 10px;
    }
    .slot-chooser .header{
        width: 100%;    
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
    .slot-chooser .header h3{
        margin-top: 5px;
        margin-bottom: 5px;
    }
    .slot-chooser button{
        display: inline-block;
        width: fit-content;
    }
    .slot-chooser button > img{
        height: 1.5rem;
        width: 1.5rem;
        padding: 0px 10px;
        vertical-align: middle;
        
        -webkit-transition: all 0.5s ease;
        transition: all 0.5s ease;
    }
    .slot-chooser button.opened > img{
        transform: rotate(0deg);
        
    }
    .slot-chooser button.closed > img{
        transform: rotate(180deg);
    }
    .slot-chooser .no-slots{
        text-align: left;
        width: 100%;
        margin-bottom: 5px;
        margin-top: 5px;
    }
       
    .slots{
        width: 100%;
        display: flex;
        grid-template-rows: 1fr;
        -webkit-transition: all 2s ease;
        transition: all 2s ease;
        overflow-y: hidden;
        overflow-x: scroll;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: flex-start;
    }
    .slots.closed{
        max-height: 0px;
    }
    .slots.opened{
        max-height: 150vh;   
    }
    .time-picker .timeslot{
        display: flex;
        align-items: center;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: center;
        justify-content: space-around;
        margin-left: 5px;
        margin-right: 5px;
    }

    .time-picker .timeslot:disabled{
        background-color: #b3b3b3;
        border-color: #b3b3b3;
    }
</style>
<style>
	#pdf-iframe canvas{
		position: inherit;
	}
</style>