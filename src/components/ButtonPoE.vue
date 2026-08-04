<template>
  <div>
    <v-btn-toggle v-if="/-.*p/i.test(stateStore.status.model)" id="poe-btn-toggle" rounded="xl" variant="outlined">
      <v-btn size="x-large" @click="stateStore.poe_on_off('on')">
        <v-icon color="green">mdi-power</v-icon>
        <small class="text-green">PoE On</small>
      </v-btn>
      <v-btn size="x-large" @click="confirmPoEOff">
        <v-icon color="red">mdi-power</v-icon>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <small class="text-red">PoE Off</small>
          <small v-if="stateStore.status.offtime !== ''" style="font-size: 0.5em; color: #fff; font-weight: 300;">{{ stateStore.status.offtime }}</small>
        </div>
      </v-btn>
    </v-btn-toggle>

    <v-dialog v-model="showConfirmDialog" max-width="400px">
      <v-card class="bg-grey-darken-4 text-white" style="border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;">
        <v-card-title class="text-h6 text-center pt-4">
          Turn PoE OFF?
        </v-card-title>
        <v-card-text class="text-center pb-4 text-grey-lighten-1">
          Are you sure you want to turn PoE power OFF? This will shut down all AV transmitters and receivers.
        </v-card-text>
        <v-card-actions class="justify-center pb-4">
          <v-btn color="grey-lighten-1" variant="text" class="px-4" @click="showConfirmDialog = false">
            Cancel
          </v-btn>
          <v-btn color="red" variant="flat" class="px-4 text-white" @click="executePoEOff">
            Turn PoE OFF
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useStateStore } from '../stores/stateStores';

export default {
  name: 'ButtonPoE',
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
  data() {
    return {
      showConfirmDialog: false
    }
  },
  methods: {
    confirmPoEOff() {
      this.showConfirmDialog = true
    },
    executePoEOff() {
      this.showConfirmDialog = false
      this.stateStore.poe_on_off('off')
    }
  }
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
