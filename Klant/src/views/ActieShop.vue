
<script setup>
	import { reactive, defineProps, onMounted, computed, onBeforeMount } from 'vue';
	import { useStore } from 'vuex'
	import Shoppingcart from '@/components/actieshopPage/ShoppingCart.vue'
    import ShelfPicnicStyle from '@/components/actieshopPage/ShelfPicnicStyle1.vue'
    import router from "../router"
	import {HTTP} from '@/assets/scripts/http-common.js';

	const store = useStore()

	

	defineProps({
	});

	const state = reactive({
		productList: [],
        acties: [],
        actie: null
	})

	
    onBeforeMount(() => {
        if(!router.currentRoute.value.params.actie) router.push('/spaaracties')
        getActies()

        //if(store.getters['location/getActie'] == null) router.push('/spaaracties')
    })

	onMounted(() => {
       // if(!actie.value) router.push('/spaaracties')
      //  if(!actie?.value?.title) router.push('/spaaracties')
	})

	
	
	

	

    

    

    const loggedIn = computed(() => {
		return store.getters['shopsettings/getLoggedIn']
	})

    


    function getActies(){
        HTTP.get(`spaaractie`)
        .then((response) => {
            state.acties = response.data
            state.actie = state.acties.find(x => x.slug === router.currentRoute.value.params.actie)
             if(state.actie){
                store.commit('location/changeActie', state.actie)
                if(loggedIn.value){
                    getCustomerActies() 
                }
            }
            else{
                router.push('/spaaracties')
            }
        })
        .catch(() => {
            console.log("Kon acties niet ophalen")
        })
    }

    function getCustomerActies(){
        HTTP.get(`customer_spaaractie/${localStorage.getItem('user_id')}`)
        .then((response) => {
            state.customer_actie = response.data.find(x => x.spaaractie_id === state.actie.spaaractie_id)
            if(state.customer_actie){
                store.commit('location/changeCurrentActie', state.customer_actie)
            }           
        })
        .catch(() => {
        })
    }
</script>

<template>
	<!--<div class="shop" >
        <div class="shelf">
            <div class="title" v-html="sanitizeText(actie?.title)">
            </div>
            <div class="shelfunit">
                <Product v-bind:actie="actie" 
                v-bind:product="item" 
                v-bind:actieproduct="getProductFromList(item.id)" 
                v-for="item in state.productList" v-bind:key="item.id" :id="`product-${item.id}`"/>
            </div> 
        </div>
        <div class="bottom-shelf">
            <div class="shoppingcart" v-if="loggedIn">
                <Shoppingcart />
            </div> 
        </div>  
	</div>	-->

    <div class="home">
        <div class="shelf" v-if="state.actie">
            <ShelfPicnicStyle 
                :actie="state.actie"
                :products="state.productList"/>
        </div>
        <div class="bottom-shelf" v-if="state.actie">
            <div class="shoppingcart">
                <Shoppingcart />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.shelf{
	height: 88%;
	overflow-y: hidden;
}
.shoppingcart{
	height: 12%;
    position: relative;
}
hr {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.bottom-shelf{
    width: 100%;
    height: 12%;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: stretch;
}
.bottom-shelf .departmentList{
    height: 35%;
}
.bottom-shelf .shoppingcart{
    height: 100%;
}




@media screen and (orientation: landscape) {
  .shelfList {
    height: unset;
  }
}

@media only screen and (min-height: 500.98px) and (orientation: landscape) {
    .shelf{
        height: 91%;
    }

    .shelf.combined-category{
        height: 91%;
    }
    .bottom-shelf{
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
        height: 9%;
        grid-gap: 5px;
    }
    .bottom-shelf .departmentList{
        grid-column: 1;
        height: 100%;
        
    border: 1px solid #111111;
    border-bottom: 0;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    border-bottom-left-radius: unset;
    border-bottom-right-radius: unset;
    padding-left: 5px;
    padding-right: 5px;
    
    width: calc(100% - 10px);
    }

    .bottom-shelf .shoppingcart{
        grid-column: 2;
        height: 100%;
    }
}
@media only screen and (min-width: 500.98px) and (orientation: portrait) {
    .shelf{
        height: 84%;
    }

    .shelf.combined-category{
        height: 84%;
    }
    .bottom-shelf{
        height: 16%;
    }
}
</style>