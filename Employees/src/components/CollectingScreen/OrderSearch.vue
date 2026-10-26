<script setup>
    import { VueDatePicker as Datepicker } from '@vuepic/vue-datepicker';
    import '@vuepic/vue-datepicker/dist/main.css'
    import { ref, reactive, onMounted, watch, defineEmits } from 'vue';

    const state = reactive({
        orderDate: new Date(),
        currentTime: {
            hours: '',
            minutes: ''
        }    
    })
     
    const datepickerLabel = ref('Datum')
    
    const emit = defineEmits(['changeOrderDate'])

    function addZero(i) {
        if (i < 10) {i = "0" + i}
        return i;
    }

    function getNow(){
        let today = new Date()
        state.currentTime.hours = today.getHours()
        state.currentTime.minutes = addZero(today.getMinutes())
    }

    onMounted(() => {
        getNow()
        setInterval(getNow, 60000)
    })

    watch(() => state.orderDate, (newVal) => {
        emit('changeOrderDate', newVal)
    },{immediate:true})

    
    </script>
<template>
    <div class="searchbar">
        <div class="date">
            <p v-html="datepickerLabel"></p>
                <Datepicker v-model="state.orderDate" format="dd/MM/yyyy"/>
            <h2 v-html="`${state.currentTime.hours}:${state.currentTime.minutes}`"></h2>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.searchbar{
	display: flex;
    flex-wrap: nowrap;
    justify-content: space-around;
    align-items: flex-end;
    padding: 10px;
}
.date{
	display: flex;
	flex-direction: column;
    align-items: center;
    align-content: space-around;
	min-width: 50%;
	font-weight: 700;
    font-size: 1.5rem;
}
.date > p,
.date > h2{
    margin: 0;
}
</style>
<style lang="scss">
.date input{
    font-size: 1.5rem;
}
.dp__theme_light {
  --dp-primary-color: var(--base-color);
  --dp-success-color: var(--base-color);
  --dp-success-color-disabled: var(--base-color-disabled);
}

.dp__menu{
    min-width: 320px;
    font-size: 1.2rem;
}
.dp__button[aria-label="Open time picker"]{
    display: none;
}
@media screen and (orientation: landscape) and (max-height: 539px){
    .dp__menu{
		top: 40px !important;
	}
    .dp__arrow_top {
        display: none;
    }
}
</style>