<script setup>
    import { reactive, defineProps, computed, defineEmits, onMounted, watch} from 'vue';
    import auth from '@/assets/scripts/auth';
import EditDeliveryInfo from '@/components/AccountSettings/EditDeliveryInfo.vue'
import { useStore } from 'vuex'
const store = useStore()

    const props = defineProps({
		"info": Object,
        'standard': Number
	})

	const state = reactive({    
	userinfo: {
        default_information: '',
        default_invoice_information: '',
        default_work_information: ''
    },
    info: {},
    addInfoModal: false
	})

    const isStandard = computed(() => {
        if(state.userinfo.default_information == props.info.customer_information_id) return true
        return false
    })
    const isWorkStandard = computed(() => {
        if(state.userinfo.default_work_information == props.info.customer_information_id) return true
        return false
    })
    const isInvoiceStandard = computed(() => {
        if(state.userinfo.default_invoice_information == props.info.customer_information_id) return true
        return false
    })



    function updateDetails(info){
        state.info = info
        //store.commit('shopsettings/updateUserinfo', state.userinfo)
       // updateCreds('n')
        //emit('updateDetails', state.info)
    }

    

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

    defineEmits(['updateDetails', 'setAsStandard', 'setAsWorkStandard', 'setAsInvoiceStandard', 'close', 'updateAddress']);

    

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

    watch(() => state.userinfo.default_invoice_information, (newVal, oldVal) => {
            if(newVal == state.info.customer_information_id){
                auth.updateInfo()
            }
    }, {deep: true})

    watch(() => state.userinfo.default_work_information, (newVal, oldVal) => {
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
            <div class="standard">
                <i v-if="isStandard" v-html="`(Standaard afleveradres)`"></i>
                <i v-if="isWorkStandard" v-html="`(Standaard werkadres)`"></i>
                <i v-if="isInvoiceStandard" v-html="`(Standaard factuuradres)`"></i>
            </div>
            
           
            <div class="option">						
                <label class="container">Maak standaard
                </label>
                <label class="checkbox path buss">
                    <input type="checkbox" v-model="state.userinfo.default_information" :true-value="info.customer_information_id" :false-value="null" v-if="standard == 0"/>
                    <input type="checkbox" v-model="state.userinfo.default_invoice_information" :true-value="info.customer_information_id" :false-value="null" v-if="standard == 1"/>
                    <input type="checkbox" v-model="state.userinfo.default_work_information" :true-value="info.customer_information_id" :false-value="null" v-if="standard == 2"/>
                    <svg viewBox="0 0 21 21">
                        <path d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"></path>
                    </svg>
                </label>		
            </div>
        </div>
        <div class="left">
            <p v-html="`${state.info.first_name} ${state.info.surname}`"></p>
            <p v-html="`${state.info.phone}`"></p>
            <p v-html="`${state.info.businessphone || ''}`"></p>
        </div>
        <div class="right">
            <p v-html="`${state.info.business || ''}`"></p>
            <p v-html="`${state.info.street} ${state.info.house_number} ${state.info.house_addition}`"></p>
            <p v-html="`${state.info.zipcode} ${state.info.city}`"></p>
        </div>
        <div class="left">
            <b class="edit-info delete edit" v-html="`Verwijderen`" @click="state.addInfoModal = true"></b>
        </div>
        <div class="right">
            <b class="edit-info edit" v-html="`Informatie wijzigen`" @click="state.addInfoModal = true"></b>
            <b class="edit-info edit_standard" v-html="`Standaard wijzigen`"></b>
        </div>

        <div class="modal-overlay" v-if="state.addInfoModal">
            <EditDeliveryInfo
                :info="state.info"
                :standard="state.userinfo.default_information"
                :workstandard="state.userinfo.default_work_information"
                :invoicestandard="state.userinfo.default_invoice_information"
                @updateDetails="(callback) => {updateDetails(callback); state.addInfoModal = null}"
                @setAsStandard="(callback) => {state.userinfo.default_information = callback}"
                @setAsInvoiceStandard="(callback) => {state.userinfo.default_invoice_information = callback}"
                @setAsWorkStandard="(callback) => {state.userinfo.default_work_information = callback}"
                 @close="(callback) => {state.addInfoModal = null}"
            />
        </div>
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
    .title .standard{
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        flex-wrap: wrap;
        justify-content: flex-start;
    }
    .title i{
        font-size: 1rem;
        font-weight: 600;
    }
    .left{
        width: 50%;
        margin-bottom: 8px;
    }
    .left p{
        margin: unset;
        font-size: 1.1rem;
        padding-bottom: 1px;
    }
    .right{
        width: 50%;
        margin-bottom: 8px;
    }
    .right p{
        margin: unset;
        font-size: 1.1rem;
        padding-bottom: 1px;
    }
    .edit-info{
        padding-top: 10px;
    }
    .edit-info.delete{
        color: red;
    }
    .address .edit-info.edit{
        display: block;
    }
    .address.standard .edit-info.edit{
        display: none;
    }
    .address .edit-info.edit_standard{
        display: none;
    }
    .address.standard .edit-info.edit_standard{
        display: block;
    }

    .address .option{
        display: flex;
        flex-direction: row-reverse;
        justify-content: flex-start;
        font-size: 1rem;
        font-weight: 600;
        margin-bottom: 10px;
        width: 100%;
        flex-wrap: nowrap;
        align-items: center;
    }

    .address.standard .option{
        display: none;
    }
    
    .address .option .container{
        padding-left: 5px;
        padding-right: 5px;
        padding-top: 3px;
        font-size: 1rem;
        text-align: right;
        margin-bottom:0px;
    }
    .address .option .options{
        display: grid;
        grid-template-columns: 30% 30% 30%;
        width: 50%;
    }

    .address .option .options .optie{
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-items: center;
    }

</style>