import { createApp } from 'vue';
import VueSimpleAlert from 'vue3-simple-alert';
import { HTTP } from '@/assets/services/http-common.js';
//import store from '@/store';
const app = createApp({});
app.use(VueSimpleAlert);

    const updateOrder = ((order) => {
        var data = {
            type: "Update",
            order: order,
        }
        HTTP.put(`/order/${order.id}`, data)
        .then((response) =>{
            console.log(response)
        })
        .catch((errors) => {
            console.log(errors)
        })
    })

    const finishedScanning = ((order, finalprice, winkelbon) => {  
        order.status = "scanned";
        order.finalPrice = finalprice
        order.winkelbon = winkelbon
        order.scanningtime = new Date().toISOString()
        order.scanning_user = localStorage.getItem('user_id')
        var data = {
            type: "Update",
            order: order,
        }
        HTTP.put(`/order/${order.id}`, data)
        .then((response) =>{
            if(!response.data.err){
                app.$alert(
                    `Bestelling ingevoerd.`,
                    '',
                    'info',
                    {
                        confirmButtonText: 'Ok',
                        confirmButtonColor: '#F58320',
                        cancelButtonColor: '#e4e4e4',
                        timer: 10000,
                    }
                )
            }
        })
        .catch((errors) => {
            console.log(errors)
        }) 

        
    })


   export default {
       updateOrder,
       finishedScanning
   }