<script setup>
    import { reactive, onMounted, computed, watch } from 'vue'
    import {HTTP} from '@/assets/services/http-common.js';
    import Charts from '@/components/Storesettings/Administratie/Charts.vue';
    import { VueDatePicker as Datepicker } from '@vuepic/vue-datepicker';
    import '@vuepic/vue-datepicker/dist/main.css';
    import { DateTime } from "luxon";

    const state = reactive({
		orders: [],
        actie_orders: [],
        currentTime: '',
        toolbar: [
            {id: 'today', label: 'Vandaag'},
            {id: 'yesterday', label: 'Gisteren'},
            {id: 'thisweek', label: 'Deze week'},
            {id: 'lastweek', label: 'Vorige week'},
            {id: 'thismonth', label: 'Deze maand'},
            {id: 'lastmonth', label: 'Vorige maand'},
            {id: 'year', label: 'Dit jaar'},
            {id: 'all', label: 'Alles'}
        ],
        selection: 'today',
        date: [],
        types:[
            {id:'normal', label: 'Normaal'},
            {id:'actie', label: 'Actie'},
            {id:'all', label: 'Alles'},
        ],
        type: 'normal'

	})

    function downloadData(arrData){
        arrData.forEach((obj)=>delete obj['cart']);
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += [
        Object.keys(arrData[0]).join(";"),
        ...arrData.map(item => Object.values(item).join(";"))
        ]
        .join("\n")
        .replace(/(^\[)|(\]$)/gm, "");
        const data = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", data);
        link.setAttribute("download", "export.csv");
        link.click();
        return false;
    }

    function getOrders() {
		HTTP.get(`order`)
		.then((response) => {
			state.orders = response.data
		})
		.catch((errors) => {
			console.log(errors)
		})
	}
    
    function getActieOrders() {
		HTTP.get(`actie_order`)
		.then((response) => {
			state.actie_orders = response.data
		})
		.catch((errors) => {
			console.log(errors)
		})
	}
    onMounted(() => {
		getOrders()
		getActieOrders()
        const endDate = new Date();
        const startDate = new Date(new Date().setDate(endDate.getDate() - 7));
        state.date = [startDate, endDate];
    })
    function dateIsBetween(start, end, current){
        var startDate = DateTime.fromISO(new Date(start).toISOString())
        var endDate = DateTime.fromISO(new Date(end).toISOString())
        var currentDate = DateTime.fromISO(new Date(current).toISOString())
        if (startDate.startOf("day") <= currentDate.startOf("day") && currentDate.startOf("day") <= endDate.endOf("day")) return true
        return false
    }
    const filteredOrders = computed(() => {
		var allOrders = []
        if(state.type == 'normal'){
            allOrders = state.orders.filter(e => e.status != "pending" && dateIsBetween(state.date[0], state.date[1], e.pickupDate));
        }        
        else if(state.type == 'actie'){
            allOrders = state.actie_orders.filter(e => e.status != "pending" && dateIsBetween(state.date[0], state.date[1], e.createdAt));
        }
		console.log(allOrders)
		return allOrders;
	})
    function formatDate(date){
            if(date){
                date = new Date(date).toLocaleDateString('nl-NL')
                return date.split('T')[0]
            }
            else return ''
        }
    
    function programDate(i){
        var currentDate = DateTime.fromISO(new Date().toISOString())
        
        switch (i) {
            case 'today':
                state.date[0] = currentDate.toISODate()
                state.date[1] = currentDate.toISODate()
                break;
            case 'yesterday':
                state.date[0] = currentDate.minus({day: 1}).startOf('day').toISODate()
                state.date[1] = currentDate.minus({day: 1}).endOf('day').toISODate()                    
                break;
            case 'thisweek':
                state.date[0] = currentDate.startOf('week').toISODate()
                state.date[1] = currentDate.endOf('week').toISODate()                    
                break;
            case 'lastweek':
                state.date[0] = currentDate.minus({week: 1}).startOf('week').toISODate()
                state.date[1] = currentDate.minus({week: 1}).endOf('week').toISODate()                    
                break;
            case 'thismonth':
                state.date[0] = currentDate.startOf('month').toISODate()
                state.date[1] = currentDate.endOf('month').toISODate()                    
                break;
            case 'lastmonth':
                state.date[0] = currentDate.minus({month: 1}).startOf('month').toISODate()
                state.date[1] = currentDate.minus({month: 1}).endOf('month').toISODate()                
                break;          
            case 'year':
                state.date[0] = currentDate.startOf('year').toISODate()
                state.date[1] = currentDate.toISODate()                  
                break;    
            case 'all':
                state.date[0] = currentDate.minus({year: 5}).startOf('year').toISODate()
                state.date[1] = currentDate.toISODate()                  
                break;
            default:
                break;
        }
    }
    
    watch(() => state.selection, () => {
		programDate(state.selection)
    }, {immediate: true, deep: true})
</script>
<template>
    <div class="administratie">
        <div class="screen">
            <div class="content">
                <div class="toolbar">
                    <div class="filter">
                        <div class="datepicker">
                            <div class="label" v-html="`Kies begin datum`"></div>
                            <Datepicker v-model="state.date[0]" autoApply format="dd/MM/yyyy"/>
                            <div class="label" v-html="`Kies eind datum`"></div>
                            <Datepicker v-model="state.date[1]" autoApply format="dd/MM/yyyy"/>
                        </div>		
                        <div class="programmed-dates">
                            <select v-model="state.selection">
                                <option v-for="item in state.toolbar" :value="item.id" :key="item.id">{{item.label}}</option>
                            </select>
                        </div>
                        <div class="programmed-type">
                            <select v-model="state.type">
                                <option v-for="item in state.types" :value="item.id" :key="item.id">{{item.label}}</option>
                            </select>
                        </div>
                    </div>                    
                    <div class="toolbar-item">
                        <button id="download" @click="downloadData(filteredOrders)">
                            Download
                        </button>
                    </div>
                </div>				
                <b v-html="`Bestellingen`"></b>
                <div class="slots">		
                    <div class="slot-block">
                        <div>Id</div>
                        <div>Bestel Datum</div>
                        <div>Bedrag</div>
                        <div>Status</div>
                        <div>Type</div>
                    </div>
                    <!--Weeknummer toevoegen-->
                    <div class="slot-block" 
                        v-for="(slot, index) in filteredOrders" 
                        :key="slot.uuid_id+'slot'">
                    <div v-html="slot.id || index"></div>
                    <div v-html="formatDate(slot.orderDate || slot.createdAt)"></div>
                    <div v-html="slot.finalPrice || slot.totalPrice"></div>
                    <div v-html="slot.status"></div>
                    <div v-html="slot.delivery ? 'Bezorging' : 'Afhaal'"></div>
                    <div><button @click="openOrder(slot)">Open</button></div>
                    </div>
                </div>
                <Charts :orders="filteredOrders" :date="state.date" />
            </div>
        </div>
	</div>
</template>
<style lang="scss" scoped>
.administratie{
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.screen{
	overflow-y:scroll;
	height: 94%;
}

.content{
	display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;
    flex-wrap: wrap;
}
.toolbar{
    width: 10%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: center;
    justify-content: center;
    align-items: flex-start;
}
.toolbar button{
	margin: 5px;
}
.toolbar button.active{
	color: white;
	background-color: var(--base-color);
}

.charts{
	max-height: 80vh;
	overflow-y: scroll;
	width: 80%;
}
.totalen{
	width: 80%;
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
    grid-template-columns: repeat(6, 1fr);
    white-space: pre-line;
    word-break: break-word;
    border-bottom: 2px solid #ececec;
}
.slot-block > div{
    display: inline-block;
    margin-top: auto;
    margin-bottom: auto;
}
@media only screen and (max-width: 1023px) {	
	.content{
		flex-direction: column;
	}
	.toolbar{
		width: 100%;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-items: center;
	}
	.charts{
		width: 95%;
		margin-left: auto;
		margin-right: auto;
	}
	.totalen{
		width: 100%;
	}
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