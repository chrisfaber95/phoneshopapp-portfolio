import { createApp } from 'vue';
import VueSimpleAlert from 'vue3-simple-alert';
import { HTTP } from '@/assets/services/http-common.js';
import store from '@/store';
const app = createApp({});
app.use(VueSimpleAlert);


    const checkMultiple = ( async (product) => {
        return new Promise((resolve) => {
            resolve({value: true})
            var msg = `<b>Dit product zit in de volgende tassen:</b> <br/>`
            //	msg += newLine;
            const or = store.getters['actie/getOrders']
            if(Object.keys(or).length < 2){
                resolve({value: true})
            }
            else{
                for (let key in or) {
                    let element = or[key]
                    let index = element.product_list.map(function(e) { return e.product_id; }).indexOf(product.product_id);
                    if(index > -1) msg += `Bestelling ${element.id}:   ${element.product_list[index].amount}x <br/>`			
                }

                msg += ` <br/>Vergeet niet deze toe te voegen aan de bovenstaande bestellingen<br/>`
                
                app.$fire(       
                    {
                        title: 'Meerdere bestellingen',
                        type: 'info',
                        html:msg,
                        confirmButtonText: 'Ok',
                        confirmButtonColor: '#F58320',
                        cancelButtonColor: '#e4e4e4',
                        timer: 10000,
                    }
                )
                .then((e) => {
                    console.log(e)
                    resolve(e)
                })
                .catch((e) => {
                    resolve(e)
                })   
                    
            }
        })
    })

    const cancelOrder = ((order) => {
        return new Promise((resolve) => {      
            app.$confirm(                    
                `Weet je zeker dat je bestelling  wilt annuleren?`,
                "Bestelling annuleren",
                'warning',
                {
                    confirmButtonText: 'Ja',
                    cancelButtonText: 'Nee',
                    confirmButtonColor: '#F58320',
                    cancelButtonColor: '#e4e4e4',
                    duration: 10000,
                }
            )
            .then((e) => {
                if(e === true){                
                    order.status = 'rejected'
                    store.commit('actie/updateOrderInList', order)
                    updateOrder(order)
                    resolve(e)
                }
            })
            .catch((e) => {
                resolve(e)
            })
        })
    })

    const updateOrder = ((order) => {
        var data = {
            type: "Update",
            order: order,
        }
        console.log(data)
        HTTP.put(`/actie_order/${order.actie_order_id}`, data)
        .then((response) =>{
            console.log(response)
        })
        .catch((errors) => {
            console.log(errors)
        })
    })

    const addProductToOrder = ((product, order) =>{
            let orderProduct = {
                amount: 1,
                discounted_price: null,
                order_id: order.id,
                picked: 0,
                product_id: product.id,
                reason_return: "0",
                returned: 0,
                price: product.price,
                stamps_cost: product.stamps_cost,
            }
            var data = {
                type: "Product",
                product: orderProduct,
                order: order
            }
		HTTP.put(`/actie_order/${order.actie_order_id}`, data)
		.then((response) =>{
            store.commit('actie/updateOrderInList', response.data)
		})
		.catch((errors) => {
			console.log(errors)
		})
    })

    const updateProductPicked = ((amount, product, order) => {
        if(amount <= product.picked){  
            app.$confirm(                    
                `Weet je zeker dat je ${product.product.product_information.title} ${product.picked - amount}x uit de tas wilt halen?`,
                "Product verwijderen",
                'warning',
                {
                    confirmButtonText: 'Ja',
                    cancelButtonText: 'Nee',
                    confirmButtonColor: '#F58320',
                    cancelButtonColor: '#e4e4e4',
                    duration: 10000,
                }
            )
            .then((e) => {
                if(e === true){     
                    console.log(order)
                    console.log(product)
                    let id = order.product_list.map(e => e.actie_order_has_product_id).indexOf(product.actie_order_has_product_id)
                    console.log(id)
                    order.product_list[id].picked = amount
                    store.commit('actie/updateOrderInList', order)
                    updateOrder(order)  
                }
            })
            .catch((e) => {
                console.log(e)
            })
        }
        else{
            let id = order.product_list.map(e => e.actie_order_has_product_id).indexOf(product.actie_order_has_product_id)
            order.product_list[id].picked = amount
            store.commit('actie/updateOrderInList', order)
            updateOrder(order)  
        }       
    })

    const finishedPicking = ((order) => {
        app.$confirm(                    
            `Is deze bestelling volledig verzameld?`,
            "Bestelling varzameld",
            'info',
            {
                confirmButtonText: 'Ja',
                cancelButtonText: 'Nee',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4',
                duration: 10000,
            }
        )
        .then((e) => {
            if(e === true){     
                order.status = "picked";
                order.pickingtime = new Date().toISOString()
                updateOrder(order)  
            }
        })
        .catch((e) => {
            console.log(e)
        })
    })


   export default {
       checkMultiple,
       updateOrder,
       cancelOrder,
       addProductToOrder,
       updateProductPicked,
       finishedPicking
   }