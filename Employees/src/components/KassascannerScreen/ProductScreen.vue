<script setup>
    import { reactive,defineProps ,onMounted, computed, watch, defineEmits, createApp} from 'vue'
    import VueBarcode from '@chenfengyuan/vue-barcode';
    import VueSimpleAlert from 'vue3-simple-alert';
import scanning from '@/assets/scripts/scanning.js';
    const app = createApp({});
    app.use(VueSimpleAlert);

		const props = defineProps({
            'order': Object,
            'closing': Boolean
        })
        const state = reactive({
            startingscreen: true,
            looping: false,
            currentitem: null,
            timer: 5,
            speed: 300,
            controlscreen: false,
            endscreen: false,
            rescanBarcode: '',
            finalprice: 0.00,
            winkelbon: ''
        })

        const everyItem = computed(() => {
            let list = []
            console.log(props.order)
            props.order.product_list.forEach(element => {
                for(var i = 0; i < element.picked; i++){
                    list.push(element)
                }
            });
            console.log(list)
            return list
        })

        async function sleep(ms){
			return new Promise(resolve => setTimeout(resolve, ms));
		}

        function loopWithDelay() {
            return new Promise(resolve =>{       
                const products_list = props.order.product_list
                var products = []
                products_list.forEach(element => {
                        for(var i = 0; i < element.picked; i++){
                            products.push(element)
                        }
                    });
                let currentIndex = 0;
                const loop = async () => {
                if (currentIndex < products.length) {
                    state.currentitem = products[currentIndex].product.ean;
                    currentIndex++;

                    await new Promise(resolve => setTimeout(resolve, state.speed));
                    state.currentitem = null;
                    await new Promise(resolve => setTimeout(resolve, state.speed));

                    loop();
                } else {
                    resolve();
                }
                };

                loop();
        });
        }

        async function startScanner(){
            state.looping = true
            for(let i = state.timer; i >= 0; i--){
                state.timer = i;
                await sleep(1000)
            }
            loopWithDelay().then(() => {
                if(state.looping){
                    var audio = new Audio(require('@/assets/finished.wav')); // path to file
                    audio.play();                    
                    state.looping = false
                    state.startingscreen = false
                    state.controlscreen = true
                }
            }) 
        }

        function updateOrder(){
            app.$confirm(
                `Klik op 'Doorgaan' als alle informatie correct is ingevoerd.`,
                '',
                'info',
                {
                    confirmButtonText: 'Doorgaan',
                    cancelButtonText: 'Terug',
                    confirmButtonColor: '#F58320',
                    cancelButtonColor: '#e4e4e4',
                    timer: 10000,
                }
            )
            .then((e)=>{
                if(e === true){
                    if(state.finalprice == null || state.finalprice == '0.00' || state.winkelbon == null || state.winkelbon == ""){
                        app.$alert(
                            `Voer de boninformatie in om verder te gaan.`,
                            '',
                            'warning',
                            {
                                confirmButtonText: 'Ok',
                                confirmButtonColor: '#F58320',
                                cancelButtonColor: '#e4e4e4',
                                timer: 10000,
                            }
                        )
                    }
                    else{
                        scanning.finishedScanning(props.order, state.finalprice, state.winkelbon)
                    }
                }
            })

          /*  if(confirm("Klik op OK als alle informatie correct is ingevoerd.")){
				if(state.finalprice == null || state.finalprice == '0.00' || state.winkelbon == null || state.winkelbon == ""){
					alert("Voer boninformatie in.")
				}
				else{
					var data = {
						type: "Update",
						order: props.order,
						items: state.orderproducts
					}
                    
					data.order.status = "scanned";
                    data.order.finalPrice = state.finalprice
                    data.order.winkelbon = state.winkelbon
                    data.order.scanningtime = new Date().toISOString()
                    data.order.scanning_user = localStorage.getItem('user_id')

					HTTP.put(`/order/${props.order.id}`, data)
					.then((response) =>{
						console.log(response)
						alert("Bestelling ingevoerd")
                        emits('closingmodal', false)
					})
					.catch((errors) => {
						alert("Er ging iets verkeerd, als de bestelling nog zichtbaar is, probeer opnieuw")
						console.log(errors)
					})
				}
			}*/
        }

        onMounted(() => {
            state.finalprice = props.order.totalPrice
            console.log(props.order)
        })

        const emits = defineEmits(['closingmodal'])

        watch(() => props.closing, (newVal) => {
            if(newVal == true) {
                state.startingscreen = true
                state.looping = false
                state.currentitem = null
                state.timer = 5
                state.controlscreen = false
                state.endscreen = false
                emits('closingmodal', false)
            }
        })
</script>
<template>
    <div class="product-screen">
        <div class="starting-overlay" v-if="state.startingscreen && state.timer >= 1">
            <button @click="startScanner()" :disabled="state.looping" v-html="state.looping ? state.timer  : 'Start scanner'"></button>
        </div>
        <div class="product-barcode" v-if="state.currentitem && state.startingscreen">
            <VueBarcode
                class="barcode"
                :value="state.currentitem" 
                :options="{}"
                tag="img">
                Show this if the rendering fails.
            </VueBarcode>
        </div>
        <div class="control-screen" v-if="state.controlscreen">
            <div class="top">
                <div v-html="`Aantal producten: ${everyItem.length}`"></div>
                <div class="done-rectangle" v-html="`Klaar`"></div>			
                <button @click="state.rescanscreen = true; state.controlscreen = false" v-html="`Opnieuw`"></button>
                <button @click="state.controlscreen = false; state.endscreen = true" v-html="`Verder`"></button>
            </div>
            <div class="klantenkaart" v-if="props.order.klantenkaart != '' || props.order.klantenkaart != null" style="display: none;">
                <div v-html="`Klantenkaart test`"></div>
                <VueBarcode
                    class="barcode"
                    :value="props.order.klantenkaart" 
                    :options="{}"
                    tag="img">
                    Show this if the rendering fails.
                </VueBarcode>
            </div>
        </div>
        <div class="rescanscreen"  v-if="state.rescanscreen">
            <div class="productlist">
                <div class="head" v-html="`Producten:`"></div>
                <div class="product" v-for="item in order.product_list" :key="item.ean">
                    <div class="title" v-html="`${item.product.product_information.title}`"></div>		
                    <div class="ean" v-html="`EAN: ${item.product.ean}`"></div>
                    <button @click="state.rescanBarcode = item.product.ean">Scannen</button>
                    <div class="modal-overlay" v-if="state.rescanBarcode == item.product.ean">                        
                        <div class="rescan-barcode">
                            <div class="title" v-html="`${item.product.product_information.title}`"></div>		
                            <div class="ean" v-html="`EAN: ${item.product.ean}`"></div>
                            <div class="amount" v-html="`Aantal:  ${item.picked} x`"></div>
                            <button class="btn" @click="state.rescanBarcode = ''">Sluiten</button>
                            <VueBarcode
                                class="barcode"
                                :value="item.product.ean" 
                                :options="{}"
                                tag="img">
                                Show this if the rendering fails.
                            </VueBarcode>
                        </div>
                    </div>
                    <hr />
                </div>
            </div>
            <div class="sidebuttons">
                <button @click="state.startingscreen = true; state.timer = 5; state.rescanscreen = false" v-html="`Opnieuw`"></button>
                <button @click="state.rescanscreen = false; state.endscreen = true" v-html="`Verder`"></button>
            </div>
        </div>
        <div class="endscreen" v-if="state.endscreen">
            <div v-html="`Bestelling: ${props.order.id}`"></div>
            <div v-html="`Aantal producten: ${everyItem.length}`"></div>
            <div class="orderdetails">					
                <div class="bonnr" v-if="props.order.status == 'picked'">
                    <label for="bonnummer">Kassabon nummer: </label>				
                    <input name="bonnummer" type="text" v-model="state.winkelbon" placeholder="Kassabon nr." inputmode="numeric" pattern="\d*" />
                </div>
                <div class="totalprice" v-if="props.order.status == 'picked'">
                    <label for="totaalprijs">Totaalprijs*:</label>			
                    <input name="totaalprijs" v-model="state.finalprice" placeholder="0.00"  type="number" step="0.01" min="0.00" inputmode="numeric" pattern="\d*" />
                    <div class="warning">*Waarschuwing: prijs wordt definitief naar klant berekend</div>
                </div>
            </div>
            <hr>
            <button v-if="props.order.status == 'picked'" @click="updateOrder();">Bestelling bon invoeren</button>
        </div>
    </div>
</template>
<style scoped>
.starting-overlay{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    align-content: center;
    flex-direction: column;
}
.starting-overlay button{
    font-size: 3rem;
    padding: 2rem;
}
.product-barcode{
    height: 100%;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    align-items: stretch;
    align-content: stretch;
    flex-wrap: wrap;
}
.product-barcode img{
    width: 100%;
    height: 40%;
}
.control-screen{
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    align-content: center;
    flex-wrap: wrap;
}
.control-screen .top{    
    padding-top: 20px;
    font-size: 1.5rem;
    font-weight: 600;
    width: 100%;
    height: 45%;
}
.control-screen .top button{
    margin: 15px;
}
.done-rectangle{
    width: 100%;
    height: 70%;
    background-color: #00ff0d;
    color: white;
    font-size: 4rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    font-weight: 600;
}

.klantenkaart{
    font-size: 1.1rem;
    font-weight: 600;
    width: 70%;
    height: 45%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: stretch;
    flex-wrap: wrap;
}
.klantenkaart img{
    max-height: 100%;
}
.rescanscreen{
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: stretch;
    justify-content: space-around;
    align-content: center;
}
.productlist{
    overflow-y: scroll;
    height: 85%;
    font-size: 2rem;
    font-weight: 600;
}
.productlist .product {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: stretch;
    justify-content: space-around;
    width: 100%;
    align-items: center;
    border-bottom: 2px solid #ececec;
    padding-top: 7px;
}
.product .title{
    width: 100%;
    font-size: 1.4rem;
    font-weight: 600;
}

.product .ean{
    color: #ff0000;
    width: 50%;
    font-size: 1.4rem;
    font-weight: 600;
}
.sidebuttons{
    width: 100%;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    align-items: center;
    flex-direction: row;
    align-content: center;
}

.rescan-barcode{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    align-content: center;
    font-size: 2rem;
    padding: 10px;
}
.rescan-barcode .title,
.rescan-barcode .ean,
.rescan-barcode .amount{
    font-size: 2rem;
    width: 70%;
}
.rescan-barcode button{
    font-size: 2rem;
    padding: 10px;
}
.endscreen{
    font-size: 1.7rem;
    font-weight: 600;
    padding: 15px;
}
.endscreen > div{
    padding-top: 15px;
}
.orderdetails{
    font-size: 1.4rem;
}
.bonnr,
.totalprice{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-content: center;
    align-items: flex-start;
    justify-content: flex-start;
}
.warning{
    color: #ff0000;
    font-size: 1.2rem;
}

.endscreen button{
    font-size: 2.5rem;
    padding: 20px;
}
</style>