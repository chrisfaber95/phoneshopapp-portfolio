
<script setup>
    import Klantenkaart from '@/components/Basics/Klantenkaart.vue'

</script>
<template>
  <div class="postregister">
    <div class="pretext" v-html="`
    Welkom superspaarder!
    1. QR-code bij je aankopen tonen. 
    2. MEDEWERKER scant de code. 
    3. GRATIS zegels worden bijgeschreven.`"></div>
    <div class="firstcard">
      <Klantenkaart />
    </div>     
		<router-link class='login' :to="'/login'">Inloggen</router-link>
  </div>
</template>
<style lang="scss" scoped>
  .pretext{
    white-space: pre-line;
    line-height: 1.3rem;
    margin-top: -10px;
  }
.postregister{
      display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: center;
    align-items: center;
    flex-wrap: nowrap;
    overflow-y: scroll;
}
.firstcard{
  width: 100%;
  height: fit-content;
}
  .login{
    background-color: var(--base-color);
    border: 2px solid var(--base-color);
    border-radius: 0.25rem;
    box-shadow: 4px 4px 3px 0px #00000066;
    -webkit-box-shadow: 4px 4px 3px 0px #00000066;
    padding: 10px;
    font-size: 1.5rem;
    font-weight: 600;
    color: #000000;
  }
</style>