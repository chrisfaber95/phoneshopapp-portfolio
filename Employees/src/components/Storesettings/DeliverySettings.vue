<template>
	<div class="delivery-screen">
        <!--<OrderSearch ref="ordersearch" @changeOrderDate="(callback) => state.orderDate = callback" />-->
        <h2 v-html="`Tijdsloten`"></h2>
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
                <div class="add-input">
                    Type:
                    <div class="inputs">

                        <label class="checkbox path grid-item third">
                            <input value="0" type="radio" v-model="state.new_timeslot.is_delivery" />
                            <svg viewBox="0 0 21 21">
                                <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                            </svg>
                        </label>
                            <label class="title" for="afhaal" v-html="`Afhaal`"></label>
                        
                            <label class="checkbox path grid-item third">
                                <input value="1" type="radio" v-model="state.new_timeslot.is_delivery" />
                                <svg viewBox="0 0 21 21">
                                    <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                                </svg>
                            </label>
                            
                            <label class="title" for="afhaal" v-html="`Bezorging`"></label>
                    </div>
                </div>
                <button v-html="`Toevoegen`" @click="addTimeslot()" />
            </div>
        </div>
        
        <b v-html="`Tijdsloten`"></b>
        <div class="slots">		
            <div class="slot-block">
                <div>Datum</div>
                <div>Starttijd</div>
                <div>Eindtijd</div>
                <div>Type</div>
            </div>
            <!--Weeknummer toevoegen-->
            <div class="slot-block" 
                v-for="(slot) in sortedTimeslots" 
                :key="slot.id+'slot'">
                <div>{{formatDate(slot.timeslot_date)}}</div>
                <div>{{formatTime(slot.timeslot_start)}}</div>
                <div>{{formatTime(slot.timeslot_end)}}</div>
                <div>{{slot.is_delivery ? "Bezorging" : "Afhaal"}}</div>
                <div @click="deleteTimeslot(slot)"><svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M17 5V4C17 2.89543 16.1046 2 15 2H9C7.89543 2 7 2.89543 7 4V5H4C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H5V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H17ZM15 4H9V5H15V4ZM17 7H7V18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18V7Z"
                        fill="currentColor"
                    />
                    <path d="M9 9H11V17H9V9Z" fill="currentColor" />
                    <path d="M13 9H15V17H13V9Z" fill="currentColor" />
                    </svg></div>
            </div>
        </div>
	</div>
</template>

<script setup>
// @ is an alias to /src
	import { reactive, onMounted, computed, createApp } from 'vue'
	import {HTTP_Store} from '@/assets/services/http-common.js';
    import VueSimpleAlert from 'vue3-simple-alert';
//	import OrderSearch from '@/components/CollectingScreen/OrderSearch.vue';
    import moment from 'moment';
    import {DateTime} from 'luxon'

const app = createApp({});
app.use(VueSimpleAlert);

	const state = reactive({
			timeslots: [],
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
	function getTimeslots() {
		HTTP_Store.get(`timeslot`, {})
		.then((response) => {
			console.log(response)
			state.timeslots = response.data
		})
		.catch((errors) => {
			console.log(errors)
		})
	}

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
    }

    function deleteTimeslot(slot){
        console.log(slot)
        var params = {
            'timeslot_id': slot.timeslot_id
        }
        HTTP_Store.delete(`timeslot`, {params: params})
		.then(() => {
			getTimeslots()
		})
		.catch((errors) => {
			console.log(errors)
		})
    }

    const sortedTimeslots = computed(() => {
			var allSlots
			allSlots = state.timeslots.filter(e => moment(new Date(e.timeslot_date).toISOString()) >= moment(new Date().toISOString()).add(-7, 'days'));
			switch (state.timeslot_sort) {
                case 'date':
                    if(state.timeslot_sort_type == 'asc'){
                        allSlots.sort(function (a, b) {
                            return moment(new Date(a.timeslot_date)) < moment(new Date(b.timeslot_date));
                        });
                    }
                    else{
                        allSlots.sort(function (a, b) {
                            return moment(new Date(b.timeslot_date)) > moment(new Date(a.timeslot_date));
                        });
                    }
                    break;            
                default:
                    break;
            }            
			//list = allOrders.slice(state.page * state.receiptAmount, (state.page * state.receiptAmount + state.receiptAmount))
			console.table(allSlots)
			return allSlots;
		})

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
        }
    onMounted(() => {
        getTimeslots()
    })
</script>
<style scoped>
.delivery-screen{
	width: 100%;
	overflow: scroll;
}
.timeslot-add{
    border-bottom: 2px solid #777777;
    box-shadow: 0 4px 2px 0px #CCCCCC;
    margin-bottom: 10px;
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
    align-items: center;
    font-weight: 600;
    margin-left: 10px;
    display: grid;
    grid-template-columns: 20% 80%;
    justify-items: start;
    width: 95%;
}
.add-input input{
    max-width: 70%;
    font-size: 1.2rem;
    line-height: 1.5rem;
    margin-left: 20px;
}
.add-input input[type=radio]:checked{
  background-color: black;
}

.add-input input[type=radio]{    
  width: 25px;
  height: 25px;
  width: fit-content;
  margin: 15px 5px 15px 5px;
}
.add-input .timepicker {
    min-height: 2rem;
  }

  .inputs{
    width: 80%;
    display: grid;
    grid-template-columns: 50px 1fr;
    grid-auto-rows: 1fr 1fr;
    justify-items: start;
    justify-content: start;
    margin-left: 20px;
  }

  .inputs .checkbox svg{    
    border: 2px solid #ff0000;
    border-radius: 10px;
  }
  .inputs .checkbox svg{    
    border: 2px solid var(--base-color);
    border-radius: 10px;
  }

  .inputs .title{
    margin-top: 10px;
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
    width: 100%;
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
