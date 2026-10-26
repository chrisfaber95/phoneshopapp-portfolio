<script setup>
import { reactive, onMounted } from 'vue'
import {HTTP} from '@/assets/services/http-common.js';
import UserModal from '../components/UserModal.vue';


    const state = reactive({
        accounts: [],
        rights: [],
        user: {
            name: '',
            cardnumber: '',
            email: '',
            password: '',
            role_id: '',
            store: 'coop'
        },
        new_user: false,
        selectedUser: null
    })

		function getAccounts(){
			HTTP.get('user')
			.then(response => {
				state.accounts = response.data
                console.log(state.accounts)
			})
		}
       
		function getRights(){
			HTTP.get('userroles')
			.then(response => {
				state.rights = response.data
                console.log(state.rights)
                state.user.role_id = state.rights[1].roleId
				return state.rights
			})
		}

        function addAccount(){
            const data = state.user
            HTTP.post('user', data)
            .then(() =>{
                state.user = {
                    name: '',
                    cardnumber: '',
                    email: '',
                    password: '',
                    role_id: '',
                    store: 'coop'
                }
                getAccounts()
            })
            .catch((err)=>{
                console.log(err)
            })
        }

        onMounted(() => {
            getAccounts()
            getRights()
        })
</script>
<template>
    <div class="account-screen">
        <div class="screen">
        <h2>Gebruiker accounts</h2>
        <button @click="state.new_user = true">Nieuwe gebruiker</button>
        <div class="modal-overlay" v-if="state.new_user == true">
            <div class="new-user">
                <button @click="state.new_user = false">Sluiten</button>
                <form class="register-user">
                        <label for="firstname">Naam*</label>
                        <input name="firstname" type="text" placeholder="Naam" v-model="state.user.name"/>
                        <label for="cardnumber">Personeelsnummer*</label>
                        <input name="cardnumber" type="text" placeholder="Personeelsnummer" v-model="state.user.cardnumber"/>
                        <label for="email">E-mailadres*</label>
                        <input name="email" type="text" placeholder="E-mailadres" v-model="state.user.email"/>
                        <label for="password">Password*</label>
                        <input name="password" type="text" placeholder="Password" v-model="state.user.password"/>
                        <label for="role">Rechten*</label>
                        <select name="role" v-model="state.user.role_id">
                            <option v-for="item in state.rights" v-bind:key="item.roleId" v-bind:value="item.roleId" v-html="item.roleName"></option>
                        </select>
                </form>
                <button @click="addAccount()">Account toevoegen</button>
            </div>
        </div>
		<div>
            <div class="account">
                <div class="name" ><b>Naam</b></div>
                <div class="cardnumber"><b>Kaart nummer</b></div>
                <div class="role"><b>Rol</b></div>
                <div class="edit"></div>
            </div>
            <div class="account" v-for="account in state.accounts" :key="account.user_id">
                <div class="name" v-html="account?.name"></div>
                <div class="cardnumber" v-html="account?.cardnumber"></div>
                <div class="role" v-html="account?.user_role?.roleName"></div>
                <div class="edit"><button @click="state.selectedUser = account">
                    <img class="nix18" 
                        :src="require('@/assets/icons/pencil.svg')" />	</button></div>
            </div>
			<div class="overflow-auto">
                    <!--<b-table
                    id="my-table"
                    :items="filteredAccounts"
                    :per-page="perPage"
                    :current-page="currentPage"
                    :fields="fields"
                    small
                    > 
                        <template #cell(actions)="data">					
                            <b-button  v-b-modal.modal-3 class="bewerk-btn" @click="changeUser(data.item.user_id);">Openen</b-button>
                        -->	
                            <!--<b-button class="bewerk-btn" @click="changeUser(account); generateTag()">NFC</b-button>
                            <b-button  v-b-modal.modal-2 class="btn bewerk-btn" @click="changeUser(account);">Edit</b-button>
                            <b-button  variant="danger" v-b-modal.modal-2 class="btn delete-btn" @click="deleteUser(account)">Delete</b-button>-->
                        <!--</template>
                    </b-table>
                </div>			
                <b-pagination
                v-model="currentPage"
                :total-rows="rows"
                :per-page="perPage"
                aria-controls="my-table"
                ></b-pagination>-->
                <div class="modal-overlay" v-if="state.selectedUser">
                    <UserModal 
                        :user="state.selectedUser" 
                        :key="`selected-${state.selectedUser.user_id}`"
                        @close="(callback) => {state.selectedUser = null}"
                        />
                </div>
                <!--<p class="mt-3">Current Page: {{ currentPage }}</p>-->
            </div>
        </div>
        </div>        
    </div>
</template>
<style lang="scss" scoped>
.account-screen{
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.screen{
	overflow-y:scroll;
	height: 100%;
}

.register-user select{
    font-size: 1.8rem;
}

    .new-user{
        width:100%;
    }
    .new-user form{
        width: 100%;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-items: center;
        align-content: center;
        justify-content: flex-start;
    }
    .new-user form label{
        width: 90%;
    }
    .new-user form input{
        width: 90%;
    }
.account{
    max-width: 100%;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    white-space: pre-line;
    word-break: break-word;
    border-bottom: 2px solid #ececec;
}
.account > div{
    display: inline-block;
    margin-top: auto;
    margin-bottom: auto;
}
.edit{        
    width: 2.5rem;
}

.edit button{
    padding: 4px;
    margin: 5px 0;
}
</style>