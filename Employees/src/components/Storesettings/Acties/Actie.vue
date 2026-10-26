<template>
  <div class="actie">
    <div class="buttons">

      <button @click="emit('finished', true)">Sluiten</button>
      <button @click="updateActie()">Opslaan</button>
    </div>
    <!--<div class="basic" v-if="state.actie && state.edit === false">
            <div class="title">{{state.actie.title}}</div>
            <div class="description">{{state.actie.description}}</div>
            <div class="description">{{state.actie.slug}}</div>
            <div class="amount">{{state.actie.amount_of_stamps}}</div>
            <div class="amount">{{state.actie.amount_of_stamps}}</div>
            <div class="amount">{{state.actie.point_for_stamp}}</div>
            <div class="amount">{{state.actie.stamp_price}}</div>
            <div class="amount">{{state.actie.price_visible}}</div>
            <div class="amount">{{state.actie.physical}}</div>
            <div class="amount">{{state.actie.maincolor}}</div>
            <div class="date">{{state.actie.start_date}}</div>
            <div class="date">{{state.actie.end_date}}</div>
            <div class="img">
                <div class="stamp">{{state.actie.imgurl}}</div>
                <div class="stamp">{{state.actie.stamp_imgurl}}</div>
                <div class="stamp">{{state.actie.background_card}}</div>
                <div class="stamp">{{state.actie.front_imgurl}}</div>
                <div class="stamp">{{state.actie.back_imgurl}}</div>
                <div class="stamp">{{state.actie.list_image}}</div>
            </div>
            <div class="amount">{{state.actie.tac}}</div>
            <div class="amount">{{state.actie.spaaractie_products}}</div>
        </div>-->
    <div class="edit" v-if="state.edit === true">
      <div class="group">
        <label for="title">Titel</label>
        <input
          name="title"
          class="title"
          type="text"
          v-model="state.actie.title"
        />
      </div>
      <div class="group">
        <label for="title">Koptekst</label>
        <textarea class="description" rows=4 v-model="state.actie.koptekst" />
      </div>
      <div class="group">
        <label for="title">Omschrijving</label>
        <textarea class="description" rows=4 v-model="state.actie.description" />
      </div>
      <div class="group">
        <label for="title">Slug</label>
        <input class="description" type="text" v-model="state.actie.slug" />
      </div>
      <div class="group">
        <label for="title">Aantal zegels per pagina</label>
        <input
          class="amount"
          type="number"
          step="1"
          min="1"
          v-model="state.actie.amount_of_stamps"
        />
      </div>
      <div class="group">
        <label for="title">Aantal munten voor 1 zegel</label>
        <input
          class="amount"
          type="number"
          step="1"
          min="1"
          v-model="state.actie.point_for_stamp"
        />
      </div>
      <div class="group">
        <label for="title">Bedrag voor 1 zegel</label>
        <input
          class="amount"
          type="number"
          step="0.01"
          v-model="state.actie.stamp_price"
        />
      </div>
      <div class="group check">
        <label for="nix" class="container">Product prijs zichtbaar:</label>
        <label class="checkbox path buss">
          <input
            name="nix"
            type="checkbox"
            v-model="state.actie.price_visible"
          />
          <svg viewBox="0 0 21 21">
            <path
              d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"
            ></path>
          </svg>
        </label>
      </div>
      <div class="group check">
        <label for="nix" class="container">Fysieke zegels mogelijk:</label>
        <label class="checkbox path buss">
          <input name="nix" type="checkbox" v-model="state.actie.physical" />
          <svg viewBox="0 0 21 21">
            <path
              d="M5,10.75 L8.5,14.25 L19.4,2.3 C18.8333333,1.43333333 18.0333333,1 17,1 L4,1 C2.35,1 1,2.35 1,4 L1,17 C1,18.65 2.35,20 4,20 L17,20 C18.65,20 20,18.65 20,17 L20,7.99769186"
            ></path>
          </svg>
        </label>
      </div>
      <div class="group">
        <label for="title">Basiskleur</label>
        <input class="amount" type="text" v-model="state.actie.maincolor" />
      </div>
      <div class="group">
        <label for="title">Begindatum</label>
        <input class="date" type="date" v-model="state.actie.start_date" />
      </div>
      <div class="group">
        <label for="title">Einddatum</label>
        <input class="date" type="date" v-model="state.actie.end_date" />
      </div>
      <div class="group">
        <div class="img" v-if="state.actie != []">
          <label for="title">Achtergrond zegel locatie</label>
          <ImagePreview :previewImage="state.actie.imgurl" @input="(callback) => {state.actie.imgurl = callback}" />
          <label for="title">Zegelafbeelding</label>
          <ImagePreview :previewImage="state.actie.stamp_imgurl"  @input="(callback) => {state.actie.stamp_imgurl = callback}" />
          <label for="title">Achtergrond pagina</label>
          <ImagePreview :previewImage="state.actie.background_card"  @input="(callback) => {state.actie.background_card = callback}" />
          <label for="title">Voorpagina afbeelding</label>
          <ImagePreview :previewImage="state.actie.front_imgurl" @input="(callback) => {state.actie.front_imgurl = callback}"  />
          <label for="title">Laatste pagina afbeelding</label>
          <ImagePreview :previewImage="state.actie.back_imgurl" @input="(callback) => {state.actie.back_imgurl = callback}"  />
          <label for="title">Lijst afbeelding</label>
          <ImagePreview :previewImage="state.actie.list_image" @input="(callback) => {state.actie.list_image = callback}"  />
        </div>
      </div>
      <div class="group">
        <div class="amount">{{ state.actie.tac }}</div>
      </div>
      <div class="group">
        <div class="amount">{{ state.actie.spaaractie_products }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps, reactive, onMounted, defineEmits, createApp } from "vue";
import ImagePreview from "@/components/Basics/ImagePreview.vue";
import { HTTP } from "@/assets/services/http-common.js";
import VueSimpleAlert from 'vue3-simple-alert';
//import { useStore } from 'vuex'
//const store = useStore()

const app = createApp({});
app.use(VueSimpleAlert);
const props = defineProps({
  actie: Object,
});

const state = reactive({
  actie: {
    title: '',
    koptekst: '',
    description: '',
    slug: '',
    amount_of_stamps: 0,
    point_for_stamp: 0,
    stamp_price: 0,
    price_visible: false,
    physical: false,
    maincolor: '',
    start_date: new Date(),
    end_date: new Date(),
    imgurl: '',
    stamp_imgurl: '',
    background_card: '',
    front_imgurl: '',
    list_image: '',
    tac: '',
    spaaractie_products: [],
  },
  edit: true,
});

onMounted(() => {
  console.log(props.actie.spaaractie_id != null)
  if(props.actie.spaaractie_id != null){
    state.actie = props.actie;
  }
  console.log(state.actie);
});

function updateActie() {
  if(props.actie.spaaractie_id == null){
    HTTP.post("spaaractie", state.actie)
    .then(() => {
      app.$alert(
          'Actie succesvol aangemaakt',
          '',
          'info',
          {
              confirmButtonText: 'Ok',
              confirmButtonColor: '#F58320',
              cancelButtonColor: '#e4e4e4',
              timer: 5000,
          }
      )
      .then(()=>{
          emit('finished', true)
      })
    })
    .catch((err) => {      
      app.$alert(
          `Er ging iets fout: ${err}`,
          '',
          'warning',
          {
              confirmButtonText: 'Ok',
              confirmButtonColor: '#F58320',
              cancelButtonColor: '#e4e4e4',
              timer: 5000,
          }
      )
    });
  }
  else{
    HTTP.put("spaaractie", state.actie)
    .then(() => {      
      app.$alert(
          'Actie succesvol geupdate',
          '',
          'info',
          {
              confirmButtonText: 'Ok',
              confirmButtonColor: '#F58320',
              cancelButtonColor: '#e4e4e4',
              timer: 5000,
          }
      )
    })
    .catch((err) => {  
      app.$alert(
            `Er ging iets fout: ${err}`,
            '',
            'warning',
            {
                confirmButtonText: 'Ok',
                confirmButtonColor: '#F58320',
                cancelButtonColor: '#e4e4e4',
                timer: 5000,
            }
        )
    });
  }
}
const emit = defineEmits(["finished"]);
</script>
<style scoped lang="scss">
.actie {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  overflow-y: scroll;
}
.product > * {
  max-width: 60%;
  white-space: break-spaces;
}
.product > img {
  width: 40%;
}
.product .modal-overlay {
  max-width: 100%;
}

.actie{
  overflow-y: hidden;
}

.actie .buttons{
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  border-bottom: 2px solid #aaaaaa;
}
.actie .edit {
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;
  align-content: space-around;
  justify-content: flex-start;
  width: 98%;
  height: 90%;
  overflow-y: scroll;
}
.actie .basic {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: space-around;
  justify-content: flex-start;
}

.actie .edit .group {
  text-align: left;
  width: 96%;
  padding-bottom: 10px;
}
.actie .edit .group.check {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  align-content: flex-start;
  flex-wrap: nowrap;
}
.actie .edit .group label {
  width: 100%;
  font-size: 1.2rem;
}
.actie .edit .group textarea {
  width: 96%;
}
.actie .edit .group input[type="text"] {
  width: 90%;
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
</style>
