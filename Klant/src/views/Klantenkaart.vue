
<script setup>
    import { reactive, computed } from 'vue'
    import QRCodeVue3 from "qrcode-vue3";
import Tacpdf from '@/components/SpaaractieScreen/TAC.vue'
    
    import { useStore } from 'vuex'
	const store = useStore()
    const state = reactive({
      publicPath: process.env.BASE_URL,
      customer_info: null,
      tacopen: false
    })
        
    const klantenkaart = computed(() => {
      return store.getters['shopsettings/getUserinfo']?.klantenkaart || localStorage.getItem('klantenkaart')
      //return localStorage.getItem('klantenkaart')
    })

  const coin_amount = computed(() => {
      return store.getters['shopsettings/getUserinfo'].storepoints || 0
  })
/*
  onMounted(() => {
    getCustomerInfo()
	})

   function getCustomerInfo(){
            const id = localStorage.getItem("user_id");
            const token = localStorage.getItem("access_token");

            const params = {
                customer_id: id,
                accessToken: token
            }
            HTTP.get("customer", {params})
            .then(response => {
                state.customer_info = response.data[0]
            })
            .catch(() => {
            })
        }*/
</script>
<template>
  <div class="kaart">
      <div class="klantenkaart">
        <div class="kaart-design">
          <div class="top">
              <div class="logo"  >
                <img :src="`${state.publicPath}img/logo-supermarkt-coop.png`"/>
              </div>
          </div>
          <div class="content">            
            <div class="barcode">
              <QRCodeVue3
                :value="klantenkaart"
                :qrOptions="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }"
                :imageOptions="{ hideBackgroundDots: false, imageSize: 0.4, margin: 0 }"
                :dotsOptions="{
                  type: 'square',
                  color: '#000000',
                  gradient: {
                    type: 'linear',
                    rotation: 0,
                    colorStops: [
                      { offset: 0, color: '#000000' },
                      { offset: 1, color: '#000000' },
                    ],
                  },
                }"
                :backgroundOptions="{ color: '#ffffff' }"
                :cornersSquareOptions="{ type: 'square', color: '#000000' }"
                :cornersDotOptions="{ type: undefined, color: '#000000' }"
                fileExt="svg"
                :download="false"
                class="qrcode"
                imgclass="img-qr"
                :downloadOptions="{ name: 'vqr', extension: 'png' }"
              />
            </div>
            <div class="barcode-number">
              <p v-html="klantenkaart"></p>
            </div>
          </div>
        </div>   
        </div>
        <span class="ctatext" v-html="`Laat ALTIJD uw QR-code bij de kassa door een MEDEWERKER scannen om zegels te ontvangen voor de spaaracties`"></span>
        <div class="munten">
            <!--<img class="munt" :src="`img/coin_exchange.png`">-->
            <div class="text">
              <div @click="state.tacopen = true" v-html="`Spelregels`"></div>
              <div @click="state.tacopen = true">&#9432;</div>
            </div>  
            <div class="modal-overlay" v-if="state.tacopen">
              <div class="tac">
                  <Tacpdf
                      :pdfurl="`klantenkaart_tac.pdf`"
                      :pdfLength="4"
                  />
                  <button class="close-button" @click="state.tacopen = false" v-html="`Sluiten`"></button>
              </div>                
            </div>
              <div class="text">
                <div v-html="`Munten`"></div>
                <div v-html="`${coin_amount}`"></div>
              </div>
          </div>
        
  </div>
</template>
<style scoped>
  .info{
    font-size: 2.3rem;
    z-index: 10;
    position: relative;
    display: inline-block;
    text-align: center;
    width: 30%;
    color:rgb(0, 0, 0);
    font-weight: 600;
}
  .ctatext{
    font-size: 1.2rem;
    max-width: 96%;
    height: 20%;
    margin-left: auto;
    margin-right: auto;
  }  
    .kaart{
    width: 100%;
    height: 94%;
    color: #000000;
    display: grid;
    grid-template-rows: 50% 20% 20%;
    }

    .klantenkaart{
      max-width: 80%;
      padding-top: 10px;
      height: 90%;
      margin-left: auto;
      margin-right: auto;
      min-width: 50%;
      min-width: min-content;
    }

    .kaart-design{
      max-width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: 100%;
      grid-template-rows: 25% 75%;
    }
    .kaart-design .top{    
      width: calc(100% - 10px);
      background-color: var(--base-color);
      border-top-left-radius: 2rem;
      border-top-right-radius: 2rem;
      border: 5px solid var(--base-color);
      grid-row: 1;
    }
    .kaart-design .top .logo{
      width: 100%;
      height: 100%;
    }
    .kaart-design .top .logo img{
      width: auto;
      max-width: 100%;
      height: 100%;
    }

    .kaart-design .content{
      border: 5px solid #000000;
      border-top: unset;
      border-bottom-left-radius: 2rem;
      border-bottom-right-radius: 2rem;
      width: calc(100% - 10px);
      grid-row: 2;
      display: grid;
      grid-template-rows: calc(95% - 1rem) 1rem;
    }
    .kaart-design .content .barcode{
      max-width: 95%;
      padding: 4px;
      height: calc(100% - 2rem);
      margin-left: auto;
      margin-right: auto;
      aspect-ratio: 1;
    }
    .kaart-design .content .barcode-number{
      max-width: 100%;
      font-size: 1.2rem;
      font-weight: 500;
    }
    .kaart-design .content .barcode-number p{
      margin: 0;
    }
  /*  .klantenkaart {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0px 0px 10px 0px;
	border-radius: 1.25rem;
	border: 5px ;
  padding-top: 5px;
  max-height: 40%;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-content: stretch;
    max-width: 60%;
}*/

.klantenkaart .barcode .title{
  font-size: 1.5rem;
  font-weight: 600;
}
/*
.miep {
	border: 0px;
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
	display: flex;
	width: 100%;
	flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: space-evenly;
	background-color: var(--base-color);
  padding: 5px;
  height: 29%;
}

.logo{
  height: 100%;
}
.logo img{
    max-height: 100%;
    max-width: 100%;
    height: 100%;
    width: auto;
}
.barcode {
	width: 100%;
	border-radius: 0 0 2rem 2rem;
  border: 5px solid #000000;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  align-content: center;
  justify-content: flex-start;
  padding: 5px;
  padding-top: 8px;
  padding-bottom: 3px;
}

.barcode-image{
  height: 90%;
    width: 90%;
}
*/
.code{
  margin-top: 5px;
  margin-bottom: 5px;
}

.munten {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px;
  flex-wrap: wrap;
  justify-content: space-around;
  height: 20%;
  justify-content: space-evenly;
  align-content: center;
  width: 90%;
  font-size: 1.8rem;
  font-weight: 600;
  margin-left: auto;
  margin-right: auto;
}

.munten .munt{    
  width: 50%;
  height: auto;
}

.terug {
	display: flex;
	height: 100%;
}

.paginaeinde {
  width: 100%;
	display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
}

.modal-overlay .tac{
  position: fixed;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  width: 94%;
  height: 94%;
  border: 1px solid black;
  background-color: #ffffff;
  -webkit-box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
  box-shadow: 0 5px 5px 0 #00000099, 0 1px 10px 0 #00000099;
  z-index: 101;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  top: 10px;
  left: 3%;
  flex-direction: column;
  align-items: center;
  flex-wrap: nowrap;
padding-top: 10px;
}


@media only screen and (min-height: 500.98px) and (orientation: landscape) {
	.kaart{
		height: 92%;
	}
}
</style>
<style>
  .kaart-design .content .barcode .qrcode{
    height: 100%;
    max-height: 100%;
    padding: 4px;
    border: 5px solid #000000;
    aspect-ratio: 1;
  }
</style>