<script setup>
import { ref } from 'vue'
import { getEstimation } from '../api';

const username = ref('');
const estimation = ref(null);

async function handleClick() {
  if (!username.value) {
    console.log("Username can't be empty.");
    return;
  }
  estimation.value = await getEstimation(username.value);
}
</script>

<template>
  <div class="container">
    <div>
      <h1>Estimate time</h1>
      <div class="">
        <p>Want to know how much time you spent coding your project ?</p>
      </div>
    </div>
    <div>
        <input class="inputField" v-model="username" placeholder="Enter username" />
    </div>
    <button class="button" @click="handleClick">Get info</button>
    <div v-if="estimation">
      <p>{{ estimation.message }}</p>
      <p>Estimated time: {{ estimation.time }} hours</p>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.inputField {
  width: 200px;
  height: 30px;
  margin: 10px;
}

.button {
  width: 200px;
  margin: 10px;
}

</style>