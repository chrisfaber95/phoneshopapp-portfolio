<template>
    <div class="acties">
      
        <button @click="state.selectedActie = {}">Nieuwe actie</button>
        <div class="actie-list">
            <div class="actie" v-for="item in state.acties" :key="item.spaaractie_id" @click="state.selectedActie = item">
                <div class="image">
                    <img :src="`${imageLink(item.list_image)}`"/>
                </div>
            </div>
        </div>
        <div class="modal-overlay" v-if="state.selectedActie != null">
            <Actie 
                :actie="state.selectedActie" 
                @finished="(callback) => {state.selectedActie = null; refresh(callback)}"
            />
        </div>
    </div>
  </template>
  <script setup>
  import {  reactive, onMounted } from "vue";
  import { HTTP } from "@/assets/services/http-common.js";
  import Actie from "@/components/Storesettings/Acties/Actie.vue";
  
  const state = reactive({
    acties: [],
    selectedActie: null
  });
  
  onMounted(() => {
    getActies();
  });
  
  function getActies() {
    HTTP.get(`spaaractie`, {  })
      .then((response) => {
        state.acties = response.data
      })
      .catch((e) => {
        console.log(e);
      });
  }

    function imageLink(url){
        if(url[0] != '/'){
           // return `${window.location.origin}/${url}`
            return `https://www.cooplubbers.nl/${url}`
        }
        else{
            return `https://www.cooplubbers.nl${url}`
        }
    }

    function refresh(call){
      if(call === true){
        getActies()
      }
    }
  
  </script>
  <style scoped>
  .actie-list{
    width: 80%;
    margin-left: auto;
    margin-right: auto;
  }
  .actie{
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .settings{
    height: 10%;
    padding-top: 5px;
    border-top: 2px solid #ececec;
  }
  .settings .buttons{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    flex-wrap: wrap;
  }
  .settings .buttons button{
    font-size: 1.2rem;
    margin: 0;
    margin-top: 5px;
    padding: 5px;
  }
  .settings .buttons button a{
    color: #ffffff;
    text-decoration: none;
  }
  .navigation{
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-evenly;
    position: relative;
  }
  .navigation .filters{
    position: absolute;
    bottom: calc(100% + 5px);
    background-color: white;
    width: 100%;
    height: fit-content;
    border-top: 2px solid #555555;
    border-bottom: 2px solid #aaaaaa;
    padding-bottom: 10px;
    padding-top: 10px;
  }
  .filter-options{
    width: 2.5rem;
  }
  .filter{
    width: calc(100% - 3rem);
  }
  .filter select{
    font-size: 1.2rem;
    width: 96%;
  }
  .filter-options .filter-button{
    margin: 0;
    padding: 5px;
  }
  .filter-options .filter-button img{
    width: 1.5rem;
  }
  </style>
  