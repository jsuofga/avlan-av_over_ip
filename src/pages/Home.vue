<template>
  <div class="home-container">
    <div v-if="stateStore.status.PoE === 0"  id ="banner-poe">
      <v-banner
        color="warning"
        icon="mdi-power-plug-off"
        lines="one"
        class="mb-2 d-flex flex-column justify-center align-center"
        style="max-width: 500px; width: 100%; text-align: center;"
      >
        <template v-slot:text>
          <div style="width: 100%; text-align: center;">{{ poweringOn ? 'Powering ON' : 'PoE Power is OFF' }}</div>
        </template>
        <template v-slot:actions>
          <v-btn color="green" variant="outlined" @click="handlePoEOn" :disabled="poweringOn">
            Turn PoE On
          </v-btn>
        </template>
      </v-banner>
    </div>

      <div v-if= "stateStore.zoneNames.length === 0" class="home-title">
        <h3>Welcome</h3>
        <h3>Goto settings to add displays to system</h3>
      </div>
      <div v-else-if= "stateStore.zoneNames.length === 1" class = "single-zone" >
            <div @click= "showZone(item,index)" class = " roundBtn btn-large" v-for="(item,index) in stateStore.zoneNames" :key="index">{{stateStore.zoneNames[index]}}</div>
            <div @click= "switchAll" data-target="slide-out" class="roundBtn btn-large ">ALL TVs</div>
      </div>
      <div v-else class = "zone" >
          <div @click= "showZone(item,index)" class = " roundBtn btn-large" v-for="(item,index) in stateStore.zoneNames" :key="index">{{stateStore.zoneNames[index]}}</div>
          <div @click= "switchAll" data-target="slide-out" class="roundBtn btn-large ">ALL</div>
     </div>

     <v-btn
      fab
      fixed
      bottom
      right
      color="blue"
      size="large"
      class="fab-button"
      icon
      @click="showPresetMenu"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>

    <v-menu
      v-model="presetMenu"
      :close-on-content-click="false"
      location="top"
      :offset="60"
    >
      <template v-slot:activator="{ props }">
        <div v-bind="props" class="menu-activator"></div>
      </template>
      
      <v-list class="preset-list">
        <v-btn 
          v-if="stateStore.preset1Created" 
          @click="switchPreset(1)"
          class="preset-btn preset-1"
          rounded="xl"
          size="large"
        >
          Preset 1
        </v-btn>
        <v-btn 
          v-if="stateStore.preset2Created" 
          @click="switchPreset(2)"
          class="preset-btn preset-2"
          rounded="xl"
          size="large"
        >
          Preset 2
        </v-btn>
        <v-btn 
          v-if="stateStore.preset3Created" 
          @click="switchPreset(3)"
          class="preset-btn preset-3"
          rounded="xl"
          size="large"
        >
          Preset 3
        </v-btn>
        <v-btn 
          @click="switchMix"
          class="preset-btn preset-mix"
          rounded="xl"
          size="large"
        >
          Mix
        </v-btn>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import { useStateStore } from '@/stores/stateStores'

export default {
  name: 'Home',
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
  data() {
    return {
      speedDial: false,
      presetMenu: false,
      poweringOn: false
    }
  },
  created() {
    // Check which presets exist
    this.stateStore.checkPresets()
  },
  methods: {
    async handlePoEOn() {
      this.poweringOn = true
      await this.stateStore.poe_on_off('on')
      setTimeout(() => {
        this.poweringOn = false
      }, 5000)
    },
    showZone(item, index) {
      this.$router.push({ name: 'zone', params: { index: index } })
    },
    switchAll() {
      this.stateStore.selectedDisplay = {
        rxId: 'all',
        name: 'ALL TVs'
      }
      this.$router.push({ name: 'videoinputs' })
    },
    showPresetMenu() {
      this.presetMenu = true
    },
    async switchPreset(preset) {
      const result = await this.stateStore.switchPreset(preset)
      this.presetMenu = false
    },
    async switchMix() {
      await this.stateStore.switchMix()
    }
  }
}
</script>

<style scoped>
body, html {

}
.home-container {
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.home-title {
  color: white;
  text-align: center;
}
.single-zone{
    display: grid;
    grid-template-columns: repeat(2,auto);
    grid-column-gap: 50px;
    justify-content: center;
    align-items: center;
    height:100vh;
}
.zone{
    display: grid;
    grid-template-columns: repeat(4,auto);
    grid-column-gap: 25px;
    justify-content: center;
    align-items: center;
    height:90vh;
}
.roundBtn{
   display: flex;
   flex-direction: row;
   justify-content: center;
   align-items: center;
   font-size: 1.5rem;
   height:150px;
   width:150px;
   border-radius: 50%;
   background-color: black ;
   color: white;
}
.roundBtn:hover {
  background-color:#2196f3 !important;
}

.fab-button {
  position: fixed !important;
  bottom: 80px;
  right: 24px;
}

.menu-activator {
  position: fixed;
  bottom: 80px;
  right: 24px;
  pointer-events: none;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: transparent !important;
}

.preset-list :deep(.v-list) {
  background: transparent !important;
  box-shadow: none !important;
}

.preset-list :deep(.v-overlay__content) {
  background: transparent !important;
  box-shadow: none !important;
}

:deep(.v-overlay__content) {
  box-shadow: none !important;
}

.preset-btn {
  font-weight: 600 !important;
  font-size: 1.1rem !important;
  transition: all 0.3s;
  z-index: 10;
  color: white !important;
  text-transform: none !important;
  letter-spacing: normal !important;
}

.preset-1 {
  background-color: #9C27B0 !important;
}

.preset-1:hover {
  background-color: #9C27B0 !important;
  transform: scale(1.05);
}

.preset-2 {
  background-color: #E65100 !important;
}

.preset-2:hover {
  background-color: #E65100 !important;
  transform: scale(1.05);
}

.preset-3 {
  background-color: #76FF03 !important;
}

.preset-3:hover {
  background-color: #76FF03 !important;
  transform: scale(1.05);
}

.preset-mix {
  background-color: #607D8B !important;
}

.preset-mix:hover {
  background-color: #607D8B !important;
  transform: scale(1.05);
}
#banner-poe {
  display: flex; 
  position:absolute;
  justify-content: center; 
  align-items: center; 
  width: 100%; 

}




</style>
