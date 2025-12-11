<template>
  <div class="remote-control-container">
    <v-card class="remote-control-card" elevation="4">
      <v-card-title class="text-h6 text-center" style="color: white;">
        Remote for {{remoteName}}
      </v-card-title>
      
      <v-card-text>
        <!-- Power and Navigation Grid -->
        <div class="grid-container1">
          <div class="grid-item1">
            <v-btn icon size="large" @click="otherBtnPressed('on')" color="green" id="power-on">
              <v-icon size="large">mdi-power</v-icon>
            </v-btn>
          </div>
          <div class="grid-item1"></div>
          <div class="grid-item1">
            <v-btn icon size="large" @click="otherBtnPressed('cursor_up')">
              <v-icon size="x-large">mdi-chevron-up</v-icon>
            </v-btn>
          </div>
          <div class="grid-item1"></div>
          <div class="grid-item1">
            <v-btn icon size="large" @click="otherBtnPressed('off')" color="red" id="power-off">
              <v-icon size="large">mdi-power</v-icon>
            </v-btn>
          </div>
          <div class="grid-item1"></div>
          <div class="grid-item1">
            <v-btn icon size="large" @click="otherBtnPressed('cursor_left')">
              <v-icon size="x-large">mdi-chevron-left</v-icon>
            </v-btn>
          </div>
          <div class="grid-item1">
            <v-btn class="round-btn select-btn" size="x-large" color="yellow" @click="otherBtnPressed('cursor_enter')" variant="flat">
              Select
            </v-btn>
          </div>
          <div class="grid-item1">
            <v-btn icon size="large" @click="otherBtnPressed('cursor_right')">
              <v-icon size="x-large">mdi-chevron-right</v-icon>
            </v-btn>
          </div>
          <div class="grid-item1"></div>
          <div class="grid-item1"></div>
          <div class="grid-item1"></div>
          <div class="grid-item1">
            <v-btn icon size="large" @click="otherBtnPressed('cursor_down')">
              <v-icon size="x-large">mdi-chevron-down</v-icon>
            </v-btn>
          </div>
          <div class="grid-item1"></div>
          <div class="grid-item1"></div>
        </div>

        <!-- Menu and Number Pad Grid -->
        <div class="grid-container2">
          <div class="grid-item2">
            <v-btn @click="otherBtnPressed('guide')" variant="flat" color="blue" class="btn-control">
              <span style="color: white;">Guide</span>
            </v-btn>
          </div>
          <div class="grid-item2">
            <v-btn class="round-btn" @click="numberBtnPressed(1)" variant="flat">1</v-btn>
          </div>
          <div class="grid-item2">
            <v-btn class="round-btn" @click="numberBtnPressed(2)" variant="flat">2</v-btn>
          </div>
          <div class="grid-item2">
            <v-btn class="round-btn" @click="numberBtnPressed(3)" variant="flat">3</v-btn>
          </div>
          <div class="grid-item2">
            <v-btn icon size="large" @click="otherBtnPressed('ch_up')">
              <v-icon size="x-large">mdi-chevron-up</v-icon>
            </v-btn>
          </div>
          
          <div class="grid-item2">
            <v-btn @click="otherBtnPressed('menu')" variant="flat" color="blue" class="btn-control">
              <span style="color: white;">Menu</span>
            </v-btn>
          </div>
          <div class="grid-item2">
            <v-btn class="round-btn" @click="numberBtnPressed(4)" variant="flat">4</v-btn>
          </div>
          <div class="grid-item2">
            <v-btn class="round-btn" @click="numberBtnPressed(5)" variant="flat">5</v-btn>
          </div>
          <div class="grid-item2">
            <v-btn class="round-btn" @click="numberBtnPressed(6)" variant="flat">6</v-btn>
          </div>
          <div class="grid-item2 channel-label">Channel</div>
          
          <div class="grid-item2"></div>
          <div class="grid-item2">
            <v-btn class="round-btn" @click="numberBtnPressed(7)" variant="flat">7</v-btn>
          </div>
          <div class="grid-item2">
            <v-btn class="round-btn" @click="numberBtnPressed(8)" variant="flat">8</v-btn>
          </div>
          <div class="grid-item2">
            <v-btn class="round-btn" @click="numberBtnPressed(9)" variant="flat">9</v-btn>
          </div>
          <div class="grid-item2">
            <v-btn icon size="large" @click="otherBtnPressed('ch_down')">
              <v-icon size="x-large">mdi-chevron-down</v-icon>
            </v-btn>
          </div>
          
          <div class="grid-item2">
            <v-btn @click="otherBtnPressed('exit')" variant="flat" color="blue" class="btn-control">
              <span style="color: white;">Exit</span>
            </v-btn>
          </div>
          <div class="grid-item2"></div>
          <div class="grid-item2">
            <v-btn class="round-btn" @click="numberBtnPressed(0)" variant="flat">0</v-btn>
          </div>
          <div class="grid-item2"></div>
          <div class="grid-item2">
            <v-btn @click="otherBtnPressed('enter')" variant="flat" color="blue" class="btn-control">
              <span style="color: white;">Enter</span>
            </v-btn>
          </div>
        </div>

        <!-- Favorite Channels Grid -->
        <div class="grid-container3">
          <div v-for="(item, index) in favChNames" :key="index" class="grid-item3">
            <v-btn @click="favoriteBtnPressed(index)" variant="flat" class="btn-favs">
              <div class="fav-content">
                <div>{{favChNames[index]}}</div>
                <div class="text-caption">{{favChStations[index]}}</div>
              </div>
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
    
    <!-- Snackbar for feedback -->
    <v-snackbar
      v-model="snackbar"
      :timeout="2000"
      color="blue"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script>
import { useStateStore } from '@/stores/stateStores'

export default {
  name: 'RemoteControl',
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
  async created() {
    // Load favorite channels data
    await this.stateStore.loadUserFavChannels()
  },
  
  data() {
    return {
      numberPressed: null,
      btnPressed: null,
      snackbar: false,
      snackbarMessage: ''
    }
  },
  computed: {
    remoteName() {
      return this.stateStore.inputNames[this.stateStore.remoteSelectedIndex] || 'Remote'
    },
    favChNames() {
      return this.stateStore.favChNames
    },
    favChStations() {
      return this.stateStore.favChStations
    },
    unit() {
      // remoteSelectedIndex is 0-based, convert to 1-based for calculation
      const remoteNum = this.stateStore.remoteSelectedIndex + 1
      return Math.trunc(remoteNum / 4) + 1  // itach unit number (3 ports per unit)
    },
    port() {
      // remoteSelectedIndex is 0-based, convert to 1-based for calculation
      const remoteNum = this.stateStore.remoteSelectedIndex + 1
      // itach port number
      if ((remoteNum % 3) != 0) {
        return remoteNum % 3
      } else {
        return 3
      }
    }
  },

  methods: {
    numberBtnPressed(_number) {
      this.numberPressed = `btn_${_number}`
      const serverURL = `${location.hostname}:1880`
      this.snackbarMessage = 'IR sent'
      this.snackbar = true
      console.log(`http://${serverURL}/sendir/unit/${this.unit}/port/${this.port}/ir/${this.numberPressed}`)
      fetch(`http://${serverURL}/sendir/unit/${this.unit}/port/${this.port}/ir/${this.numberPressed}`)
    },
    otherBtnPressed(_button) {
      this.btnPressed = `btn_${_button}`
      const serverURL = `${location.hostname}:1880`
      this.snackbarMessage = 'IR sent'
      this.snackbar = true
      console.log(`http://${serverURL}/sendir/unit/${this.unit}/port/${this.port}/ir/${this.btnPressed}`)
      fetch(`http://${serverURL}/sendir/unit/${this.unit}/port/${this.port}/ir/${this.btnPressed}`)
    },
    favoriteBtnPressed(_favorite) {
      let favCh = this.favChStations[_favorite]
      const serverURL = `${location.hostname}:1880`
      this.snackbarMessage = 'IR sent'
      this.snackbar = true
      console.log(`http://${serverURL}/sendir/unit/${this.unit}/port/${this.port}/irfavorite/${favCh}`)
      fetch(`http://${serverURL}/sendir/unit/${this.unit}/port/${this.port}/irfavorite/${favCh}`)
    }
  }
}
</script>

<style scoped>
.remote-control-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  /* padding: 20px; */
  position: relative;
}

.remote-control-card {
  width: 90%;
  max-width: 600px;
  /* padding: 20px; */
  background-color: transparent !important;
}

.grid-container1 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  justify-content: center;
  align-items: center;
  grid-gap: 8px;
  padding: 10px 20px;
  margin: 10px 0;
  min-height: 200px;
}

.grid-container2 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  justify-content: center;
  align-items: center;
  grid-gap: 8px;
  padding: 10px 20px;
  margin: 10px 0;
  border-bottom:1px solid white;
  min-height: 280px;
  margin-bottom: 5px;
}

.grid-container3 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  justify-content: start;
  align-items: start;
  grid-gap: 8px;
  padding: 10px 20px;
  margin: 10px 0;
  margin-top: 0;
}

.grid-item1,.grid-item2{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.grid-item3 {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
}
.round-btn {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  height: 50px;
  width: 50px;
  min-height: 50px;
  min-width: 50px;
  border-radius: 50% !important;
  background-color: black;
  color: white;
  padding: 0 !important;
}

.select-btn {
  height: 70px !important;
  width: 70px !important;
  min-height: 70px !important;
  min-width: 70px !important;
  font-size: 1.1rem !important;
}

.btn-control {
  border-radius: 6px;
  width: 80%;
  min-width: 60px;
}

.btn-favs {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border:1px solid white;
  width: 100%;
  border-radius: 6px;
}
.fav-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.channel-label {
  color: white;
  font-size: 0.875rem;
}

#power-on :deep(.v-icon) {
  color: white;
}

#power-off :deep(.v-icon) {
  color: white;
}

.fab-home {
  position: fixed;
  bottom: 30px;
  right: 30px;
}
</style>
