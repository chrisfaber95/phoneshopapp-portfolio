
<script setup>
    import { computed } from 'vue'
import QRCodeVue3 from "qrcode-vue3";
    import { useStore } from 'vuex'
	const store = useStore()

    
  const klantenkaart = computed(() => {
      return store.getters['shopsettings/getUserinfo'].klantenkaart
		//return localStorage.getItem('klantenkaart')
	})


</script>
<template>
  <div class="kaart">
     <!-- <div class="klantenkaart">
          <div class="miep">
            <div class="logo">
              <img :src="`${state.publicPath}img/logo-supermarkt-coop.png`"/>
            </div>
          </div>
          <div class='barcode'>          
            <VueBarcode
              class="barcode-image"
              :value="klantenkaart" 
              :options="{}"
              tag="img">
              Show this if the rendering fails.
            </VueBarcode>
          </div>          
        </div>--><div class="kaas">
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
          fileExt="png"
          :download="false"
          class="qrcode"
          imgclass="img-qr"
          downloadButton="download"
          :downloadOptions="{ name: 'vqr', extension: 'png' }"
        />
        </div>         
        <span class="ctatext" v-html="`Laat ALTIJD uw QR-code bij de kassa door een MEDEWERKER scannen om zegels te ontvangen voor de spaaracties.`"></span>
        
        
  </div>
</template>
<style lang="scss" scoped>  
  .ctatext{
    font-size: 1.4rem;
    max-width: 96%;
  }  
  
  .kaart{
    width: 100%;
    height: 100%;
    color: #000000;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    align-content: center;
    justify-content: space-around;
    overflow-y: scroll;
    }
    .klantenkaart {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 0px 0px 10px 0px;
	border-radius: 1.25rem;
	border: 5px ;
  padding-top: 5px;
  height: 40%;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-content: stretch;
}

.klantenkaart .barcode .title{
  font-size: 1.5rem;
  font-weight: 600;
}

.miep {
	border: 0px;
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
	display: flex;
	width: 65%;
	flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: center;
  justify-content: space-evenly;
	background-color: var(--base-color);
  padding: 5px;
  height: 25%;
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
	width: 90%;
	border-radius: 2rem;
  border: 5px solid #000000;
  overflow: hidden;
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

.kaas {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 5px;
  flex-wrap: wrap;
  justify-content: space-around;
    justify-content: space-evenly;
  align-content: center;
}

.qrcode {
	margin-top: 5px;
	padding: 5px; 
	border: 5px #111111 solid;
	border-radius: 10px;
	max-width: 50%;
}

.munten {
	max-width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    height: 100%;
}

.munten .text {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: center;
    width: fit-content;
    font-size: 2rem;
    font-weight: 600;
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
</style>
<style>

.qrcode > div{
  height: 100%;
  width: 100%;
}

.qrcode img{
  height: 100%;
  width: 100%;
}
</style>