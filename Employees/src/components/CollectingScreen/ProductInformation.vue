<template>
    <div class="product">
        <div class="buttons">
            <button @click="closeEdit()">Sluiten</button>
        </div>
        <div class="edit" v-if="state.editProduct == true">
            <EditProduct :item="state.product"/>
        </div>
        <div class="information" v-if="state.editProduct == false">
            <img
            :src="`https://www.cooplubbers.nl${state.imageUrl}`"
            @click="state.change_image = true; "
          />
          <div class="basic">
            <label for="title">Productnaam:</label>
            <p
              name="title"
              type="text"
              v-html="state.product.product_information.title"></p>
            <label for="ean">Barcode:</label>
            <p
              name="ean"
              type="text"
              v-html="state.product.ean"
              ></p>
            <label for="code">Productcode:</label>
            <p
              name="code"
              type="text"
              v-html="state.product.schapcode"
              ></p>
          </div>
          <div class="prices">
            <label for="price">Prijs:</label>
            <p
              name="price"
              type="number"
              min="0.00"
              step="0.01"
              v-html="state.product.price"
              ></p>
            <label for="btw">BTW:</label>
            <p
              name="btw"
              type="number"
              min="0"
              step="1"
              max="100"
              v-html="state.product.btw"
              ></p>
            <label for="deposit">Statiegeld:</label>
            <p
              name="deposit"
              type="number"
              min="0.00"
              step="0.01"
              v-html="state.product.statiegeld"
              ></p>
            <label for="sup">SUP-prijs:</label>
            <p
              name="sup"
              type="number"
              min="0.00"
              step="0.01"
              v-html="state.product.sup_price"
              ></p>
          </div>
          <div class="information">
            <label for="variant">Variant:</label>
            <p
              name="variant"
              type="text"
              v-html="state.product.product_information.variant"
              ></p>
            <div class="option">
              <label for="nix" class="container">Nix-18:</label>
              <label class="checkbox path buss">
                <p name="nix" type="checkbox" v-html="state.product.nix18" />
              </label>
            </div>
          </div>
          <div class="department">
            <label for="department"></label>
            <p name="department" v-html="state.product.department_id">
            </p>
          </div>
        </div>      
    </div>
  </template>
  <script setup>
  import { defineProps, reactive, onMounted, defineEmits, watch,  createApp } from "vue";
  import { HTTP } from "@/assets/services/http-common.js";
      import VueSimpleAlert from 'vue3-simple-alert';
import EditProduct from "@/components/Storesettings/Products/EditProduct.vue";
  
  const app = createApp({});
      app.use(VueSimpleAlert);
  
  const props = defineProps({
    item: Object,
    ean: String
  });
  
  const state = reactive({    
    editProduct: false,
      new_product: false,
    departments: [],
    product: {
      beschikbaar: 0,
      btw: 0,
      department_id: -1,
      ean: "",
      end_of_life: 0,
      levertijd_id: 1,
      nix18: false,
      price: "0.00",
      product_has_discount_list: [],
      product_information: {
        ean: "",
        imgurl: "",
        ingredients: "",
        omschrijving:
          "",
        product_additional_information_list: [],
        title: "",
        url: null,
      },
      variant: "",
      schapcode: "",
      schaphoogte: 0,
      schapplaats: 0,
      statiegeld: "0.00",
      stock: 1,
      sup_price: 0.0,
    },
    change_image: false,
    imgurl: ''
  });
  
  onMounted(() => {
      if(props.item != null){
          state.product = props.item;
      }
      else if(props.ean != null){
          getProduct(props.ean)
      }
      else{
          state.new_product = true
          state.editProduct = true
      }
      updateImageUrl()
  });
  
  function updateImageUrl(){
    // Append a timestamp as a query parameter to the image URL
    const timestamp = Date.now();
    state.imageUrl = `${state.product.product_information.imgurl}?${timestamp}`;
  }
  
  
  
  function getProduct(ean) {
    if(ean != ''){
      HTTP.get(`product/${ean}`)
      .then((response) => {
          if(response.data != null){
              state.product = response
          }
          else{            
              state.new_product = true
              state.product.ean = ean
              state.editProduct = true
          }
      })
      .catch((e) => {
        console.log(e);
      });
    }
    else{            
        state.new_product = true
        state.product.ean = ean
    }
  }
  
  function closeEdit() {
    emit('close')
  }
  
  
  watch(
    () => state.product?.ean,
    () => {
      state.product.product_information.ean = state.product?.ean
    }, {
      immediate: true
    }
  );

  const emit = defineEmits(['close'])
  
  </script>
  <style scoped lang="scss">
  .product {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-evenly;
    border-bottom: 1px solid #ececec;
    overflow-y: scroll;
  }
  .product > * {
    width: 94%;
    white-space: break-spaces;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .product .buttons{
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: flex-start;
  }
  .product .buttons button{
    font-size: 1.2rem;
    padding: 5px;
  }
  .product > img {
    width: 40%;
  }
  
  .product > .modal-overlay {
    width: 100%;
    align-items: center;
  }
  
  input {
    font-size: 1.1rem;
  }
  
  .checkbox {
    --background: #fff;
    --border: #e60000;
    --border-hover: #e60000;
    --border-active: #00c711;
    --tick: #fff;
    position: relative;
    input,
    svg {
      width: 30px;
      height: 30px;
      display: block;
    }
    input {
      -webkit-appearance: none;
      -moz-appearance: none;
      position: relative;
      outline: none;
      background: var(--background);
      border: none;
      margin: 0;
      padding: 0;
      cursor: pointer;
      border-radius: 4px;
      transition: box-shadow 0.3s;
      box-shadow: inset 0 0 0 var(--s, 1px) var(--b, var(--border));
      &:hover {
        --s: 2px;
        --b: var(--border-hover);
      }
      &:checked {
        --b: var(--border-active);
      }
    }
    svg {
      pointer-events: none;
      fill: none;
      stroke-width: 2px;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke: var(--stroke, var(--border-active));
      position: absolute;
      top: 0;
      left: 0;
      width: 31px;
      height: 31px;
      transform: scale(var(--scale, 1)) translateZ(0);
    }
    &.path {
      input {
        &:checked {
          --s: 2px;
          transition-delay: 0.4s;
          & + svg {
            --a: 16.1 86.12;
            --o: 102.22;
          }
        }
      }
      svg {
        stroke-dasharray: var(--a, 86.12);
        stroke-dashoffset: var(--o, 86.12);
        transition: stroke-dasharray 0.6s, stroke-dashoffset 0.6s;
      }
    }
    &.bounce {
      --stroke: var(--tick);
      input {
        &:checked {
          --s: 11px;
          & + svg {
            animation: bounce 0.4s linear forwards 0.2s;
          }
        }
      }
      svg {
        --scale: 0;
      }
    }
  }
  
  @keyframes bounce {
    50% {
      transform: scale(1.2);
    }
    75% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }
  
  input[type="radio"].checkbox {
    --background: #fff;
    --border: #e60000;
    --border-hover: #e60000;
    --border-active: #00c711;
    --tick: #fff;
    position: relative;
    input,
    svg {
      width: 30px;
      height: 30px;
      display: block;
    }
    input {
      -webkit-appearance: none;
      -moz-appearance: none;
      position: relative;
      outline: none;
      background: var(--background);
      border: none;
      margin: 0;
      padding: 0;
      cursor: pointer;
      border-radius: 4px;
      transition: box-shadow 0.3s;
      box-shadow: inset 0 0 0 var(--s, 1px) var(--b, var(--border));
      &:hover {
        --s: 2px;
        --b: var(--border-hover);
      }
      &:checked {
        --b: var(--border-active);
      }
    }
    svg {
      pointer-events: none;
      fill: none;
      stroke-width: 2px;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke: var(--stroke, var(--border-active));
      position: absolute;
      top: 0;
      left: 0;
      width: 31px;
      height: 31px;
      transform: scale(var(--scale, 1)) translateZ(0);
    }
    &.path {
      input {
        &:checked {
          --s: 2px;
          transition-delay: 0.4s;
          & + svg {
            --a: 16.1 86.12;
            --o: 102.22;
          }
        }
      }
      svg {
        stroke-dasharray: var(--a, 86.12);
        stroke-dashoffset: var(--o, 86.12);
        transition: stroke-dasharray 0.6s, stroke-dashoffset 0.6s;
      }
    }
    &.bounce1 {
      --stroke: var(--tick);
      input {
        &:checked {
          --s: 11px;
          & + svg {
            animation: bounce1 0.4s linear forwards 0.2s;
          }
        }
      }
      svg {
        --scale: 0;
      }
    }
  }
  
  @keyframes bounce1 {
    50% {
      transform: scale(1.2);
    }
    75% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }
  
  .option {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 10px;
    width: 100%;
    flex-wrap: nowrap;
    align-items: center;
  }
  
  .option .container {
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 3px;
    font-size: 1rem;
    text-align: right;
    margin-bottom: 0px;
  }
  .container {
    display: block;
    position: relative;
    padding-left: 50px;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 22px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  /* Hide the browser's default radio button */
  .container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  /* Create a custom radio button */
  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 35px;
    width: 35px;
    background-color: #eee;
    border-radius: 50%;
  }
  
  /* On mouse-over, add a grey background color */
  .container:hover input ~ .checkmark {
    background-color: #ccc;
  }
  
  /* When the radio button is checked, add a blue background */
  .container input:checked ~ .checkmark {
    background-color: var(--base-color);
  }
  
  /* Create the indicator (the dot/circle - hidden when not checked) */
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }
  
  /* Show the indicator (dot/circle) when checked */
  .container input:checked ~ .checkmark:after {
    display: block;
  }
  
  /* Style the indicator (dot/circle) */
  .container .checkmark:after {
    top: 0;
    left: 0;
    width: 50%;
    height: 50%;
    border-radius: 50%;
    background: white;
    transform: translate(50%, 50%);
  }
  </style>
  