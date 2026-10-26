import { createApp } from 'vue';
import VueSimpleAlert from 'vue3-simple-alert';
import { HTTP } from '@/assets/services/http-common.js';
//import store from '@/store';
const app = createApp({});
app.use(VueSimpleAlert);

    function productIsEOL(product){
        return new Promise((resolve) => {    
            var string = product.end_of_life == 0 ? `${product.product_information.title} is niet te koop in deze winkel?` : `${product.product_information.title} is opnieuw beschikbaar in deze winkel?`
            app.$confirm(
                string,
                "Product end of life",
                'warning',
            {
                confirmButtonText: 'Ja',
                cancelButtonText: 'Nee',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4',
                duration: 10000,
            })
            .then((e)=>{
                if(e === true){
                    product.end_of_life = product.end_of_life == 0 ? 1 : 0
                    HTTP.put(`product`, {product: product})
                    .then(() =>{
                        resolve(product)
                    })
                    .catch((errors) => {
                        console.log(errors)
                    })
                }
                else{
                    resolve(e)
                }
            })
            .catch((e)=>{
                resolve(e)
            })
        })
	}
	
	function productOutOfStock(product){
        return new Promise((resolve) => {    
            var string = (product.stock == 0) ? `${product.product_information.title} is voorradig?` : `${product.product_information.title} is niet op voorraad?`;
		
           app.$confirm(
                string,
                "Productvoorraad",
                'warning',
            {
                confirmButtonText: 'Ja',
                cancelButtonText: 'Nee',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4',
                duration: 10000,
            })
            .then((e)=>{
                if(e === true){
                    if(product.end_of_life == 1 && product.stock == 0){
                        product.end_of_life = 0
                    }
                    product.stock = (product.stock == 1) ? 0 : 1 ;

                    HTTP.put(`product`, {product: product})
                    .then(() =>{
                        resolve(product)
                    })
                    .catch((errors) => {
                        console.log(errors)
                    })
                }
                else{
                    resolve(e)
                }
            })
            .catch((e)=>{
                resolve(e)
            })
        })
	}

    
    const restockedProduct = ( async (product) => {
        return new Promise((resolve) => {      
            app.$confirm(
                `Is ${product.product_information.title} opnieuw voorradig?`,
                "Product bijgevuld?",
                'info',
            {
                confirmButtonText: 'Ja',
                cancelButtonText: 'Nee',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4',
                duration: 10000,
            })
            .then((e)=>{
                if(e === true){
                    product.stock = 1
                    HTTP.put(`product`, {product: product})
                    .then(() =>{
                        resolve(e)
                    })
                    .catch((errors) => {
                        console.log(errors)
                    })
                }
                else{
                    resolve(e)
                }
            })
            .catch((e)=>{
                resolve(e)
            })
        })
    })

   export default {
       productOutOfStock,
       productIsEOL,
       restockedProduct
   }