<script setup>
	import { reactive, onMounted } from 'vue'
	import Products from '@/components/Storesettings/Products.vue'
	import Departments from '@/components/Storesettings/Departments.vue'
	
	//import { useStore } from 'vuex'
   //const store = useStore()

    const state = reactive({
			params: 'products'
    })

    onMounted(() => {
    })

</script>
<template>
	<div class="assortiment">
        <div class="navigation">
            <button class="nav-item-tag" :class="state.params == 'products' ? 'active' : ''" @click="state.params='products'">Producten</button>
            <button class="nav-item-tag" :class="state.params == 'departments' ? 'active' : ''" @click="state.params='departments'">Afdelingen</button>
        </div>
        <div class="content" v-if="state.params !== null">
            <Products v-if="state.params=='products'" />
            <Departments v-if="state.params=='departments'" />
        </div>
    </div>
</template>
<style scoped>
.assortiment{
    overflow-y: scroll;
    width: 100%;
    overflow-x: hidden;
    display: grid;
    grid-template-rows: 3.5rem calc(100% - 3.5rem);
    height: 100%;
}
.navigation{
    grid-row: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: flex-start;
    align-content: space-around;
    width: 100%;
    margin-left: auto;
}

nav{   
	padding: 10px;
    width: 95%;
    height: 95%;
    display: flex;
	flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: flex-start;
    align-content: space-around;
}
.nav-item{
	width: 50%;
}
.nav-item-tag{
	color: white;
    font-weight: 600;
    font-size: 1.3rem;
    padding: 4px;
}
.nav-item-tag.active{
    background-color: green;
    border-color: green;
}
.nav-img{
	max-width: 50%;
	height: calc(100% - 2rem);
}

.content{
    grid-row: 2;
    height: 100%;
}

.content .back{
    position: absolute;
    left: 10px;
}

.content .back button{
    font-size: 1.2rem;
    padding: 3px;
}

@media screen and (orientation: landscape) {
		.nav-item{
		max-height: 40%;
		max-width: 25%;
	}
}

</style>
