import { createApp } from 'vue'
import auth from '@/assets/scripts/auth'
import VueSimpleAlert from 'vue3-simple-alert';
const app = createApp({});

app.use(VueSimpleAlert);

export default {
    namespaced: true,
    state () {
        return{
            availableDepartments: null,
            availableSubDepartments: null,
            currentDepartment: null,
            currentSubDepartment: null,
            currentActie: null,
            actie: null
        }
    },
    getters: {
        getAvailableDepartments (state){
            return state.availableDepartments
        },
        getAvailableSubDepartments (state){
            return state.availableSubDepartments
        },
        getCurrentDepartment (state){
            return state.currentDepartment
        },
        getCurrentSubDepartment (state){
            return state.currentSubDepartment
        },
        getCurrentActie(state){
            return state.currentActie
        },
        getActie(state){
            return state.actie
        }
    },
    mutations: {
        changeAvailableDepartment(state, payload){
            state.availableDepartments = payload
        }, 
        changeAvailableSubDepartment(state, payload){
            if(payload) state.availableSubDepartments.push(payload)
        },
        resetAvailableSubDepartments(state){
            state.availableSubDepartments = []
        },
        setAvailableSubDepartments(state, payload){
            state.availableSubDepartments = []
            state.availableSubDepartments = payload
        },
        async changeDepartment(state, payload){
            state.availableSubDepartments = []
            if(payload != 0){
                if(payload?.nix18){
                    if(!localStorage.getItem('nix18') || localStorage.getItem('nix18') == 0){
                        if(auth.isNotUnderaged()){
                            localStorage.setItem('nix18', 1)
                            state.currentDepartment = payload
                        }
                        else{  
                            app.$confirm(                    
                            `Om verder te gaan verklaart u hierbij dat u ouder bent dan 18 jaar.`,
                            "NIX18",
                            'warning',
                            {
                                confirmButtonText: 'Ja',
                                cancelButtonText: 'Nee',
                                confirmButtonColor: '#F58320',
                                cancelButtonColor: '#e4e4e4',
                                duration: 10000,
                            })
                            .then((e) => {
                                if(e === true){
                                    localStorage.setItem('nix18', 1)
                                    state.currentDepartment = payload
                                }
                                else{                                    
                                    localStorage.setItem('nix18', 0)
                                }
                            })
                            .catch((e) => {
                                console.log(e)
                            })
                        }
                    }
                    else{
                        state.currentDepartment = payload
                    }
                }
                else{
                    state.currentDepartment = payload
                }
            }
            else{
                state.currentDepartment = payload
            }
        },
        changeSubDepartment(state, payload){
            state.currentSubDepartment = payload
        },
        changeCurrentActie(state, payload){
            state.currentActie = payload
        },
        changeActie(state, payload){
            state.actie = payload
        }
    },
    actions: {},
    modules: {}
}