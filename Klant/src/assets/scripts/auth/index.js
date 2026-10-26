import { createApp } from 'vue'
import { HTTP } from '@/assets/scripts/http-common.js';
import router from '@/router';
import { jwtDecode as jwt_decode } from 'jwt-decode';
import store from '@/store';
import { DateTime } from "luxon";
import VueSimpleAlert from 'vue3-simple-alert';
const app = createApp({});

app.use(VueSimpleAlert);

export default {
    async setUserinfo(data) {
       if (!data.err) {
            let info = data.user
            localStorage.setItem('user_id', info.customer_id)
            localStorage.setItem('email', info.email)
            localStorage.setItem('access_token', info.accessToken)
            localStorage.setItem('klantenkaart', info.klantenkaart)
            localStorage.setItem('name', `${info.gender || ''} ${info.first_name || ''} ${info.surname || ''}`)
            localStorage.setItem('dob', info.dob || '')
            localStorage.setItem('shoptype', info.customer_settings?.shoptype || 0)
            localStorage.setItem('shopheight', info.customer_settings?.shopheight || 4)
			store.commit('shopsettings/changeShelfStyle',info.customer_settings?.shoptype || 0)
			store.commit('shopsettings/changeShelfSize',info.customer_settings?.shopheight || 4)
            //router.push('/')
            localStorage.setItem('vue-cookie-accept-decline-myPanel1', 'accept')
            store.commit('shopsettings/updateLoggedIn', true)
            store.commit('shopsettings/updateUserinfo', info)
        } else {
            return data.err
        }
    },
    async login(email, pass) {
        return new Promise((resolve) => {
            const data = {
                email: email,
                password: pass
            }
            HTTP.post("customer/login", data)
                .then(response => {
                    var userdata = response.data
                    this.setUserinfo(userdata)
                    .then(() =>{
                        if(userdata.err){
                            resolve(userdata.err)
                        }
                        else{
                            this.getActies()
                            if(!userdata.err) router.push('/')
                            resolve()
                        }
                    })
                })
                .catch(() => {
                    resolve("Something went wrong")
                })
        })
    },
    logout() {
        localStorage.clear();
        router.push('/')
        store.commit('shopsettings/updateLoggedIn', false)
        localStorage.setItem('vue-cookie-accept-decline-myPanel1', 'accept')
        store.commit('shopsettings/updateOpened', 2)
        store.commit('shopsettings/updateUserinfo', {})
    },
    register(data) {
        const user = {
            first_name: data.first_name,
            surname: data.surname,
            email: data.email,
            password: data.password,
            updates: data.updates,
            dob: data.dob,
            gender: data.gender,
            klantenkaart: data.klantenkaart
        }
        HTTP.post("customer/", user)
            .then(response => {
                if (!response.data.err) {
                    if(response.data.customer_id){
                        router.push('/postregistercard')
                        localStorage.setItem('klantenkaart', response.data.klantenkaart)
                    }
                    else{
                        router.push('/login')
                    }
                } else {
                    alert(response.data.err)
                }
            })
            .catch(e => {
                console.log(e)
            })
    },
    isAuthenticated() {
        const now = Date.now().valueOf() / 1000
        if(!localStorage.getItem('access_token')) return false
        if (jwt_decode(localStorage.getItem('access_token')).exp > now && localStorage.getItem('access_token')) return true
        else {
            this.logout()
            return false
        }
    },
    isAdmin() {
        if (this.isAuthenticated() && (localStorage.getItem('permissions') == 2 || localStorage.getItem('permissions') == 1)) {
            return true;
        } else {
            return false;
        }
    },
    isNotUnderaged(){
        if(localStorage.getItem('dob') == null) return false
        var date
        if(localStorage.getItem('dob') == "") date = DateTime.now().toISODate()
        else{ date = localStorage.getItem('dob')}
        const isTooYoung = date =>
            DateTime.fromFormat(date,'yyyy-MM-dd')
            .diffNow('years')
            .years < -18;
        return isTooYoung(date)
    },
    async ageConfirm1(){
        return new Promise((resolve) => {
        app.$fire({
            title: 'Select a date',
            html: `<input id="myInput" type="date"/>
                <script>
                </script>`,
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            /*didRender() {
              // Make the datepicker component available in the prompt alert
              //const vm = this.$swal.getPopup()
              var myInput = document.getElementById("myInput");
                myInput.addEventListener("input", function() {
                var inputValue = myInput.value;
                console.log(inputValue); // or update your UI here
                });
              $
              //vm.querySelector('.swal2-html-container').appendChild()
            },*/
          })
          
          var myInput = document.getElementById("myInput");
            myInput.addEventListener("input", function() {
            var inputValue = myInput.value;
            console.log(inputValue); // or update your UI here
          })
          resolve(myInput.value)
        })
    },
    
    async ageConfirm(){
        return new Promise((resolve) => {
        app.$fire({
            title: 'Select a date',
            html: `<input id="myInput" type="date"/>
                <script>
                </script>`,
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            /*didRender() {
              // Make the datepicker component available in the prompt alert
              //const vm = this.$swal.getPopup()
              var myInput = document.getElementById("myInput");
                myInput.addEventListener("input", function() {
                var inputValue = myInput.value;
                console.log(inputValue); // or update your UI here
                });
              $
              //vm.querySelector('.swal2-html-container').appendChild()
            },*/
          })
          
          var myInput = document.getElementById("myInput");
            myInput.addEventListener("input", function() {
            
          })
          resolve(myInput.value)
        })
    },
    async updateInfo() {
        return new Promise((resolve) => {
            var user = store.getters['shopsettings/getUserinfo']
            const token = localStorage.getItem("access_token");
            if(!user){
                user = {}
            }
            if(!user.customer_settings){
                user.customer_settings = {}
            }
            user.customer_settings.shopheight = store.getters['shopsettings/getAmountOfShelf']
            user.customer_settings.shoptype = store.getters['shopsettings/getShelfStyle']
            HTTP.put("customer", {user})
                .then(response => {
                    //localStorage.setItem('userinfo', JSON.stringify(user))
                    user.accessToken = token
                    this.setUserinfo({user: user})
                    .then(() =>{
                        if(response.data.err){
                            resolve(response.data.err)
                        }
                        else{
                            resolve()
                        }
                    })
                })
                .catch(e => {
                    console.log(e)
                })
        })
    },
    async updateWithPassword(data) {
        return new Promise((resolve) => {
            var user = data
            const token = localStorage.getItem("access_token");
            if(!user){
                user = {}
            }
            if(!user.customer_settings){
                user.customer_settings = {}
            }
            user.customer_settings.shopheight = store.getters['shopsettings/getAmountOfShelf']
            user.customer_settings.shoptype = store.getters['shopsettings/getShelfStyle']
            HTTP.put("customer", {user})
                .then(response => {
                    //localStorage.setItem('userinfo', JSON.stringify(user))
                    user.accessToken = token
                    this.setUserinfo({user: user})
                    .then(() =>{
                        if(response.data.err){
                            resolve(response.data.err)
                        }
                        else{
                            resolve(response.data.data)
                        }
                    })
                })
                .catch(e => {
                    console.log(e)
                })
        })
    },
    async forgotPassword(data) {
        return new Promise((resolve) => {
            HTTP.post("customer/passwordreset/", {user: data})
            .then(response => {
                resolve(response)
            })
            .catch(() => {
                resolve({message: "Something went wrong"})
            })
        })
    },
    async getInfo() {
        const id = localStorage.getItem("user_id");
        const token = localStorage.getItem("access_token");
        console.log(id)
        const params = {
            customer_id: id,
            accessToken: token
        }
        HTTP.get("customer/single", {params})
        .then(response => {
            var data = response.data
            if(data.user.customer_settings === null){
                data.user.customer_settings = {
                    shopheight: 4,
                    shoptype: 0
                }
            }
            //localStorage.setItem('userinfo', JSON.stringify(data.user))
            store.commit('shopsettings/changeShelfSize', data.user.customer_settings.shopheight)
            store.commit('shopsettings/changeShelfStyle', data.user.customer_settings.shoptype)
            store.commit('shopsettings/updateUserinfo', data.user)
            return data
        })
        .catch(e => {
            console.log(e)
        })
    },
    getActies() {
        const id = localStorage.getItem("user_id");

        const params = {
            customer_id: id
        }
        HTTP.get("customer_spaaractie", params)

        .then(() => {

        })
        .catch(() => {
        })
    },
    showInfo() {
        return this.user.info.userinfo;
    }
}