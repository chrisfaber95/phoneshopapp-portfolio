<script setup>
    import { reactive, defineProps} from 'vue'
    import DailyScanScreen from '@/components/KassascannerScreen/DailyScanScreen.vue'
	import auth from '@/assets/services/auth'
    import allicon from '@/assets/icons/everything.svg'

		const props = defineProps({
            'date': Date
        })

        const state = reactive({
            scanning: false,
            closing: false
        })
        
        function hide (){
            if(confirm("Weet u het zeker? Gegevens worden niet opgeslagen")){
                //state.scanning = false
                state.closing = true
            }
        }

</script>
<template>
    <div class="daily-scanner">		
		<div class="allscan" v-if="auth.isAdmin()">
            <button @click="state.scanning = true" >
                <img :src=allicon /><div v-html="`Alles`"></div>
            </button>	            
        </div>
        <div class="modal-overlay" v-if="state.scanning">
            <button class="close-button" @click="hide()" >X</button>
            <DailyScanScreen
                :date="props.date"
                :closing="state.closing"
                @closingmodal="(callback) => {state.scanning = callback; state.closing = false;}"
                />
        </div>
    </div>
</template>
<style scoped>
.close-button{
    position: absolute;
    right: 15px;
    top: 25px;
    z-index: 101;
    padding: 5px;
    margin: 0px 0;
}
.daily-scanner{
    display: flex;
    height: 75px;
    flex-direction: row;
    flex-wrap: wrap;
    align-content: center;
    justify-content: space-around;
    align-items: center;
    padding: 10px;
}

.allscan{
    height: 100%;
    width: max-content;
}

.allscan button{
    height: 100%;
    display: flex;
    padding: 5px;
    align-items: center;
    flex-wrap: wrap;
    flex-direction: row;
    justify-content: space-around;
}
.allscan img{
    height: 100%;
    width: auto;
}

@media (min-width: 481px){
}
@media (min-width: 768px){
}

/* 
  ##Device = Tablets, Ipads (landscape)
  ##Screen = B/w 768px to 1024px
*/

@media (min-width: 768px) and (orientation: landscape) {
}


/* 
  ##Device = Laptops, Desktops
  ##Screen = B/w 1025px to 1280px
*/

@media (min-width: 1025px) {
  
}


@media (min-width: 1281px) {
  
  
}
</style>