<template>
    <div class="receipt">
        <div class="top-buttons">            
            <button class="return left-shadow" v-html="`Terug`" @click="emit('closeReceipt')"></button>
            <button class="download" v-html="`Download`" @click="generateReport()"></button>
            <!--<button class="return left-shadow" @click="state.openMenu = !state.openMenu">
                <div class="test">&#10247;</div>
            </button>
            <div class="menu" v-if="state.openMenu">
                <button class="download" v-html="`Download`" @click="generateReport()"></button>
            </div>-->
        </div>
        <div class="info">
            <div class="invoice-info num">
                <i v-html="formatDate(order.orderDate)"></i>
                <div class="invoice">
                    <b v-html="`Factuur`"></b>
                    <i v-html="order.invoice_number"></i>
                </div>
            </div>
            <div class="invoice-info total" v-if="picking != true">
                <p v-html="`Totale prijs`"></p>
                <b v-html="`&euro; ${order.finalPrice || (getTotalPrice(order.product_list, order).total).toFixed(2)}`"></b>
            </div>
            <div class="invoice-info total" v-if="picking == true">
                <p v-html="`Totale prijs`"></p>
                <b v-html="`&euro; ${order.picking_price}`"></b>
            </div>
            <div class="products" v-if="picking != true">
                <div class="product productheader" >
                    <div class="first">
                        <div class="title" v-html="`Product`"></div>
                    </div>
                    <div class="prijs excl" v-html="`excl. btw`"></div>
                    <div class="prijs incl" v-html="`incl. btw`"></div>
                </div>
                <div class="product-item" v-for="item in order.product_list" :key="item.id">
                    <Product
                        :item="item"
                        :picking="false"/>
                </div>
            </div>
            <div class="products" v-if="picking === true">
                <div class="product productheader" >
                    <div class="first">
                        <div class="title" v-html="`Product`"></div>
                    </div>
                    <div class="prijs excl" v-html="`excl. btw`"></div>
                    <div class="prijs incl" v-html="`incl. btw`"></div>
                </div>
                <div class="product-item">
                    <Product
                        :order="order"
                        :picking="true"
                    />
                </div>
            </div>
            <div class="total" v-if="picking === false" style="padding-bottom: 10px;">
                <div class="products" v-for="(value, key) in getTotalPrice(order.product_list, order).no_vat" :key="key">
                    <div style="
                    display: flex;
                    align-items: stretch;
                    flex-direction: row;
                    justify-content: space-evenly;
                    ">
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        padding: 12px;
                        border-right: unset;
                        text-align: left;
                        font-size: 14px;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:65%;
                        font-weight: bold;" colspan="5" class="total">Totaal BTW {{key}}%</div>
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        padding: 12px;
                        border-left: unset;
                        text-align: left;
                        font-size: 1.2rem;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:25%;
                        font-weight: bold;" class="total">&euro;{{value.vat.toFixed(2)}}</div>
                    </div>
                </div>
                <div class="products" v-for="(value, key) in getTotalPrice(order.product_list, order).no_vat" :key="key">
                    <div style="
                    display: flex;
                    align-items: stretch;
                    flex-direction: row;
                    justify-content: space-evenly;
                    ">
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        border-right: unset;
                        padding: 12px;
                        text-align: left;
                        font-size: 14px;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:65%;
                        font-weight: bold;" colspan="5" class="total">Totaal excl. BTW {{key}}%</div>
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        padding: 12px;
                        border-left: unset;
                        text-align: left;
                        font-size: 1.2rem;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:25%;
                        font-weight: bold;" class="total">&euro;{{value.price.toFixed(2)}}</div>
                    </div>
                </div>
                <div class="products">
                    <div style="
                    display: flex;
                    align-items: stretch;
                    flex-direction: row;
                    justify-content: space-evenly;
                    ">
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        border-right: unset;
                        padding: 12px;
                        text-align: left;
                        font-size: 14px;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:65%;
                        font-weight: bold;" colspan="5" class="total">Totale prijs</div>
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        padding: 12px;
                        border-left: unset;
                        text-align: left;
                        font-size: 1.2rem;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:25%;
                        font-weight: bold;" class="total" v-html="`&euro; ${order.finalPrice || (getTotalPrice(order.product_list, order).total).toFixed(2)}`"></div>
                    </div>
                </div>
            </div>
            <div class="total" v-if="picking === true" style="padding-bottom: 10px;">
                <div class="products">
                    <div style="
                    display: flex;
                    align-items: stretch;
                    flex-direction: row;
                    justify-content: space-evenly;
                    ">
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        padding: 12px;
                        border-right: unset;
                        text-align: left;
                        font-size: 14px;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:65%;
                        font-weight: bold;" colspan="5" class="total">Totaal BTW 21%</div>
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        padding: 12px;
                        border-left: unset;
                        text-align: left;
                        font-size: 1.2rem;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:25%;
                        font-weight: bold;" class="total">&euro;{{parseFloat(+order.picking_price - ( order.picking_price / (1 + (+21/100)))).toFixed(2)}}</div>
                    </div>
                </div>
                <div class="products">
                    <div style="
                    display: flex;
                    align-items: stretch;
                    flex-direction: row;
                    justify-content: space-evenly;
                    ">
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        border-right: unset;
                        padding: 12px;
                        text-align: left;
                        font-size: 14px;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:65%;
                        font-weight: bold;" colspan="5" class="total">Totaal excl. BTW 21%</div>
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        padding: 12px;
                        border-left: unset;
                        text-align: left;
                        font-size: 1.2rem;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:25%;
                        font-weight: bold;" class="total">&euro;{{parseFloat( order.picking_price / (1 + (+21/100))).toFixed(2)}}</div>
                    </div>
                </div>
                <div class="products">
                    <div style="
                    display: flex;
                    align-items: stretch;
                    flex-direction: row;
                    justify-content: space-evenly;
                    ">
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        border-right: unset;
                        padding: 12px;
                        text-align: left;
                        font-size: 14px;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:65%;
                        font-weight: bold;" colspan="5" class="total">Totale prijs</div>
                        <div style="border: 1px solid rgba(221, 221, 221, 1);
                        padding: 12px;
                        border-left: unset;
                        text-align: left;
                        font-size: 1.2rem;
                        color: rgba(85, 85, 85, 1); text-align: right;
                        width:25%;
                        font-weight: bold;" class="total" v-html="`&euro; ${parseFloat(order.picking_price).toFixed(2)}`"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-overlay" v-if="state.loading">
            <Loading />
        </div>
	</div>
</template>

<script setup>
import { reactive, defineProps, onMounted, defineEmits } from 'vue';


import { HTTP } from '../../assets/scripts/http-common';
import {DateTime} from 'luxon'
import Loading from '@/components/Basics/Loading.vue'
import Product from '@/components/AccountComponents/ReceiptProduct.vue'


const props = defineProps({
    'order': Object,
    'picking': Boolean
})

const state = reactive({
    loading: false,
    openMenu: false
})
        function generateReport() {
            state.loading = true
            var url = `order/receipt/${props.order.uuid_id}`
            if(props.picking === true){
                url += '?first=1'
            }
            HTTP.get(url,{
                responseType: "blob"
            })
            .then((response) => {
                const blob = new Blob(["\ufeff", response.data]);
                const url = URL.createObjectURL(blob);
                const downloadLink = document.createElement("a");
                downloadLink.href = url;
                downloadLink.download = `${props.order.invoice_number || props.order.uuid_id}.pdf`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                state.loading = false
                //window.open(URL.createObjectURL(response.data))
            })
        }
        
    function formatDate(date) {
        return  DateTime.fromISO(date).toFormat('dd/MM/yyyy')
    }


	

    

    

    

    

    onMounted(() => {
	})

    const emit = defineEmits(['closeReceipt'])

    const getTotalPrice = ((products, order) => {
    var total = {
        no_vat: {},
        total: 0.00,
        discount_total: 0.00
    }
    try {
        if(order.status == 'ordered'){
            products.forEach(element => {
                let price = element.normal_total_price || (element.price * element.amount)
                let disc_price = element.discounted_price || (element.price * element.amount)
                let quantity = element.amount
                let vat = element.product.btw
                let deposit = +element.product.statiegeld * element.amount

                if(quantity > 0){
                    total.total += +price + +deposit
                    if(vat in total.no_vat){
                        total.no_vat[vat].price = total.no_vat[vat].price + (+price / (1 + (+vat / 100)))
                        total.no_vat[vat].vat = total.no_vat[vat].vat + (+price - (+price / (1 + (+vat / 100))))
                    }
                    else{
                        total.no_vat[vat] = {}
                        total.no_vat[vat]['price'] = (+price / (1 + (+vat / 100)))
                        total.no_vat[vat]['vat'] = (+price - (+price / (1 + (+vat / 100))))
                    }
                    total.discount_total += +price - +disc_price
                }
            })
        }
        else{
            products.forEach(element => {
                if(element.picked > 0){
                    let price = element.normal_total_price || (element.price * element.picked)
                    let disc_price = element.discounted_price || (element.price * element.picked)
                    let quantity = element.picked
                    let vat = element.product.btw
                    let deposit = +element.product.statiegeld * element.picked
    
                    if(quantity > 0){
                        total.total += +price + +deposit
                        if(vat in total.no_vat){
                            total.no_vat[vat].price = total.no_vat[vat].price + (+price / (1 + (+vat / 100)))
                            total.no_vat[vat].vat = total.no_vat[vat].vat + (+price - (+price / (1 + (+vat / 100))))
                        }
                        else{
                            total.no_vat[vat] = {}
                            total.no_vat[vat].price = (+price / (1 + (+vat / 100)))
                            total.no_vat[vat].vat = (+price - (+price / (1 + (+vat / 100))))
                        }
                        total.discount_total += +price - +disc_price
                    }
                }
            })
        }
    } catch (error) { 
        console.log(error)
    }
    return total
})
</script>

<style scoped>
.info .receipt{
    width: 100%;
}

.info .invoice-info{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    font-size: 1.1rem;
    justify-content: space-between;
    border-top: 2px solid #cccccc;
    border-bottom: 2px solid #cccccc;
    width: 94%;
    margin-left: auto;
    margin-right: auto;
    padding-top: 3px;
    padding-bottom: 3px;

}
.info .invoice-info.num{
    border-top: 2px solid #cccccc;
    border-bottom: 2px solid #cccccc;
    width: 94%;
    margin-left: auto;
    margin-right: auto;
    padding-top: 3px;
    padding-bottom: 3px;    
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;

}
.invoice-info p{
    font-size: 0.9rem;
    font-weight: 600;
}
.info .invoice-info .invoice{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-end;
    flex-wrap: nowrap;
}
.invoice-info.total{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
}

.invoice-info.total p,
.invoice-info.total b{
    font-size: 1.2rem;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
}

.info .products{
    width: 94%;
    margin-left: auto;
    margin-right: auto;
}

.info .products .productheader{
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 25%);
    text-align: start;
    border-bottom: 1px solid #cdcdcd;
    background-color: #ebebeb;
    font-size: 1.1rem;
    font-weight: 500;
    padding-top: 5px;
    padding-bottom: 5px;
}
.productheader .first{
    grid-column: 1/3;
}
.productheader .amount{
    font-size: 0.8rem;
    font-style: italic;
}
.productheader .prijs.excl{
    grid-column: 3;
    text-align: end;
}
.productheader .prijs.incl{
    grid-column: 4;
    text-align: end;
}

.top-buttons{
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    margin-left: auto;
    margin-right: auto;
    width: 96%;
}
.download{
	border-color: #dbdbdb;
	background-color: #ffffff;
	border-width: 3px;
}

.test{
    transform: translateX(15%);
    font-size: 1.5rem;
}


    .top-buttons .menu{    
        position: absolute;
        border: 2px solid;
        padding: 20px;
        top: 5px;
        right: 3rem;
        background-color: #ffffff;
        box-shadow: -4px 4px 3px 0px #00000066;
        border-radius: 10px;
    }


</style>