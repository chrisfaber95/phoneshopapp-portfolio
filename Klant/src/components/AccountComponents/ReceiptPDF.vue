<template>
	<div class="receipt">
        <div class="info" id="content">
            <div class="products">
                <div class="product productheader" style="width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 25%);
    text-align: start;
    border-bottom: 1px solid #cdcdcd;background-color: #ebebeb;
    font-size: 1.1rem;
    font-weight: 500;
    padding-top: 5px;
    padding-bottom: 5px;" >
                    <div class="first" style="grid-column: 1/3;">
                        <div class="title" v-html="`Product`"></div>
                    </div>
                    <div class="prijs excl" v-html="`excl. btw`"></div>
                    <div class="prijs incl" v-html="`incl. btw`"></div>
                </div>
                <div class="product" v-for="product in pickedItems" :key="product.id" style="width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 25%);
    text-align: start;
    border-bottom: 1px solid #cdcdcd;">
                    <div class="first" style="grid-column: 1/3;">
                        <div class="title" v-html="product.product.product_information.title"></div>
                        <div class="amount" v-html="`${product.picked}x ${product.price}`"></div>
                    </div>
                    <div class="prijs excl" style="grid-column: 3;" v-html="`&euro;${parseFloat(priceWithoutVat(product)).toFixed(2)}`"></div>
                    <div class="prijs incl" style="grid-column: 4;" v-html="`&euro;${product.price}`"></div>
                </div>
            </div>
        </div>
	</div>
</template>

<script setup>
import { reactive, defineProps, onMounted, computed } from 'vue';
import {HTTP} from '@/assets/scripts/http-common.js';



import * as pdf from 'html-pdf';


import { useRoute } from 'vue-router'

const route = useRoute()

defineProps({
});

const state = reactive({
    order: null
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
                ],
                2:[{
                    filterType: 'and',
                    value: [
                        {
                            uuid_id: route.params.id
                        }
                    ]}
                ]
			}
			HTTP.get(`order`, {params})
			.then((response) => {
				state.order = response.data[0]
                generateReport()
			})
			.catch(() => {
			})
	}


	

    function priceWithoutVat(item){
        return item.price / (1 + (item.product.btw/100))
    }

    const pickedItems = computed(() => {
        if(!state.order) return []
        return state.order.product_list.filter((item) => { return item.picked > 0 })
    })

    onMounted(() => {
        getOrders()
	})

    

        function generateReport() {
            //html2Pdf.value.generatePdf(state.htmlToPdfOptions)
            //html2canvas(document.querySelector("#pdfdownload")).then(canvas => {
           // const doc = new jsPDF()
         //        doc.html(canvas, () => {
          //          doc.save('Test.pdf');
           //     });
          //  });
          //  doc.fromHTML(html2Pdf.value.$el.innerHTML, 10, 10);
          //  doc.save("a4.pdf");

            //let pdfRef = html2Pdf.value;
          /*  const doc = new jsPDF({
                orientation: 'p',
                unit: 'px',
                format: 'a4',
                hotfixes: ['px_scaling'],
            });

            html2canvas(document, {
                width: doc.internal.pageSize.getWidth(),
                height: doc.internal.pageSize.getHeight()
            }).then((canvas) => {
                const img = canvas.toDataURL("image/png");

                doc.addImage(img, "PNG", 140, 10, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());
                doc.save("p&lstatement.pdf");
            })

            var specialElementHandlers = {
        '#editor': function (element,renderer) {
            return true;
        }
            }
            var doc = new jsPDF('p', 'pt', 'letter');
                doc.html(
                    $('#content')[0], {
                    'x': 15,
                    'y': 15,
                    'width': 200,
                    'elementHandlers': specialElementHandlers
                    }, 
                    function(){ doc.save('sample-file.pdf'); })

*/
                    var options = { format: 'Letter' };
        pdf.create(document.getElementById('content').outerHTML, options).toFile('./businesscard.pdf', function(err, res) {
            
        if (err) return ''
         // { filename: '/app/businesscard.pdf' }
         console.log(err)
        });
    }           
</script>

<style>
.receipt{
    width: 100%;
}
.receipt .products{
    width: 94%;
    margin-left: auto;
    margin-right: auto;
}
.receipt .productheader{
    background-color: #ebebeb;
    font-size: 1.1rem;
    font-weight: 500;
    padding-top: 5px;
    padding-bottom: 5px;
}
.receipt .product{
    width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 25%);
    text-align: start;
    border-bottom: 1px solid #cdcdcd;
}
.receipt .first{
    grid-column: 1/3;
}
.receipt .amount{
    font-size: 0.8rem;
    font-style: italic;
}
.receipt .prijs.excl{
    grid-column: 3;
    text-align: end;
}
.receipt .prijs.incl{
    grid-column: 4;
    text-align: end;
}
</style>