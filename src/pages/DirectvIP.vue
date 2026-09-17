<template>
  <div class="directv-container">
    <v-card class="directv-card" elevation="4">
      <v-card-title class="text-h6 text-center">
        Add DirecTV IP
      </v-card-title>
      
      <div class="text-center my-2">
        <v-icon size="72" color="blue">mdi-satellite-uplink</v-icon>
      </div>
      
      <v-card-text>
        <div class="field mb-4">
          <v-text-field
            v-model.trim="directvIP"
            label="IP Address of DirecTV"
            placeholder="192.168.1.xx"
            variant="outlined"
            maxlength="15"
            :error="!!generalError"
            :error-messages="generalError"
            @keyup.enter="add"
          >
            <template v-slot:append-inner>
              <v-btn icon size="small" @click="add" color="blue">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </div>

        <div class="list-grid">
          <v-card
            v-for="(item, index) in directvIPs"
            :key="index"
            class="grid-item"
            elevation="1"
          >
            <v-card-text class="pa-2">
              <div class="d-flex justify-space-between align-center mb-2">
                <label class="text-caption">DirecTV {{index+1}}</label>
                <v-btn icon size="x-small" @click="trash(index)" color="red">
                  <v-icon size="small">mdi-delete</v-icon>
                </v-btn>
              </div>
              <div class="text-center mb-2">
                <v-icon size="48" color="blue">mdi-satellite-uplink</v-icon>
              </div>
              <v-text-field
                v-model="directvIPs[index]"
                variant="outlined"
                density="compact"
                maxlength="15"
                @blur="validateItem(index)"
                :error="!!feedbackMessages[index]"
                hide-details="auto"
              ></v-text-field>
              <p class="feedback text-center mt-1" v-if="feedbackMessages[index]">
                {{ feedbackMessages[index] }}
              </p>
            </v-card-text>
          </v-card>
        </div>

        <!-- Save validation error -->
        <v-alert
          v-if="saveError"
          type="error"
          density="compact"
          class="mt-4"
          closable
          :icon="false"
        >
          {{ saveError }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn color="red" @click="cancel" variant="flat" class="mx-2">
          <span style="color: white;">Cancel</span>
        </v-btn>
        <v-btn color="blue" @click="save" variant="flat" class="mx-2">
          <span style="color: white;">Update/Save</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { useStateStore } from '@/stores/stateStores'

export default {
  name: 'DirectvIP',

  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
  created() {
    this.loadExistingConfig()
  },
  data() {
    return {
      directvIP: null,
      directvIPs: [],
      feedbackMessages: [],
      generalError: '',
      saveError: ''
    }
  },

  watch: {
    directvIP() {
      if (this.generalError && this.directvIP) {
        this.generalError = ''
      }
    }
  },
  methods: {
    async loadExistingConfig() {
      if (typeof this.stateStore.loadDirectvConfig === 'function') {
        const config = await this.stateStore.loadDirectvConfig()
        if (config) {
          this.directvIPs = config.directvIPs || []
          return
        }
      }

      try {
        const nodeRedURL = `${location.hostname}:1880`
        const response = await fetch(`http://${nodeRedURL}/read/UserDirectvIPs`)
        const config = await response.json()

        if (config) {
          const directvKeys = Object.keys(config).filter(key => key.startsWith('directv') && key.includes('ipaddress'))
          this.directvIPs = directvKeys.map(key => config[key])
        }
      } catch (error) {
        console.log('No existing DirecTV config found')
      }
    },

    isValidIP(ip) {
      const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/
      return ipv4Regex.test(ip)
    },

    add() {
      this.generalError = ''
      
      if (!this.directvIP) {
        return
      }

      if (this.isValidIP(this.directvIP)) {
        this.directvIPs.push(this.directvIP)
        this.directvIP = ''
        this.generalError = ''
      } else {
        this.generalError = 'Enter Valid IP Address'
      }
    },

    trash(index) {
      this.directvIPs.splice(index, 1)
      this.feedbackMessages.splice(index, 1)
      console.log(this.directvIPs)
    },

    validateItem(index) {
      const ip = this.directvIPs[index] || ''
      if (!this.isValidIP(ip)) {
        this.feedbackMessages[index] = 'Invalid IP format'
      } else {
        this.feedbackMessages[index] = ''
      }
    },

    async save() {
      const nodeRedURL = `${location.hostname}:1880`
      this.saveError = ''
     
      let hasInvalid = false
      this.directvIPs.forEach((ip, index) => {
        if (!this.isValidIP(ip)) {
          this.feedbackMessages[index] = 'Invalid IP format'
          hasInvalid = true
        } else {
          this.feedbackMessages[index] = ''
        }
      })

      if (hasInvalid) {
        this.saveError = 'Please correct invalid IP addresses before saving'
        return
      }

      try {
        let directvAddresses = {}
        this.directvIPs.forEach((item, index) => {
          directvAddresses[`directv${index+1}_ipaddress`] = item
        })
        
        await fetch(`http://${nodeRedURL}/writeUserDirectvIPs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(directvAddresses)
        })
        this.$router.push({ name: 'home' })
      } catch (error) {
        this.saveError = 'Error saving configuration. Please try again.'
      }
    },
    cancel() {
      this.$router.push({ name: 'home' })
    }
  }
}
</script>

<style scoped>
.directv-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #121212;
  padding: 20px;
}

.directv-card {
  width: 90%;
  max-width: 1200px;
  padding: 20px;
}

.field {
  width: 100%;
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin: 20px 0;
}

.grid-item {
  position: relative;
}

.feedback {
  color: #f44336;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>
