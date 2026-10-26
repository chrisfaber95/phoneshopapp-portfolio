<script setup>
    import { reactive, defineProps, computed, defineEmits, onMounted, watch} from 'vue';
    import auth from '@/assets/scripts/auth';
import { useStore } from 'vuex'
const store = useStore()

    const props = defineProps({
		"info": Object,
        "invoice": Boolean
	})

	const state = reactive({    
	userinfo: {
        default_information: '',
        default_invoice_information: ''
    },
    info: {},
    addInfoModal: false
	})

    const isStandard = computed(() => {
        if(state.userinfo.default_information == props.info.customer_information_id) return true
        return false
    })



    

    

    function isEqual(obj1, obj2) {
        const entries1 = Object.entries(obj1);
        const entries2 = Object.entries(obj2);

        if (entries1.length !== entries2.length) {
            return false;
        }

        for (let [key, value] of entries1) {
            if (!entries2.some(([k, v]) => k === key && v === value)) {
            return false;
            }
        }

        return true;
        }

    const emit = defineEmits(['updateDetails', 'setAsStandard', 'close', 'updateAddress', 'changeEditInfo'])

    

   watch(() => state.info, () => {
        if(!isEqual(state.info, props.info) && state.info?.customer_information_id){
            const index = state.userinfo.customer_information.findIndex(addr => addr.customer_information_id === state.info.customer_information_id);
            state.userinfo.customer_information[index] = state.info;
            store.commit('shopsettings/updateUserinfo', state.userinfo)
            auth.updateInfo()
        }
    }, {immediate: true, deep: true})

    watch(() => state.userinfo.default_information, (newVal, oldVal) => {
            if(newVal == state.info.customer_information_id){
                auth.updateInfo()
            }
    }, {deep: true})

	onMounted(() => {
	})

    watch(() => store.getters['shopsettings/getUserinfo'], (newVal, oldVal) => {
		state.userinfo = store.getters['shopsettings/getUserinfo']
	}, {immediate: true, deep: true})

    watch(() => props.info, (newVal, oldVal) => {
        state.info = props.info
	}, {immediate: true, deep: true})
    
</script>
<template>
    <div class="address">
        <div class="title">
            <b v-if="state.info.title != 'Anders'" v-html="`${state.info.title || ''} `"></b>
            <b v-if="state.info.title == 'Anders'" v-html="`${state.info.custom_label || ''} `"></b>
            <b class="standard" v-if="isStandard" v-html="`(Standaard afleveradres)`" style="font-weight: 600;"></b>
            
            <!--<div class="option" v-if="!isStandard">
                <label class="checkbox path buss">
                    <input type="radio" v-model="state.userinfo.default_information"  :value="state.info.customer_information_id" />
                    <svg viewBox="0 0 21 21">
                        <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                    </svg>
                </label>								
                <label class="container" v-html="`Maak standaard?`">
                </label>
            </div>
            <div class="option">
                <label class="checkbox path buss">
                    <input type="radio" v-model="state.userinfo.default_invoice_information"  :value="info.customer_information_id" />
                    <svg viewBox="0 0 21 21">
                        <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                    </svg>
                </label>								
                <label class="container">Standaard factuurinformatie
                </label>
            </div>-->
        </div>
        <div class="left">
            <p v-html="`${state.info.contactperson}`" v-if="state.info.business && invoice"></p>
            <p v-html="`${state.info.business}`"></p>
            <p v-html="`${state.info.phone}`"></p>
        </div>
        <div class="right">
            <p v-html="`${state.info.first_name} ${state.info.surname}`"></p>
            <p v-html="`${state.info.street} ${state.info.house_number} ${state.info.house_addition}`"></p>
            <p v-html="`${state.info.zipcode} ${state.info.city}`"></p>
        </div>
        <div class="left">
            <b class="edit-info delete" v-html="`Verwijderen`" @click="emit('changeEditInfo')"></b>
        </div>
        <div class="right">
            <b class="edit-info" v-html="`Adres wijzigen`" @click="emit('changeEditInfo')"></b>
        </div>

        <!--<div class="modal-overlay" v-if="state.addInfoModal">
            <EditDeliveryInfo
                :info="state.info"
                :standard="state.userinfo.default_information"
                @updateDetails="(callback) => {updateDetails(callback); state.addInfoModal = null}"
                @setAsStandard="(callback) => {state.userinfo.default_information = callback}"
                @close="(callback) => {state.addInfoModal = null}"
            />
        </div>-->
    </div>
</template>
<style lang="scss" scoped>
    .address{
        width: calc(100% - 40px);
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        justify-content: flex-start;
        text-align: left;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 10px;
        padding-bottom: 10px;
    }
    .title{
        width: 100%;
        font-size: 1.6rem;
        padding-bottom: 10px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
    }
    .title i{
        font-size: 1rem;
    }
    .title .standard{
        font-size: 1rem;
    }
    .left{
        width: 50%;
        padding-bottom: 10px; 
    }
    .left p{
        margin: unset;
        margin-bottom: 4px;
    }
    .right{
        width: 50%;
        padding-bottom: 10px; 
    }
    .right p{
        margin: unset;
        margin-bottom: 4px;
    }
    .edit-info{       
        font-size: 1rem;
    }

    .edit-info.delete{
        color: red;
    }

    .address .option{
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-start;
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 10px;
    }
    
    .address .option .container{
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 3px;
        font-size: 1rem;
    }
</style>