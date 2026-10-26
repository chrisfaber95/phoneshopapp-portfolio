<script setup>
    import { ref, reactive, onMounted, defineEmits, defineProps } from 'vue';
	import auth from '@/assets/services/auth'
	import pick from '@/assets/scripts/actie.js'
    import shoppingcart from '@/assets/icons/shopping-cart.svg'
    import basket from '@/assets/icons/shopping-basket-solid.svg'
    import rolcontainer from '@/assets/icons/rolcontainer.svg'
    import rolmandje from '@/assets/icons/rolmandje.svg'
	import { useStore } from 'vuex'
	const store = useStore()

    const props = defineProps({
		'order': Object
	})

    const state = reactive({
        pickingMethods:[
            {
                label: "Winkelmandje",
                icon: basket,
                id: "Winkelmandje"            
            }, {
                label: "Rolmandje",
                icon: rolmandje,
                id: "Rolmandje"            
            }, {
                label: "Rolcontainer",
                icon: rolcontainer,
                id: "Rolcontainer"            
            }, {
                label: "Boodschappenkar",
                icon: shoppingcart,
                id: "Boodschappenkar"            
            },
        ],
        chosenMethod:''
    })
     
    const pickingMethodTitle = ref('Kies methode')
    const pickedMethodWarning = ref('Let op! Vergeet niet de gebruikte tassen toe te voegen op de bon')
    
    const emit = defineEmits(['closePickingMethodChooser'])

    onMounted(() => {
        console.log(state.pickingMethods)
    })

    const changePickingMethod = ((method) => {
        var order = props.order
		order.pickingcrate = method
		order.picking_user = auth.getUserId()
        store.commit('picking/updateOrderInList', order)
        emit('closePickingMethodChooser')
        pick.updateOrder(order)        
    })

    
    </script>
<template>
    <div class="picking-methods">
        <div class="title" v-html="pickingMethodTitle"></div>
        <div class="method-list">
            <div class="method" v-for="item in state.pickingMethods" v-bind:key="item.id">
                <div class="label" v-html="item.label"></div>
                <button @click="changePickingMethod(item.id)">
                    <img :src=item.icon />
                </button>
            </div>
        </div>        
        <div class="warning" v-html="pickedMethodWarning"></div>
        <button class="btn" @click="emit('closePickingMethodChooser')" >Sluiten</button>
    </div>
</template>
<style lang="scss" scoped>
.picking-methods{
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: stretch;
    align-content: stretch;
    align-items: center;
}
.title{
font-size: 1.4rem;
}
.method-list{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    width: 100%;
    justify-content: space-around;
}
.method{
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    align-content: center;
    flex-wrap: wrap;
}
.method button{
    width: 100%;
    aspect-ratio: 1;
    max-width: 48%;
    padding: 0;
}
.method button img{
    width: 100%;
    height: 100%;
}
@media (orientation: landscape){
	.method-list{
		width: 100%;
		height: calc(100% - 8rem);
	}
    .method{
        max-width: 50%;
        max-height: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-content: space-around;
        flex-wrap: wrap;
    }
    .method button{
        max-width: 20%;
    }
}
</style>