<template>
	<div class="time-picker">
        <div class="slot-chooser">
            <button :class="[state.morning ? 'opened' : 'closed']" @click="state.morning = !state.morning">Ochtend <img :src="require('@/assets/icons/angle-up-solid.svg')" /></button>
            
            <div class="slots" :class="[state.morning ? 'opened' : 'closed']">
                <button class="timeslot"  v-for="time in availableTimeslotsMorning" :key="`${time.hours}:${time.minutes}`" @click="emit('chooseTimeslot', time); state.pickedTime = time" :disabled="time?.amount > 25" :class="[{ active: time.hours == state.pickedTime.hours &&  time.minutes == state.pickedTime.minutes }]">
                    <div v-html="`${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`"></div>
                    <!--<div v-html="formatDate"> </div>-->
                </button>
            </div>
        </div>
        
        <div class="slot-chooser">
            <button :class="[state.afternoon ? 'opened' : 'closed']" @click="state.afternoon = !state.afternoon">Middag <img :src="require('@/assets/icons/angle-up-solid.svg')" /></button>
            
            <div class="slots" :class="[state.afternoon ? 'opened' : 'closed']">
                <button class="timeslot"  v-for="time in availableTimeslotsAfternoon" :key="`${time.hours}:${time.minutes}`" @click="emit('chooseTimeslot', time); state.pickedTime = time" :disabled="time?.amount > 25" :class="[{ active: time.hours == state.pickedTime.hours &&  time.minutes == state.pickedTime.minutes }]">
                    <div v-html="`${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`"></div>
                    <!--<div v-html="formatDate"> </div>-->
                </button>
            </div>
        </div>
        
        <div class="slot-chooser">
            <button :class="[state.evening ? 'opened' : 'closed']" @click="state.evening = !state.evening">Avond <img :src="require('@/assets/icons/angle-up-solid.svg')" /></button>
            
        <div class="slots" :class="[state.evening ? 'opened' : 'closed']">
            <button class="timeslot" v-for="time in availableTimeslotsEvening" :key="`${time.hours}:${time.minutes}`" @click="emit('chooseTimeslot', time); state.pickedTime = time" :disabled="time?.amount > 25" :class="[{ active: time.hours == state.pickedTime.hours &&  time.minutes == state.pickedTime.minutes }]">
                <div v-html="`${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`"></div>
                <!--<div v-html="formatDate"> </div>-->
            </button>
        </div>
        </div>
	</div>	
</template>

<script setup>
import { reactive, defineProps, computed, defineEmits} from 'vue';
    
const props = defineProps({
		'date': Date,
        'startPickupHour': Number,
		'endPickupHour': Number,
        'minuteGap': Number,
	})

	const state = reactive({        
        pickedTime: {hours: 0, minutes: 0},
        morning: false,
        afternoon: false,
        evening: false
	})

    const availableTimeslotsMorning = computed(() => {
        let timeslots = []
        for (let hour = props.startPickupHour; hour < props.endPickupHour; hour++) {
            if(hour == 12) break;
            for (let minute = 0; minute < 60; minute += props.minuteGap) {
                timeslots.push({'hours': hour, 'minutes': minute});                
            }            
        }
        return timeslots
    })
    
    const availableTimeslotsAfternoon = computed(() => {
        let timeslots = []
        for (let hour = 12; hour < props.endPickupHour ; hour++) {
            if(hour == 18) break;
            for (let minute = 0; minute < 60; minute += props.minuteGap) {
                timeslots.push({'hours': hour, 'minutes': minute});                
            }            
        }
        return timeslots
    })
    
    const availableTimeslotsEvening = computed(() => {
        let timeslots = []
        for (let hour = 18; hour < props.endPickupHour ; hour++) {
            for (let minute = 0; minute < 60; minute += props.minuteGap) {
                timeslots.push({'hours': hour, 'minutes': minute});                
            }            
        }
        return timeslots
    })

    

    const emit = defineEmits(['chooseTimeslot', 'closeTimeslot'])
</script>
<style scoped>
	.active{
        background-color: blanchedalmond;
    }
    .time-picker{
        overflow-y: scroll;
        max-height: 100%;
    }
    .slot-chooser{
        border-top: 1px solid #b3b3b3;
        width: 100%;
    }
    .slot-chooser button{
        display: inline-block;
    }
    .slot-chooser button > img{
        height: 1.5rem;
        width: min-content;
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
       
    .slots{
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        -webkit-transition: all 2s ease;
        transition: all 2s ease;
        max-height: 0px;
        overflow-y: hidden;
    }
    .slots.closed{
        max-height: 0px;
    }
    .slots.opened{
        max-height: 150vh;   
    }
    .time-picker .timeslot{
        width: 80%;
        display: flex;
        align-items: center;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: center;
        justify-content: space-around;
        margin-left: auto;
        margin-right: auto;
    }
</style>
<style>
	#pdf-iframe canvas{
		position: inherit;
	}
</style>