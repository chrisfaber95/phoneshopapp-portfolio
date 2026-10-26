<script setup>
    import { reactive, onMounted, computed} from 'vue';
import {HTTP} from '@/assets/scripts/http-common.js';
    import { DateTime } from "luxon";
    import Receipt from '@/components/AccountComponents/Receipt.vue'
    
    onMounted(() => {
		getOrders()
	})

    const state = reactive({
        orders: [],
        currentReceipt: null,
        isPicking: false
    })

    function getOrders(){
		let params
			params = {
                0: [{
                    filterType: 'or',
                    value: [
                        {
                            customer_id: localStorage.getItem('user_id')
                        },
                        {
                            '$order_information.customer_id$': localStorage.getItem('user_id') 
                        },
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
				state.orders = response.data
			})
			.catch(() => {
			})
	}
    const ordersByMonth = computed(()=>{
        var orders = state.orders
        orders.sort(function (left, right) {
            return DateTime.fromISO(left.orderDate).diff(DateTime.fromISO(right.orderDate))
        });
        var groupKey = 0;
        var groups = orders.reduce(function (r, o) {
            var m = `${DateTime.fromISO(o.orderDate).month}-${DateTime.fromISO(o.orderDate).year}`;
            (r[m])? r[m].data.push(o) : r[m] = {group: String(groupKey++), data: [o]};
            return r;
        }, {});
        const arrayReverseObj = (obj) => {
            let newArray = []

            Object.keys(obj)
                .sort()
                .reverse()
                .forEach(key => {
                newArray.push( {
                'key':key, 
                'value': obj[key]
                })
                })

            return newArray  
        }

        return arrayReverseObj(groups)
    })

    function formatTime(timestring){
        if(timestring){
            const date = new Date(timestring);
            const options = { hour12: false };
            const time = date.toLocaleTimeString('nl-NL', options);
            return time.split(':')[0] + ":" + time.split(':')[1]
        }
        else{
            return null
        }
        //return time
    }

    function formatDate(dateString){
        if(dateString){
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // Add 1 since getMonth() returns a zero-based index
            const day = date.getDate();
            return `${day}-${month}-${year}`;
        }
        else{
            return null
        }
    }
</script>
<template>
    <div class="bestellijst">
        <div class="header">
            <h2>Bestellingen</h2>
        </div>
    <div class="orderlist" v-for="orders in ordersByMonth" :key="orders.key">        
        <div class="order top">
            <div class="row">
                <div class="date">
                    {{orders.key}}
                </div>
                <div class="exbtw">
                    Excl. BTW
                </div>
                <div class="incbtw">
                    Incl. BTW
                </div>
                <div class="pdflink">
                </div>
            </div>
        </div>
        <div class="order" v-for="order in orders.value.data" :key="order.uuid_id">
            <div class="order-header">
                {{formatTime(order.orderDate)}}, {{formatDate(order.orderDate)}}
            </div>
            <div class="bestelling row">
                <div class="factuur" v-if="order.status != 'ordered' && order.invoice_number" v-html="`Factuur nr. ${order.invoice_number + 'b' || ''}`">
                </div>
                <div class="factuur" v-if="order.status == 'ordered'" v-html="`Proforma`">
                </div>
                <div class="date">
                    <div class="datetime">
                    </div>
                </div>
                <div class="exbtw">
                    &euro;{{order.finalPrice || order.totalPrice}}
                </div>
                <div class="incbtw">
                    &euro;{{order.finalPrice || order.totalPrice}}
                </div>
                <div class="pdflink">
                    <button @click="state.currentReceipt = order; state.isPicking = false">Open</button>
                </div>
            </div>
            <div class="picking row">
                <div class="factuur" v-if="order.status && order.invoice_number" v-html="`Factuur nr. ${order.invoice_number + 'a' || ''}`">
                </div>
                <div class="date">
                    {{ order.delivery ? 'Bezorging' : 'Verzamelen' }}
                    <!--<div class="datetime">
                     {{formatTime(order.orderDate)}}<br>{{formatDate(order.orderDate)}}
                    </div>-->
                </div>
                <div class="exbtw">
                    &euro;{{order.picking_price}}
                </div>
                <div class="incbtw">
                    &euro;{{order.picking_price}}
                </div>
                <div class="pdflink">
                    <button @click="state.currentReceipt = order; state.isPicking = true;">Open</button>
                </div>
            </div>
        </div>
    </div>
    <div class="no-orders" v-if="ordersByMonth.length == 0"><h1>Geen facturen beschikbaar</h1></div>
    <div class="modal-overlay" v-if="state.currentReceipt">
        <div class="receipt-screen">
            <Receipt :order="state.currentReceipt" :picking="state.isPicking" 
            @closeReceipt="(callback) => {state.currentReceipt = null}"/>
        </div>
    </div>
</div>
</template>
<style scoped>
.bestellijst{
    overflow-y: scroll;
    overflow-x: hidden;
}

.header h2{
    text-align: left;
    padding-left: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
}
.orderlist{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    align-content: flex-start;
    justify-content: flex-start;
    width: 96%;
    margin-left: auto;
    margin-right: auto;
    padding-top: 5px;
    padding-bottom: 5px;
}
.orderlist span{
    font-size: 1.3rem;
    font-weight: 700;
    margin: 10px 0px;
}
.order{
    width: 100%;
}
.order .order-header{
    text-align: left;
    padding-top: 15px;
    padding-bottom: 2px;
    font-size: 1.3rem;
    font-weight: 400;
    background-color: #4d4d4d;
    color: #ffffff;
    padding-left: 5px;
    width: calc(100% - 5px);
}
.order .row{
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    width: 100%;
    font-weight: 600;
    padding-bottom: 10px;
}
.order.top{
    font-weight: 600;
    margin-left: auto;
    margin-right: auto;
    background-color: #ececec;
    padding-top: 15px;
    font-size: 1.2rem;
    text-align: center;
}

.order .factuur{
    color: #1100ff;
}
.order.top .pdflink{
    color: black;
}
.order div{
    display: inline-block;
    text-align: end;
    color: black;
    width: 100%;
}
.order > *{
    border-bottom: 2px solid #888888;
}
.order .row .date{
    grid-column: 1/3;
    text-align: start;
}
.order .row .datetime{
    text-align: start;
}
.order .row .factuur{
    padding-top: 8px;
    text-align: start;
    word-break: break-all;
    padding-bottom: 5px;
    grid-column: 1/9;
}
.order .row .exbtw{
    grid-column: 3/5;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;    
    overflow: hidden;
    width: 95%;
    text-align: center;

}.order .row .incbtw{
    grid-column: 5/7;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    width: 95%;
    text-align: center;
}
.order .row .pdflink{
    grid-column: 7/9;
   /* color: red;*/
    text-align: center;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
}
/*.order .row .pdflink button{
    color: #ffffff;
    background-color: #ff0000;
    font-size: 1.2rem;
    padding: 2px;
    margin: 0;
    border-color: #ff0000;
}*/
.order .row .pdflink button{
    font-size: 1.2rem;
    padding: 2px;
    margin: 0;
}
.receipt-screen{
    overflow-y: scroll;
}
</style>