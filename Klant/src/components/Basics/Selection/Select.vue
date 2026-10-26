

<script setup>
    import { reactive, onMounted, defineEmits, nextTick, ref } from 'vue'

    
    import $ from 'jquery'

    const props = defineProps({
        "options": Array,
        "current": [Object, String],
        "nothing": Object
	})

    onMounted(() =>{
        scrollToSelectedItem()
        updateItemClasses();
        handleScroll()
    })

    const state = reactive({
        publicPath: process.env.BASE_URL,
        openSelector: false
    })

    const emit = defineEmits(['updateSelected'])

    const selected = ref(null);

    const selectorBody = ref(null);
    const selectorList = ref(null);
const selectorItems = ref([]);

    const scrollToSelectedItem = () => {
    if (!selected.value) return;
    const selectedItem = selectorList.value.querySelector('.selected');
    if (!selectedItem) return;

    nextTick(() => {
        const containerHeight = selectorBody.value.offsetHeight;
        const itemTop = selectedItem.offsetTop;
        const itemHeight = selectedItem.offsetHeight;
        const scrollTop = itemTop - containerHeight / 2 + itemHeight / 2;

        selectorBody.value.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
           });
        });
    };



const handleScroll = () => {
    for (const key in props.options) {        
        getItemDistance(props.options[key], key)
    }
};




const getItemClass = (index) => {
    if(selectorBody.value){
        const containerHeight = selectorBody.value.offsetHeight;
        const scrollTop = selectorBody.value.scrollTop;
        const visibleTop = scrollTop;
        const visibleBottom = scrollTop + containerHeight;

        const itemTop = index * 40;
        const itemBottom = itemTop + 40;
        if (itemTop >= visibleTop && itemBottom <= visibleBottom) {
            return 'selected-visible';
        } else if (itemTop < visibleTop) {
        const distance = visibleTop - itemTop;
            return `above-visible distance-${Math.floor(distance / 40)}`;
        } else if (itemBottom > visibleBottom) {
        const distance = itemBottom - visibleBottom;
            return `below-visible distance-${Math.floor(distance / 40)}`;
        }
        return '';
    }
    return '';

};

const getItemDistance = (item, key) =>{
    const itemdiv = $(`#option-${key}`)[0]
    try {
        const containerHeight = selectorList.value.offsetHeight;
    const scrollTop = selectorList.value.scrollTop;
    
    
    const visibleMiddle = scrollTop + containerHeight/2;

    const itemTop = itemdiv.offsetTop;
    const itemDif = Math.abs(itemTop - visibleMiddle)

    const percentage = (itemDif / visibleMiddle) * 100;
    const startValue = 60
    const decimalPercentage = percentage / 100;

    const decrementAmount = startValue * decimalPercentage;
    //var currentValue = startValue;
    if (decrementAmount < startValue) {
        //let currentValue = startValue  * decrementAmount;
        var angleInDegrees = 360 - Math.abs(decrementAmount);
        var transformedValue = `rotateX(${angleInDegrees}deg)`;

        document.getElementById(`option-${key}`).style.transform = transformedValue;
    }
    else{
        const element = itemdiv
        var transformedValue1 = `rotateX(310deg)`;
        element.style.transform = `rotateX(${300})`;
        document.getElementById(`option-${key}`).style.transform = transformedValue1;
    }
    } catch (error) {
        console.log(error)
    }
    

}

const updateItemClasses = () => {
  selectorItems.value.forEach((item) => {
    const index = parseInt(item.dataset.index);
    item.className = `selector-item ${getItemClass(index)}`;
  });
};

function sanitizeText(item){
  if(item === '0'){
    return props.nothing?.label
  }
	return titleCase(item.replaceAll('_', ' '))
}

function titleCase(str) {
   var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       // You do not need to check if i is larger than splitStr length, as your for does that for you
       // Assign it back to the array
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   // Directly return the joined string
   return splitStr.join(' '); 
}
</script>
<template>
  <div class="select">

    <div class="selector-header" @click="state.openSelector = !state.openSelector">
        <p v-html="sanitizeText(current?.label || current || nothing?.label || '') "></p>        
    </div>
    <div class="modal-overlay" v-if="state.openSelector" @click="state.openSelector = false">
        <div class="selector-body" :class="{ 'visible': state.openSelector }" ref="selectorBody" >
            <div class="head-buttons">
                <button @click="state.openSelector = false">Sluiten</button>
            </div>
            <div class="overlist">
                <ul ref="selectorList" 
                    @scroll="handleScroll()">
                    <li>&nbsp;</li>
                    <li>&nbsp;</li>
                    <li>&nbsp;</li>
                    <li class="disabled">{{ nothing.label }}</li>
                    <li v-for="(item, index) in options" 
                        :key="index" :class="[{ 'selected': item === current }]" 
                        @click="emit('updateSelected', item); state.openSelector = false"
                        :id="`option-${index}`"
                        ref="selectorItem">
                    {{ sanitizeText(item.label || item) }}
                    </li>
                    <li>&nbsp;</li>
                    <li>&nbsp;</li>
                    <li>&nbsp;</li>
                </ul>
            </div>
        </div>
       <!-- <div 
            class="option" 
            v-for="item in options" 
            :key="item"
            @click="emit('updateSelected', item); state.openSelector = false"
        >{{item.label}}</div>-->
    </div>
  </div>
</template>
<style lang="scss" scoped>
    .select{    
        border: 2px solid #b6b6b6;
        height: calc(100% - 4px);
        padding-right: 5px;
        padding-left: 5px;
        border-radius: 5px;
    }
    .option-list{
        position: absolute;
        width: 80%;
        height: 80%;
        left: 10%;
        top: 10%;
        background: teal;
        z-index: 99999;
    }
    .option {
        width: 100%;
        white-space: normal;
        border-bottom: 1px solid white;
    }
    
.selector-header {
    text-align: left;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;    
    overflow-y: hidden;
    overflow-x: hidden;
  }
  .selector-header p{
    max-width: calc(100% - 1.1rem);
    overflow-x: hidden;
  }


  .selector-header::after,
.selector-header::before {
    content: "";
    display: block;
    box-sizing: border-box;
    position: absolute;
    width: 0.6rem;
    height: 0.6rem;
    border-bottom: 2px solid;
    border-right: 2px solid;
    transform: rotate(45deg);
    top: 20%;
    right: 0;
    pointer-events: none;
    right: 5px;
}
.selector-header::after {
    top: 40%;
}
  .modal-overlay{
    background-color: #aaaaaa49;
  }
  .modal-overlay .selector-body {
    height: 40%;
    overflow-y: hidden;
    transition: max-height 0.3s;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #f1f1f1;
    border-radius: 5px;
    padding: 10px;
    display: none;
    z-index: 9999;
    width: calc(100% - 24px);
    margin-left: auto;
    margin-right: auto;
    background-color: #b8b8b8;
  }
  
  .selector-body.visible {
    display: block;
  }

  .selector-body .head-buttons{
    height: 2rem;
    margin-top: -10px;
    width: 98%;
    display: flex;
    flex-direction: row-reverse;
  }
  .selector-body .head-buttons button{
    font-size: 1.1rem;
    margin: 0;
    margin-top: 0;
    margin-bottom: 0;
    padding: 2px;
    color: #ffffff;
  }
  .selector-body .overlist{
    background: rgb(124,124,124);
    background: -moz-linear-gradient(180deg, rgba(124,124,124,1) 0%, rgba(230,230,230,1) 10%, rgba(254,254,254,1) 50%, rgba(230,230,230,1) 90%, rgba(124,124,124,1) 100%);
    background: -webkit-linear-gradient(180deg, rgba(124,124,124,1) 0%, rgba(230,230,230,1) 10%, rgba(254,254,254,1) 50%, rgba(230,230,230,1) 90%, rgba(124,124,124,1) 100%);
    background: linear-gradient(180deg, rgba(124,124,124,1) 0%, rgba(230,230,230,1) 10%, rgba(254,254,254,1) 50%, rgba(230,230,230,1) 90%, rgba(124,124,124,1) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#7c7c7c",endColorstr="#7c7c7c",GradientType=1);
    width: 100%;
    height: calc(100% - 2rem);
  }
  .selector-body ul {
    list-style-type: none;
    padding: 0;
    margin-top: 0;
    margin-bottom: 0;
    height: 100%;
    overflow-y: scroll;
  }
  
  .selector-body li {
    cursor: pointer;
    width: 100%;
    white-space: normal;
    margin-left: auto;
    margin-right: auto;
    font-weight: 600;
  }
  .selector-body li.disabled{
    color: #a1a1a1;
  }
  
  .selector-body li:hover {
    background-color: #e1e1e1;
  }
  
  .selector-body li.selected {
    background-color: #a1a1a1;
    color: #fff;
  }
</style>