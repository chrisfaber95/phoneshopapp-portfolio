<template>
    <div class="register">
		<Header />
        <h2>Gebruiker accounts</h2>
        <div class="new-user">
			<form class="register-user">
				<b-form-group>
					<label for="firstname">Naam*</label>
					<b-form-input name="firstname" type="text" placeholder="Naam" v-model="user.firstName"/>
			</b-form-group>
				<b-form-group>
					<label for="lastname">Achternaam*</label>
					<b-form-input name="lastname" type="text" placeholder="Achternaam" v-model="user.lastName"/>
			</b-form-group>
				<b-form-group>
					<label for="cardnumber">Personeelsnummer*</label>
					<b-form-input name="cardnumber" type="text" placeholder="Personeelsnummer" v-model="user.username"/>
			</b-form-group>
				<b-form-group>
					<label for="email">E-mailadres*</label>
					<b-form-input name="email" type="text" placeholder="E-mailadres" v-model="user.email"/>
			</b-form-group>
				<b-form-group>
					<label for="password">Password*</label>
					<b-form-input name="password" type="text" placeholder="Password" v-model="user.password"/>
			</b-form-group>
				<b-form-group>
					<label for="role">Rechten*</label>
					<select name="role" v-model="user.role_id">
						<option v-for="item in filteredRights" v-bind:key="item.role_id" v-bind:value="item.role_id">{{capitalize(item.role_name)}}</option>
					</select>
				</b-form-group>
			</form>
			<b-button @click="addAccount()">Account toevoegen</b-button>
		</div>
			
		
		<hr />
		<div v-if="filteredAccounts">
			<div class="overflow-auto">
				<b-table
				id="my-table"
				:items="filteredAccounts"
				:per-page="perPage"
				:current-page="currentPage"
				:fields="fields"
				small
				> 
					<template #cell(actions)="data">					
						<b-button  v-b-modal.modal-3 class="bewerk-btn" @click="changeUser(data.item.user_id);">Openen</b-button>
						
						<!--<b-button class="bewerk-btn" @click="changeUser(account); generateTag()">NFC</b-button>
						<b-button  v-b-modal.modal-2 class="btn bewerk-btn" @click="changeUser(account);">Edit</b-button>
						<b-button  variant="danger" v-b-modal.modal-2 class="btn delete-btn" @click="deleteUser(account)">Delete</b-button>-->
					</template>
				</b-table>
			</div>			
			<b-pagination
			v-model="currentPage"
			:total-rows="rows"
			:per-page="perPage"
			aria-controls="my-table"
			></b-pagination>
			<div class="modaloverlay" v-if="selectedUser"></div>
			<user-modal :user_id="selectedUser.toString()" :key="selectedUser" v-if="selectedUser"/>
			<p class="mt-3">Current Page: {{ currentPage }}</p>
		</div>
    </div>
</template>

<script>
import {HTTP} from '@/assets/services/http-common.js';
import Header from '@/components/Basics/Header.vue'
import UserModal from '../components/UserModal.vue';

export default {
    data () {
        return {
			selectedUser: null,
			account: [],
            user: {
                firstName: '',
                lastName: '',
                username: '',
                password: '',
                email: '',
				role_id: ''
            },
            submitted: false,
			rights: [],	
			perPage: 10,
			currentPage: 1,
			fields:[
				{	key: 'name',
					label: 'Naam',
					sortable: false
				},
				{	key: 'cardnumber',
					label: 'Personeels nummer',
					sortable: false
				},
				{	key: 'actions',
					label: 'Acties'
				}
			]

        }
    },
	components: {
		Header,
		UserModal
	},
    computed: {
		rows() {
			if(this.filteredAccounts){
				return this.filteredAccounts.length
			}
			else{
				return 0
			}
		},
		filteredAccounts: function(){
			console.log(this.account)
			return this.account
		},
		filteredRights: function(){
		console.log(this.rights)
			return this.rights
		}
    },
    methods: {   
		capitalize(s){
			if (typeof s !== 'string') return ''
			return s.charAt(0).toUpperCase() + s.slice(1)
		},
		updateAccounts: function(account){
			HTTP.put('user/update/'+account.user_id+'/', account)
			.then(response => {
				console.log(response.data)
				return response.data.user
			})
		},
		getAccounts: function(){
			HTTP.get('user')
			.then(response => {
				console.log(response.data)
				this.account = response.data.user
				return response.data.user
			})
		},     
		addAccount: function(){
			console.log(this.user)
			HTTP.post('user', this.user)
			.then(response => {
				console.log(response.data)
				this.account = response.data.user
				alert("accounts added");
				return response.data.user
			})
		},
		deleteUser:function(account){
			if(confirm("Do you really want to delete this?")){			
				HTTP.delete('/user/'+account.user_id)
				.then(response => {
					console.log(response.data)				
					this.getAccounts();
				})
			}
		},
		getRights: function(){
			HTTP.get('settings/rights/')
			.then(response => {
				this.rights = response.data.rights
				console.log(this.rights)
				return this.rights
			})
		},
		changeUser: function(user){
			console.log(user)
			this.selectedUser = user
		},
        makeid: function (length) {
			var result           = '';
			var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			var charactersLength = characters.length;
			for ( var i = 0; i < length; i++ ) {
				result += characters.charAt(Math.floor(Math.random() * 
					charactersLength));
			}
			console.log(result)
			return result;
		},
		
    },
	mounted(){
		this.getRights()
		this.getAccounts()
	},
};
</script>
<style scoped>

	.modaloverlay{
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(165,165,165,0.5);
	}
	.new-user .btn{
		font-size: 1.8rem;
	}
	.register-user{
		display: flex;
		align-content: flex-start;
		width: 80%;
		align-items: center;
		flex-direction: row;
		flex-wrap: wrap;
		margin-left: auto;
		margin-right: auto;
		justify-content: space-between;
	}
	.register-user .form-group{
		width: 100%;
	}
	.register-user input{
		margin:  0px auto 10px auto;
	}

	.register-user input{
		font-size: 1.5rem;
		line-height: 2rem;
	}
	
	.register-user label{
		font-size: 1.2rem;
	}
	.btn{		
		margin: 4px;
		font-size: 1.3rem;
		font-weight: 600;
		padding: 0px 5px;
		background-color: #ffa500;
		color: white;
		-webkit-box-shadow: 6px 10px 5px 0px rgb(0 0 0 / 75%);
		box-shadow: 4px 4px 3px 0px rgb(0 0 0 / 40%);
		color: #ffffff;
		border: 2px solid #ffa500;
	}
	@media screen and (min-width: 768px){	
		.register-user input{
			font-size: 1.8rem;
			line-height: 2.5rem;
		}
		.register-user label{
			font-size: 1.5rem;
		}
		.register-user .form-group{
			width: 48%;
		}
	}
	.register-user div{
		padding-bottom: 10px;
	}	
	.register-user div label{
		font-weight: 600;
		margin-right: 1rem;
	}
</style>
<style>
.register-user .form-group div{
	display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    justify-content: center;
}
</style>