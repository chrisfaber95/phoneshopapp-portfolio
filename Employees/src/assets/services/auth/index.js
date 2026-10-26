import { HTTP } from '@/assets/services/http-common.js';
import router from '@/router';
import { jwtDecode as jwt_decode } from 'jwt-decode';
import store from '../../../store';

export default {
    setUserinfo(data) {
        if (!data.err) {
            let info = data.user
            localStorage.setItem('user_id', info.user_id)
            localStorage.setItem('cardnumber', info.cardnumber)
            localStorage.setItem('access_token', info.accessToken)
            localStorage.setItem('permissions', info.user_role.roleId)
            //localStorage.setItem('expires', Date.now() + data.user.expires_in)
            localStorage.setItem('store', info.store.toLowerCase())
            document.querySelector('html').dataset.theme = `theme-${(localStorage.getItem('store') || 'base').toLowerCase()}`;
            router.push('/')
        } else {
            alert(data.err)
        }
    },
    login(email, pass) {
        const data = {
            email: email,
            password: pass
        }
        console.log(data)
        HTTP.post("user/login", data)
            .then(response => {
                var userdata = response.data
                this.setUserinfo(userdata)
                store.commit('settings/updateUnAuth', false)
            })
            .catch(e => {
                console.log(e)
            })
    },
    relogin(email, pass) {
        const data = {
            email: email,
            password: pass
        }
        HTTP.post("user/login", data)
            .then(response => {
                var userdata = response.data
                console.log(userdata)
                if(userdata.err){
                    alert(userdata.err)
                }
                else{
                    localStorage.setItem('access_token', userdata.user.accessToken)
                    store.commit('settings/updateUnAuth', false)
                }
            })
            .catch(e => {
                console.log(e)
            })
    },
    nfcLogin(tag, serial) {
        const data = {
            tag: tag,
            serial: serial
        }
        HTTP.post("user/login", data)
            .then(response => {
                var userdata = response.data
                this.setUserinfo(userdata)
            })
            .catch(e => {
                console.log(e)
            })
    },
    logout() {
        document.querySelector('html').dataset.theme = `theme-${('base').toLowerCase()}`;
        localStorage.clear();        
        router.push('/login')
    },
    register(email, pass) {
        const data = {
            email: email,
            pass: pass
        }
        HTTP.post("user/register", data)
            .then(response => {
                if (!response.data.err) {
                    alert(response.data)
                } else {
                    alert(response.data.err)
                }
            })
            .catch(e => {
                console.log(e)
            })
    },
    forgotPassword() {
        var data = {
            email: this.userLogin.email
        }
        HTTP.put('user/forget', data)
            .then(response => {
                console.log(response.data)
                    // this.account = response.data.user
                alert("Wijziging aangevraagd");
                this.reset = false
                    //this.getAccounts();
                return true
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
        
        if (this.isAuthenticated() && (localStorage.getItem('permissions') == "b4d709b5-b4ed-11ec-9698-0242ac110003" || localStorage.getItem('permissions') == "b4d71330-b4ed-11ec-9698-0242ac110003")) {
            return true;
        } else {
            return false;
        }
    },
    updateInfo() {
        const data = JSON.parse(localStorage.getItem("userinfo"))
        const id = JSON.parse(localStorage.getItem('id_token'))
        HTTP.put("user/update/" + id, data)
            .then(response => {
                console.log(response.data)
                localStorage.setItem('userinfo', JSON.stringify(response.data.user))
                this.user.info.userinfo = JSON.parse(localStorage.getItem('userinfo'))
            })
            .catch(e => {
                console.log(e)
            })
    },
    getInfo() {
        const id = localStorage.getItem("id_token");

        HTTP.get("user/single/" + id)
            .then(response => {
                console.log(response)
                localStorage.setItem('userinfo', JSON.stringify(response.data.user))
                this.user.info.userinfo = JSON.parse(localStorage.getItem('userinfo'))

            })
            .catch(e => {
                console.log(e)
            })
    },
    showInfo() {
        return this.user.info.userinfo;
    },
    getUserId(){
        return localStorage.getItem("user_id")
    },
    getUserRoles(){
        HTTP.get(`userroles`)
		.then((response) => {
			console.log(response.data)
		})
		.catch((errors) => {
			console.log(errors)
		})
    }
}