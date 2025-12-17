<template>
  <div class="video-inputs-page">
    <v-card class="video-inputs-card" elevation="0">
      <v-card-title class="video-inputs-title">
        Select Video for - {{ selectedDisplayName }}
      </v-card-title>
      
      <v-card-text class="video-inputs-content">
        <div class="inputs-grid">
          <v-btn
            v-for="(input, index) in stateStore.inputNames"
            :key="index"
            class="input-button"
            variant="outlined"
            color="white"
            @click="selectInput(index + 1)"
          >
            <div class="button-content">
              <span class="input-number">P{{ index + 1 }}</span>
              <span class="input-name">{{ input }}</span>
              <!-- <span class="input-vlan">{{ getInputVlan(index) }}</span> -->
            </div>
            <v-btn
              v-if="stateStore.videoInputsWithRemoteAccess[index]"
              icon
              size="x-small"
              class="corner-button"
              color="blue"
              @click.stop="openRemote(index)"
            >
              <v-icon size="small">mdi-remote</v-icon>
            </v-btn>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Snackbar for feedback -->
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      color="blue"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script>
import { useStateStore } from '@/stores/stateStores'

export default {
  name: 'VideoInputs',
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
  async created() {
    // 
    await this.stateStore.get_inputNames()
    await this.stateStore.loadItachConfig()
  },
  data() {
    return {
      snackbar: false,
      snackbarMessage: ''
    }
  },
  computed: {
    selectedDisplayId() {
      return this.stateStore.selectedDisplay.rxId
    },
    selectedDisplayName() {
      return this.stateStore.selectedDisplay.name || 'Display'
    }
  },
  methods: {
    getInputVlan(index) {
      if (this.stateStore.status.PortVlanMembership && 
          this.stateStore.status.PortVlanMembership[index]) {
        return this.stateStore.status.PortVlanMembership[index]
      }
      return ''
    },
    selectInput(inputId) {
      const inputName = this.stateStore.inputNames[inputId - 1]
      this.snackbarMessage = `${this.selectedDisplayName} to ${inputName}`
      this.snackbar = true
      
      // Switch the display to the selected input
      this.stateStore.switchDisplay(inputId)
    },
    openRemote(index) {
      this.stateStore.remoteSelectedIndex = index
      this.$router.push({ name: 'remotecontrol', params: { remote: index + 1 } })
    }
  },

}
</script>

<style scoped>
.video-inputs-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow-x: hidden;
}

.video-inputs-card {
  width: 100vw;
  height: 100vh;
  max-width: 100%;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  background-color: transparent;
}

.video-inputs-title {
  font-size: 2rem !important;
  font-weight: bold;
  text-align: center;
  padding: 20px;
  background-color: transparent;
  color: white;
}

.video-inputs-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.inputs-grid {
  display: grid;
  grid-template-columns: repeat(5, 120px);
  gap: 20px;
  width: 100%;
  justify-content: center;
}

.input-button {
  height: 120px;
  width: 120px;
  position: relative;
  border-radius: 10px;
  border: 1px solid white !important;
}

.input-button:hover {
  border: 1px solid rgb(0,122,255) !important;
  color: rgb(0,122,255);
}

.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.input-number {
  position: absolute;
  top: 0;
  left: 0.8em;
  font-size: 0.8rem;
  font-weight: normal;
  color: white;
}

.input-name {
  font-size: 0.75rem;
  font-weight: normal;
  color: white;
  text-align: center;
}

.input-vlan {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: white;
}

.corner-button {
  position: absolute;
  bottom: 0;
  right: 0;
  transform: translate(50%, 50%);
  z-index: 10;
}

/* iPad landscape specific optimizations (1024x768) */
@media screen and (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
  .video-inputs-title {
    font-size: 2.8rem;
    padding: 24px;
  }
  
  .video-inputs-content {
    padding: 32px;
  }
}

/* iPad Pro landscape (1366x1024) */
@media screen and (min-width: 1366px) and (orientation: landscape) {
  .video-inputs-title {
    font-size: 3rem;
    padding: 28px;
  }
  
  .video-inputs-content {
    padding: 40px;
  }
}
</style>
