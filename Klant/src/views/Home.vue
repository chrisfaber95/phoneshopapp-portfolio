<template>
    <div class="home" :class="path == '/favorites' ? 'favorites' : ''" :key="path">
    <div class="shelf" :class="[shelfStyle != 0 ? 'combined-category' : '']">
        <Shelfunit  v-if="shelfStyle == 0"/>
        <ShelfOldStyle v-if="shelfStyle == 1"/>
        <ShelfPicnicStyle v-if="shelfStyle == 2"/>
    </div>
    <div class="bottom-shelf">
        <Departments  v-if="shelfStyle == 0 || shelfStyle == 1 || shelfStyle == 2"
            @goToProduct="(callback) => {}"/>
        <div class="shoppingcart">
            <Shoppingcart />
        </div>
    </div>
    <!--<NoAccess />-->
  </div>
</template>

<script setup>
import { reactive, onMounted, computed} from 'vue';
import Shoppingcart from '@/components/shopPage/ShoppingCart.vue'
import Shelfunit from '@/components/shopPage/ShelfUnit1.vue'
import ShelfOldStyle from '@/components/shopPage/ShelfOldStyle1.vue'
import ShelfPicnicStyle from '@/components/shopPage/ShelfPicnicStyle1.vue'
import Departments from '@/components/shopPage/Departments1.vue'
import router from '@/router';
import { useStore } from 'vuex'
import {HTTP} from '@/assets/scripts/http-common.js';
import auth from '@/assets/scripts/auth';
import {VueSimpleAlert as vAlert} from 'vue3-simple-alert'

const store = useStore()

onMounted(() =>{
  /*  if(store.getters['shopsettings/getShelfStyle'] != localStorage.getItem('shoptype')){
        store.commit('shopsettings/changeShelfStyle', localStorage.getItem('shoptype') || 0)
        store.commit('location/changeDepartment', 0)
    }*/
    if(router.currentRoute.value.query.return == 'payment'){
        vAlert.alert(
            `Bedankt voor uw bestelling bij Coop Lubbers Online. U krijgt spoedig een email over uw bestelling.`,
            ``,
            'info',
            {
                confirmButtonText: 'OK',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4',
                timer: 5000
            }
        ).then(()=>{
            const currentRoute = router.currentRoute.value
            const newRoute = {
                path: currentRoute.path,
                params: currentRoute.params,
                query: {}
            }
            router.replace(newRoute)
        })
    }
    getDepartments()
})

    const state = reactive({
        publicPath: process.env.BASE_URL,
        currentPage: router.currentRoute.value.path
    })
    
    const path = computed(() =>{
        return router.currentRoute.value.path
    })

    const shelfStyle = computed(() => { return store.getters['shopsettings/getShelfStyle']})

    const currentDepartment = computed(() => { return store.getters['location/getCurrentDepartment']})

    const availableDepartments = computed(() => { return store.getters['location/getAvailableDepartments']})

    function getDepartments(){
        const params = {
            'visible': 1
        }
        HTTP.get(`departments`, {params})
        .then((response) => {
            var departments = response.data
            if(!localStorage.getItem('user_id')) departments.shift()
            if(localStorage.getItem('dob')){
                if(!auth.isNotUnderaged()){
                    var deps = departments.filter(e => e.nix18 !== true)
                    departments = deps
                }
            }
            store.commit('location/changeAvailableDepartment', departments)
            if(shelfStyle.value == 0){
                if(currentDepartment.value == null){
                    store.commit('location/changeDepartment', departments[0])
                    if(store.getters['shopsettings/getLoggedIn']){
                        getFavoritesDep()
                    }
                    else{
                        store.commit('location/changeDepartment', departments[0])
                    }
                }
            }
            if(shelfStyle.value != 0){
                store.commit('location/changeDepartment', 0)
                if(currentDepartment.value == null){
                    store.commit('location/changeDepartment', 0)
                    if(store.getters['shopsettings/getLoggedIn'] && state.currentPage == '/favorites'){
                        store.commit('location/changeDepartment', departments[0])
                    }
                }
            }
            if(path.value == '/favorites'){
                store.commit('location/changeDepartment', departments[0])
            }
            if(shelfStyle.value == 0){
                if(!isObject(currentDepartment.value)){
                    store.commit('location/changeDepartment', departments[0])
                }
            }
        })
        .catch((e) => {
            console.log(e)
        })
    }


    function isObject(variable) {
        return Object.prototype.toString.call(variable) === '[object Object]';
    }


    function getFavoritesDep(){
		let params
		params = {
			stock: 1,
			customer_id: localStorage.getItem('user_id')
		}
		HTTP.get(`customer_favorites`, {params})
		.then((response) => {
			if(response.data.length < 15){
				store.commit('location/changeDepartment', availableDepartments.value[1])
			}
		})
		.catch((err) => {
			console.log(err)
		})
	}

</script>

<style scoped>
.shelf{
	height: 82%;
	overflow-y: hidden;
}

.shelf.combined-category{
	height: 82%;
}

.bottom-shelf .departmentList{
    width: calc(100% - 10px);
	overflow-y: hidden;
	display: inline-flex;
	white-space: nowrap;
	border-bottom: 2px solid #666666;
	border-top: 2px solid #666666;
	border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
	align-items: center;
    align-content: center;
    flex-wrap: nowrap;
    flex-direction: row;
    height: 90%;
    box-shadow: 3px 4px 3px 0px rgba(0,0,0,0.3);
}
.departments, .subDepartments{
	background-color: #3a3a3a;
    padding: 2px;
	margin: 0px 5px;
	display: inline-flex;
	color: #f6f6f6;
    font-weight: 700;
    border: 1px solid #ffffff;
	border-radius: 10px;	
    box-shadow: 4px 5px 4px 0px rgba(0,0,0,0.4);
}
.subDepartments{
display: block;
    max-width: 100%;
    white-space: normal;
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
    height: 18%;
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
    height: 65%;
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
        height: 87%;
    }

    .shelf.combined-category{
        height: 87%;
    }
    .bottom-shelf{
        height: 13%;
    }
}
</style>
