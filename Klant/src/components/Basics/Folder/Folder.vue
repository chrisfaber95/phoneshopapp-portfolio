
<script setup>
import { defineProps, computed, onMounted, reactive, ref} from 'vue'
import $ from 'jquery'
//import pdfjsLib from 'pdfjs-dist';
//import html2canvas from 'html2canvas';

const props = defineProps({
  'pageAmount': Number,
  'doublePage': Boolean
})

const state = reactive({
    page: 0,
    actie: null,
    pdf: ''
})


onMounted(() => {
const book = document.querySelector('.book');
const flipButton = document.querySelector('.flip-button');

flipButton.addEventListener('click', () => {
  book.classList.toggle('flip');
});
})
 
function flipPage(){
  if(state.page <= book.value.children.length - 1){
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
  
//  if(book.value.children()){

 //   return false
 // }
 // return false
 function range(start, end) {
  return Array(end - start + 1).fill().map((_, idx) => start + idx);
}

/*async function getPDF(){
  const loadingTask = pdfjsLib.getDocument('path/to/pdf/file.pdf');
  const pdf = await loadingTask.promise;

  const pageNumber = 1;
  console.log(pdf)
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale: 1.0 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  await page.render(renderContext).promise;

  const pdfElement = document.createElement('div');
  pdfElement.appendChild(canvas);

  html2canvas(pdfElement).then(canvas => {
    const image = canvas.toDataURL('image/png');
  // Create an <img> element and set its src attribute to the base64-encoded image
    const img = $('<img>').attr('src', image);

    // Add the <img> element to the <div> with id="pag-0-front"
    $('#pag-0-front').append(img);
  });
}*/

</script>
<template>
  <div class="folder">
    <button class="flip-button" @click="flipPage()">Flip</button>
    <button class="flip-button" @click="flipBackPage()">Flip back</button>
    <button class="flip-button" @click="state.page = 0">Reset</button>
    {{ state.page }}
    <div class="book" ref="book">
      <div class="page visible" :id="`page-0`" :style="{'z-index': getZIndex(0)}">
        <div class="front" :id="`page-0-front`">
          <p>frontpage</p>
        </div>
        <div class="back" :id="`page-0-back`">
          <p>back frontpage</p>
        </div>
      </div>
        <div class="page" 
          :id="`page-${i}`" 
          v-for="i in range(1, props.pageAmount-1)" 
          :key="i" 
          :style="{'z-index': getZIndex(i)}" >
          <div class="front">
            <p>page {{i}}</p>
          </div>
          <div class="back">
            <p>back page {{i}}</p>
          </div>
        </div>
      <div class="page" :id="`page-${props.pageAmount+1}`" :style="{'z-index': getZIndex(props.pageAmount+1)}">
        <p>lastpage</p>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>  

.book {
    width: 800px;
    height: 400px;
    margin: 50px auto;
    perspective: 2000px;
    position: relative;
  }
  
  .page {
    width: 50%;
    height: 100%;
    position: absolute;
    top: 0;
    border: 1px solid black;
    box-sizing: border-box;
    transition: transform 0.9s ease, right 0.95s ease;
    transform: rotateY(0deg);
    transform-style: preserve-3d;
    background-color: white;
    right: 0;
    transform-origin: center left;
    z-index: 0;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
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
  /*.page1 {
    left: 0;
    z-index: 2;
  }
  
  .page2 {
    right: 0;
    z-index: 3;
  }
  
  .page3 {
    left: 0;
    transform: translateX(-100%);
    z-index: 3;
  }
  
  .page4 {
    right: 0;
    transform: translateX(100%);
    z-index: 2;
  }*/
  
  /*.flip-button {
  }
  
  .book.flip .page1 {
    transform: rotateY(-180deg) translateX(50%);
    z-index: 3;
  }
  
  .book.flip .page2 {
    transform: rotateY(-180deg) translateX(-50%);
    z-index: 2;
  }
  
  .book.flip .page3 {
    transform: rotateY(180deg) translateX(-50%);
    z-index: 2;
  }
  
  .book.flip .page4 {
    transform: rotateY(180deg) translateX(50%);
    z-index: 3;
  }*/
</style>
<style>
</style>