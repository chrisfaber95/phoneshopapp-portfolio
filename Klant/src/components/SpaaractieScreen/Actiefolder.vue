
<script setup>
import { defineProps, computed, onMounted, reactive, ref, watch} from 'vue'
import {HTTP} from '@/assets/scripts/http-common.js';
import $ from 'jquery'
import Stamp from '@/components/SpaaractieScreen/Stamp1.vue'
import Voucher from '@/components/SpaaractieScreen/Voucher.vue'
import QRCodeVue3 from "qrcode-vue3";
//import pdfjsLib from 'pdfjs-dist';
//import html2canvas from 'html2canvas';
import { useStore } from 'vuex'
const store = useStore()

const props = defineProps({
  'pageAmount': Number,
  'doublePage': Boolean,
  'actie': Object,
  'voucher': Boolean
})

const state = reactive({
    page: 0,
    actie: null,
    pdf: '',
    customerActie: null,
    customer_info: null,
})


onMounted(() => {
state.customerActie = store.getters['getCurrentActie']
        getCustomerInfo()
})
 
function flipPage(){
  if(state.page < book.value.children.length - 1){
    book.value.children[state.page].classList.add('transitioning');
    book.value.children[state.page].classList.add('flipped')
    state.page += 1
    book.value.children[state.page - 1].addEventListener('transitionend', () => {
      book.value.children[state.page - 1].classList.remove('transitioning');      
      if(state.page < book.value.children.length){
        book.value.children[state.page].classList.add('visible')
      }
    }, { once: true });
  }
}
function flipBackPage(){
    
  if(state.page > 0){
    book.value.children[state.page].classList.remove('visible')
    state.page -= 1
    if(state.page < book.value.children.length){
      book.value.children[state.page].classList.remove('flipped')
    }
  }
}

const book = ref();

const getZIndex = computed(() => {
  return (index) => {
    var page = $(`#page-${index}`)
    if(page.hasClass('flipped')){
      return index
    }
    if(page.hasClass('transitioning')){
      return props.pageAmount + 1 - index
    }
    else{
      return props.pageAmount + 1 - index
    }
  }

})
 function range(start, end) {
  return Array(end - start + 1).fill().map((_, idx) => start + idx);
}

function coinExchange(last){
    if(state.customer_info.storepoints < props.actie.point_for_stamp){
        alert("U heeft te weinig munten om in te leveren voor zegels")
    }
    else{
        if(confirm(`Wilt u ${props.actie.point_for_stamp} munten inwisselen voor 1 zegel? Dit kan niet terug gezet worden.`)){
            if(last){
                exchangePoints(1)
                if(state.stamp_amount + 1 % props.actie.amount_of_stamps == 0 ) state.pages += 1
            }
        }
    }
}

function exchangePoints(amount){
    const id = localStorage.getItem("user_id");
    const token = localStorage.getItem("access_token");

    const params = {
        info: {
        customer_id: id,
        accessToken: token,
        spaaractie_id: props.actie.spaaractie_id,
        storepoints: state.customer_info.storepoints,
        amount_exchange: amount
    }  ,
    where:{
        customer_has_spaaractie_id: state.customerActie.customer_has_spaaractie_id,
        customer_id: id,
        spaaractie_id: props.actie.spaaractie_id,
    } }
    HTTP.put("customer_spaaractie", {params})
    .then(() =>{        
            getCustomerInfo()
            getCustomerActies()
    })
}

        function getCustomerActies(){
        HTTP.get(`customer_spaaractie/${localStorage.getItem('user_id')}`)
        .then((response) => {
            for (let index = 0; index < response.data.length; index++) {
                if(props.actie.spaaractie_id == response.data[index].spaaractie_id){
                    state.customerActie = response.data[index]
                    store.commit('location/changeCurrentActie', state.customerActie)
                }
            }
           
        })
        .catch(() => {
        })
    }
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
        }

watch(() => store.getters['location/getCurrentActie'], (newVal, oldVal) => {
    state.customerActie = store.getters['location/getCurrentActie']
},{immidiate: true, deep: true})

const coin_amount = computed(() => {
    return state.customer_info?.storepoints || 0
})

</script>
<template>
  <div class="folder">
    <span class="icon-arrow_back" id="prev" @click="flipBackPage()">
        <svg
          id="Layer_1" 
          style="width:100%;"
          version="1.1" 
          viewBox="0 0 512 512" 
          color="#fff" 
          xml:space="preserve" 
          xmlns="http://www.w3.org/2000/svg" 
          xmlns:xlink="http://www.w3.org/1999/xlink"><polygon fill="#fff" points="250,60 100,400 400,400 "/></svg>
    </span>
    <div class="booklet">     
        <div class="book" ref="book">
        <div class="page visible" :id="`page-0`" :style="{'z-index': getZIndex(0), 'background-color': actie.maincolor}">
            <div class="front" :id="`page-0-front`" :style="{'background-color': actie.maincolor}">
                <div class="frontpage" 
                    :style="{ /*backgroundImage: `url('${actie.background_card} ')`,*/ 'background-color': actie.maincolor }"
                >
                    <div class="front-image">
                        <img :src="`${$imageHost}/${actie.front_imgurl}`" />
                    </div>
                </div>
            </div>
            <div class="back" :id="`page-0-back`">
            <p></p>
            </div>
        </div>
            <div class="page" 
            :id="`page-${page}`" 
            v-for="page in range(1, props.pageAmount-1)" 
            :key="`page-${page}`" 
            :style="{'z-index': getZIndex(page), 'background-color': actie.maincolor}" >
            <div class="front" :style="{'background-color': actie.maincolor}">
                <div class="stamps" v-if="voucher !== true" :style="{ 'grid-template-columns': `repeat(${actie?.amount_of_stamps > 5 ? 5 : actie?.amount_of_stamps}, ${actie?.amount_of_stamps > 5 ? '18%' : ((100 / actie.amount_of_stamps) - 2) + '%'})`}">
                    <Stamp 
                      :actie="actie" 
                      :stamp_number="(actie.amount_of_stamps * (page - 1)) + stamp" 
                      :stamp="(actie.amount_of_stamps * (page - 1)) + stamp <= state.customerActie?.stamp_amount ? true : false" 
                      v-for="stamp in actie.amount_of_stamps" 
                      :key="stamp * page + 1"
                      :last="((actie.amount_of_stamps * (page - 1)) + stamp == state.customerActie?.stamp_amount + 1) && coin_amount >= actie.point_for_stamp ? true : false" 
                      @click="((actie.amount_of_stamps * (page - 1)) + stamp == state.customerActie?.stamp_amount + 1) && coin_amount >= actie.point_for_stamp ? coinExchange((actie.amount_of_stamps * (page - 1)) + stamp == state.customerActie?.stamp_amount + 1) : ''"
                    />
                </div>         
                <div class="stamps" v-if="voucher === true" :style="{ 'grid-template-columns': `repeat(${actie?.amount_of_stamps > 5 ? 5 : actie?.amount_of_stamps}, ${actie?.amount_of_stamps > 5 ? '18%' : ((100 / actie.amount_of_stamps) - 2) + '%'})`}">
                  
                  <Voucher 
                    :actie="actie" 
                    :custom="state.customerActie?.customer_has_spaaractie_id"
                    :stamp_number="(actie.amount_of_stamps * (page - 1)) + stamp" 
                    :stamp="(actie.amount_of_stamps * (page - 1)) + stamp <= state.customerActie?.stamp_amount ? true : false" 
                    v-for="stamp in actie.amount_of_stamps" 
                    :key="stamp * page + 1"
                    :last="((actie.amount_of_stamps * (page - 1)) + stamp == state.customerActie?.stamp_amount + 1) && coin_amount >= actie.point_for_stamp ? true : false" 
                    @click="((actie.amount_of_stamps * (page - 1)) + stamp == state.customerActie?.stamp_amount + 1) && coin_amount >= actie.point_for_stamp ? coinExchange((actie.amount_of_stamps * (page - 1)) + stamp == state.customerActie?.stamp_amount + 1) : ''"
                  />
                  <b class="voucher-page">Voucher {{(page)}} / {{state.customerActie?.stamp_amount}}</b>
              </div>

              <div class="full-stamps" v-if="(actie.physical == true) && (state.customerActie?.stamp_amount) >= (actie.amount_of_stamps * page)">
                <div class="information">
                    Scan deze QR-code bij een kassa medewerker om uw spaarzegels in te wisselen.
                </div>
                <div class="qrcode">
                    <QRCodeVue3
                        :width="200"
                        :height="200"
                        :value="`change||${state.customerActie.customer_has_spaaractie_id}`"
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
            </div>


            </div>
            <div class="back">
                <p>back page {{page}}</p>
            </div>
            </div>
        <div class="page" :id="`page-${props.pageAmount+1}`" :style="{'z-index': getZIndex(props.pageAmount+1), 'background-color': actie.maincolor}">
            
            <div class="front" :style="{'background-color': actie.maincolor}">
                <div 
                    class="stampfield backpage" 
                    :style="{ /*backgroundImage: `url('${actie.background_card} ')`,*/ 'background-color': actie.maincolor }"
                >
                    <div class="front-image">
                        <img :src="`${$imageHost}${actie.back_imgurl}`" />
                    </div>
                </div>
            </div>
            <div class="back">
                <p>back page {{props.pageAmount+1}}</p>
            </div>
        </div>
        </div>
    </div>    
    <span class="icon-arrow_forward" id="next" @click="flipPage()">
      <svg
          id="Layer_1" 
          style="width:100%;"
          version="1.1" 
          viewBox="0 0 512 512" 
          color="#fff" 
          xml:space="preserve" 
          xmlns="http://www.w3.org/2000/svg" 
          xmlns:xlink="http://www.w3.org/1999/xlink"><polygon fill="#fff" points="250,60 100,400 400,400 "/></svg>
   </span>
  </div>
</template>
<style lang="scss" scoped> 
.folder{
    width: 100%;
    height: 100%;
    position: relative;
    display: grid;
    grid-template-columns: 8% 84% 8%;
}
.booklet{        
  width: 100%;
  height: 100%;
  display: block;
  position: relative;
}

.book {
    width: 100%;
    height: 100%;
    perspective: 2000px;
    position: relative;
}
  
  .page {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    border: 1px solid black;
    box-sizing: border-box;
    transition: transform 2.2s ease, right 2.30s ease;
    transform: rotateY(0deg);
    /*transform-style: preserve-3d;*/
    background-color: white;
    right: 0;
    transform-origin: center left;
    z-index: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    box-shadow: 3px 5px 6px 4px #272727c7;
  }


  

.page .front{
  position: absolute;
  right:0 ;
  background: grey;
  height: 100%;
  width: 100%;
  backface-visibility: hidden;
}
.page .back{
  position: absolute;
  right:0 ;
  height: 100%;
  width: 100%;
  z-index: 99;
  background: grey;
  transform: rotateY(180deg);
  backface-visibility: hidden;
  display: none;
}


  .page.flipped{
    transform: rotateY(-180deg);
    z-index: 2;
    background: blue;
  }
  .page.flipped.transitioning{
    z-index: 90 !important;
  }

  

  .page.visible{
    z-index: 2;
  }
  .page.reversed{
    transform: translateX(-100%) rotateY(-180deg);
  }

  .page.even{
    right:0;
    //transform: translateX(-100%);
  }
  .page.odd{
    transform: rotateY(-180deg);
    right:0;
    //transform: translateX(-100%);
  }
  .page.odd.visible{    
    transform: translateX(-100%) rotateY(-360deg);
    right:0;
  }
  .page.even.visible{    
   // transform: rotateY(-180deg) translateX(-50%);
  }
  .page0{
    background: grey;
  }

  .folder span{
    position: relative;
    color:#fff;
    text-align: center;
    cursor: pointer;
    z-index: 11;
}
#prev{
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(253, 253, 253, 0.4);

}
#next{
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(253, 253, 253, 0.4);

}
#prev svg{
  width: 100%;
  right:10%;
    transform: rotate(-90deg);
}
#next svg{
  width: 100%;
  left:10%;
    transform: rotate(90deg);
}
#prev svg,
#next svg{
    width:100% !important;
    fill: #fff;
    color: #ffffff;
    position: absolute;
    top: calc(50% - 10px);
}
#prev polygon, #next polygon{
    fill: #fff;
}
#prev svg:hover,
#next svg:hover{
    background-color: rgba(0, 0, 0, 0.8);
}

  .stamps{
    position: relative;
    max-width: 100%;
    display: grid;
    grid-gap: 2%;
    margin-left: 1%;
    padding-bottom: 10px;
    padding-top: 10px;
    height: 95%;
}

.voucher-page{
  position: absolute;
    top: 10px;
    width: 100%;
    font-size: 1.6rem;
    color: #ffffff;
}
.frontpage{
    height: 100%;
}
.frontpage .front-image{
    height: inherit;
}
.frontpage .front-image img{
    height: 100%;
    width: auto;
    max-width: 100%;
    object-fit: contain;
}
.backpage{
    height: 100%;
}
.backpage .front-image{
    height: inherit;
}
.backpage .front-image img{
  height: max-content;
  width: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.full-stamps{
  width: 80%;
  height: fit-content;
  max-height: 60%;
  background-color: #ececec;
  border: 1px solid black;
  position: absolute;
  top: 20%;
  left: 10%;
}
.full-stamps img{
  max-height: 60%;
}
.full-stamps .information{
  color: black;
  font-size: 1.4rem;
  text-transform: none;
}
</style>