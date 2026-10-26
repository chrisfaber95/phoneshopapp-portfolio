<template>
    <div class="laser">        
        <div class="laser-bar">
            <div class="line"></div>
          </div>
    </div>
</template>

<script setup>

</script>

<style scoped>
.laser-bar {
    width: 100%;
    height: 2px;
    position: absolute;
    overflow: hidden;
  }
  .line {
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: red;
    transform: translateY(-100%);
    animation: laser-bar 1s linear infinite;
  }
  p {
    margin-top: 10px;
  }
  @keyframes laser-bar {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(100%);
    }
  }
</style>