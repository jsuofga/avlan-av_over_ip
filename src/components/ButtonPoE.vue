<template>

  <v-btn-toggle v-if="/-.*p/i.test(stateStore.status.model)"  id="poe-btn-toggle" rounded="xl" variant="outlined">
    <v-btn size="x-large" @click= "stateStore.poe_on_off('on')">
      <v-icon color="green">mdi-power</v-icon>
      <small class="text-green">PoE On</small>
    </v-btn>
    <v-btn size="x-large" @click= "stateStore.poe_on_off('off')">
      <v-icon color="red">mdi-power</v-icon>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <small class="text-red">PoE Off</small>
        <small v-if = "stateStore.status.offtime !== ''" style="font-size: 0.5em; color: #fff; font-weight: 300;">{{stateStore.status.offtime }}</small>

    </div>
    </v-btn>
  </v-btn-toggle>
</template>

<script>
import { useStateStore } from '../stores/stateStores';

export default {
  name: 'ButtonPoE',
   setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
};
</script>

<style scoped>
  #poe-btn-toggle {
    position: fixed;
    left: 20px;
    bottom: 10px;
    z-index: 9999;
  }

</style>
