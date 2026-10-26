<template>
    <div class="home">
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
    <NoAccess />
  </div>
</template>

<script setup>
import NoAccess from '@/components/Basics/NoAccess.vue'
import { computed } from 'vue';
import Shoppingcart from '@/components/favoritesPage/ShoppingCart.vue'
import Shelfunit from '@/components/favoritesPage/ShelfUnit.vue'
import ShelfOldStyle from '@/components/favoritesPage/ShelfOldStyle.vue'
import ShelfPicnicStyle from '@/components/favoritesPage/ShelfPicnicStyle.vue'
import Departments from '@/components/shopPage/Departments1.vue'
	import { useStore } from 'vuex'


	const store = useStore()

    

const shelfStyle = computed(() => { return store.getters['shopsettings/getShelfStyle'] || 0})




</script>

<style scoped>    
.modal-overlay.temp{
    top: 0;
    background-color: #F58320;
    height: 95%;
    overflow: hidden;
    z-index: 10;
}
.modal-overlay.temp img{
    max-height: 85%;
}
.shelf{
height: 88%;
overflow-y: hidden;
}

.shelf.combined-category{
height: 88%;
}

.bottom-shelf .departmentList{
	width: 100%;
	overflow-x: scroll;
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
.departments span{
	font-size: 0.9rem;
	padding: 2px
}
.subdeplist{
	position: absolute;
    overflow-x: hidden;
    overflow-y: scroll;
    white-space: nowrap;
    border-bottom: 2px solid #666666;
    border-top: 2px solid #666666;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    bottom: 15%;
    background-color: var(--base-color);
    width: 50vw;
    max-height: 40vw;
    right: 5px;
    border-radius: 6px;
    border: 1px solid #cccccc;
    -webkit-box-shadow: 4px 5px 4px 0px rgba(0,0,0,0.4);
    box-shadow: 4px 5px 4px 0px rgba(0,0,0,0.4);
}
.selectedDep{
	background-color: var(--header-color);
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
</style>
