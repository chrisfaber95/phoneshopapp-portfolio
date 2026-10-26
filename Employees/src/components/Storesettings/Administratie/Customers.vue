<template>
	<div class="delivery-screen">
        <!--<OrderSearch ref="ordersearch" @changeOrderDate="(callback) => state.orderDate = callback" />-->
       <!-- <h2 v-html="`Tijdsloten`"></h2>
        <div class="timeslot-add">
            <b v-html="`Tijdslot toevoegen`"></b>
            <div class="newslots">	
                <div class="add-input">Datum<input placeholder="yyyy-mm-dd" 
                    type="date" 
                    pattern="\d{4}-\d{2}-\d{2}" 
                    class="datepicker" 
                    name="timeslot_date" v-model="state.new_timeslot.timeslot_date"/></div>
                <div class="add-input">Vanaf<input placeholder="--:--" 
                    type="time" 
                    pattern="\d{2}:\d{2}:\d{2}" 
                    class="timepicker" 
                    name="timeslot_start" v-model="state.new_timeslot.timeslot_start" /></div>
                <div class="add-input">Tot<input placeholder="--:--" 
                    type="time" 
                    pattern="\d{2}:\d{2}:\d{2}" 
                    class="timepicker" 
                    name="timeslot_end" v-model="state.new_timeslot.timeslot_end" /></div>
                <div class="add-input">Type:
                    <input type='radio' 
                        value="0"
                        id="isnotdelivery"
                        name="afhaal"
                        v-model="state.new_timeslot.is_delivery" />
                        <label for="afhaal" v-html="`Afhaal`"></label>
                    <input type='radio' 
                        value="1"
                        id="isdelivery"
                        name="bezorging"
                        v-model="state.new_timeslot.is_delivery" />
                        <label for="afhaal" v-html="`Bezorging`"></label>
                </div>
                <button v-html="`Toevoegen`" @click="addTimeslot()" />
            </div>
        </div>
    -->
        <b v-html="`Klanten`"></b>
        <div class="slots">		
            <div class="slot-block">
                <div>Id</div>
                <div>Voornaam</div>
                <div>Achternaam</div>
                <div>Klantenkaart</div>
                <div>Updates</div>
            </div>
            <!--Weeknummer toevoegen-->
            <div class="slot-block" 
                v-for="(slot, index) in sortedTimeslots" 
                :key="slot.customer_id+'slot'">
               <div v-html="index"></div>
               <div v-html="slot.first_name"></div>
               <div v-html="getAbbreviatedSurname(slot.surname)"></div>
               <div v-html="slot.klantenkaart"></div>
               <div v-html="slot.updates"></div>
            </div>
        </div>
	</div>
</template>

<script setup>
// @ is an alias to /src
	import { reactive, onMounted, computed, createApp } from 'vue'
	import {HTTP} from '@/assets/services/http-common.js';
    import VueSimpleAlert from 'vue3-simple-alert';
//	import OrderSearch from '@/components/CollectingScreen/OrderSearch.vue';
  //  import moment from 'moment';
    import {DateTime} from 'luxon'

const app = createApp({});
app.use(VueSimpleAlert);

	const state = reactive({
			customers: [],
            zipcodes: [],
            timeslot_sort: 'date',
            timeslot_sort_type: 'asc',
            new_timeslot: {
                timeslot_date: DateTime.local().toFormat('yyyy-MM-dd'),
                timeslot_start: '',
                timeslot_end: '',
                is_delivery: 0
            }
		})
	function getCustomers() {
		HTTP.get(`customer/employee-all`, {})
		.then((response) => {
			state.customers = response.data
		})
		.catch((errors) => {
			console.log(errors)
		})
	}

    function getAbbreviatedSurname(surname) {
    // Common Dutch prefixes
    if(surname == null) return ''
    const dutchPrefixes = ["van", "de", "den", "der", "ter", "ten"];

    const nameParts = surname.toLowerCase().split(' ');

    if (nameParts.length > 1 && dutchPrefixes.includes(nameParts[0])) {
        const prefix = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');
        const abbreviatedLastName = prefix + " " + lastName[0].toUpperCase();
        return abbreviatedLastName;
    }

    return nameParts[0].toUpperCase()[0];
}
/*
    function validTimeslot(){
        var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(state.new_timeslot.timeslot_start);
        var isValid2 = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(state.new_timeslot.timeslot_end);
        if(!DateTime.fromFormat(state.new_timeslot.timeslot_date, 'yyyy-MM-dd').isValid) return 'Datum is ongeldig.'
        if(!isValid) return 'Begintijd is ongeldig.'
        if(!isValid2) return 'Eindtijd is ongeldig.'
        const time1 = DateTime.fromFormat(state.new_timeslot.timeslot_start, 'HH:mm');
        const time2 = DateTime.fromFormat(state.new_timeslot.timeslot_end, 'HH:mm');
        console.log(time1)
        console.log(time2)
        const diff = time2.diff(time1, 'seconds').toObject().seconds;

        if (diff > 0) {
            return true
        } else if (diff === 0) {
            return 'Tijden mogen niet hetzelfde zijn.'
        } else {
            return 'Begintijd mag niet later zijn dan eindtijd.'
        }
    }

    function addTimeslot(){
        const data = []
        const valid = validTimeslot()
        if(valid === true){
            data.push(state.new_timeslot)
            HTTP_Store.post(`timeslot`, data)
            .then(() => {
                getTimeslots()
            })
            .catch((errors) => {
                console.log(errors)
            })
        }
        else{
            app.$alert(
                `${valid}`,
                `Fout in tijden`,
                'warning',
                {                    
                    confirmButtonText: 'Ok',
                    confirmButtonColor: '#F58320',
                    cancelButtonColor: '#e4e4e4',
                    timer: 5000,
                }
            )
        }
    }*/
    const sortedTimeslots = computed(() => {
        return state.customers;
    })
/*
        function formatDate(date){
            if(date){
                date = new Date(date).toLocaleDateString()
                return date.split('T')[0]
            }
            else return ''
        }

        function formatTime(time){
            if(time){
                const formattedTime = DateTime.fromFormat(time, 'HH:mm:ss').toFormat('HH:mm');
                return formattedTime
            }
            else return ''
        }*/
    onMounted(() => {
        getCustomers()
    })
</script>
<style scoped>
.delivery-screen{
	width: 100%;
	overflow: scroll;
}

.newslots{
    display: flex;
    width: 100%;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-start;
}
.add-input{
    display: flex;
    width: 95%;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: center;
    align-items: center;
    justify-content: flex-start;
    font-weight: 600;
    margin-left: 10px;
}
.add-input input{
    max-width: 50%;
    font-size: 1.2rem;
    line-height: 1.5rem;
    margin-left: 20px;
}
.add-input input[type=radio]:checked{
  background-color: black;
}

.add-input input[type=radio]{    
  width: 20px;
  height: 20px;
  width: fit-content;
  margin: 15px 5px 15px 34px;
}
.add-input .timepicker {
    min-height: 2rem;
  }
.slots{
	width: 100%;
	overflow-x: scroll;
    display: flex;
    overflow-x: scroll;
    flex-direction: column;
    align-items: stretch;
    flex-wrap: wrap;
    align-content: center;
}
.slot-block{
    max-width: 100%;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    white-space: pre-line;
    word-break: break-word;
    border-bottom: 2px solid #ececec;
}
.slot-block > div{
    display: inline-block;
    margin-top: auto;
    margin-bottom: auto;
}
#header{
	background-color: orange;
	padding-top: 5px;
	height: 6%;	
   border-bottom: 2px solid rgba(0,0,0,0.6);
}
#header .row{
	height: 100%;
}

#header .row .col-8 {
	height: 100%;
}

#header .row .col-8 img{
	height: 100%;
}
#header .row .col-3 .logo{
	max-height: 100%;
}
#header .row .col-3{
	max-height: 100%;
}
#menu-btn center{
	height:100%;
}
	
#menu-btn center svg{
	height:100%;
	width: 100%;
}
.page{
	display: inline-flex;
	width: 100%;
}
.back{
	display: flex;
	width: 50%;
}
.next{
	display: flex;
	width: 50%;
	float: right;
}
.next .btn{
	margin-left: auto;
}
@media (max-width: 575px){
	.bonnen{
		width: 100%;
		display: flex;
		overflow-x: scroll;
	}
}
</style>
