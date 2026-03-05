<template>
  <div class="dtv-container">
    <v-card class="dtv-card" elevation="4">
      <v-card-title class="text-h6 text-center">
        Add Directv STB
      </v-card-title>
      
      <div class="text-center my-2">
         <v-icon size="80">mdi-set-top-box</v-icon> 
      </div>
      
      <v-card-text>

        <div class="field mb-4">
          <v-text-field
            v-model.trim="dtvIP"
            label="IP Address of DTV STB"
            placeholder="192.168.1.xx"
            variant="outlined"
            maxlength="15"
            :error="!!generalError"
            :error-messages="generalError"
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
            v-for="(item, index) in dtvIPs"
            :key="index"
            class="grid-item"
            elevation="1"
          >
            <v-card-text class="pa-2">
              <div class="d-flex justify-space-between align-center mb-2">
                <label class="text-caption">Directv STB {{index+1}}</label>
                <v-btn icon size="x-small" @click="trash(index)" color="red">
                  <v-icon size="small">mdi-delete</v-icon>
                </v-btn>
              </div>
              <div class="text-center mb-2">
                <!-- <img src="@/assets/itach.png" alt="iTach" class="itach-grid-image" /> -->
                 <v-icon size="80">mdi-set-top-box</v-icon> 

              </div>
              <v-text-field
                v-model="dtvIPs[index]"
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
    // Component created lifecycle hook
    this.loadExistingConfig()
  },
  data() {
    return {
      dtvIP: null,
      dtvIPs: [],
      feedbackMessages: [],
      generalError: '',
      saveError: ''
    }
  },
  computed: {

  },

  watch: {

    dtvIP() {
      if (this.generalError && this.dtvIP) {
        this.generalError = ''
      }
    }
  },
  methods: {
    async loadExistingConfig() {
      const config = await this.stateStore.load_DTV_Config()
      
      if (config) {
        this.dtvIPs = config.dtvIPs
      }
    },

    isValidIP(ip) {
      const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/
      return ipv4Regex.test(ip)
    },

    add() {
      this.generalError = ''

      
      if (this.isValidIP(this.dtvIP)) {
        this.dtvIPs.push(this.dtvIP)
        this.dtvIP = ''
        this.generalError = ''
      } else {
        this.generalError = 'Enter Valid IP Address'
      }
    },

    trash(index) {
      this.dtvIPs.splice(index, 1)
      this.feedbackMessages.splice(index, 1)
    },

    validateItem(index) {
      const ip = this.dtvIPs[index] || ''
      if (!this.isValidIP(ip)) {
        this.feedbackMessages[index] = 'Invalid IP format'
      } else {
        this.feedbackMessages[index] = ''
      }
    },

    async save() {

      const serverURL = `${location.hostname}:1880`
      this.saveError = ''
      
      if (this.dtvIPs.length === 0) {
        this.saveError = 'Removing ALL IP Controls '
        let dtvAddresses = {}
        await fetch(`http://${serverURL}/write/User_DTV_IPs/${JSON.stringify(dtvAddresses)}`)
        this.$router.push({ name: 'home' })
        return
      }
     
      let hasInvalid = false
      this.dtvIPs.forEach((ip, index) => {
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
        let dtvAddresses = {}
        this.dtvIPs.forEach((item, index) => {
          dtvAddresses[`dtv${index+1}_ipaddress`] = item
        })
        
        await fetch(`http://${serverURL}/write/User_DTV_IPs/${JSON.stringify(dtvAddresses)}`)
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
.dtv-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #121212;
  padding: 20px;
}

.dtv-card {
  width: 90%;
  max-width: 1200px;
  padding: 20px;
}

.dtv-image {
  max-width: 150px;
  height: auto;
}

.dtv-grid-image {
  max-width: 80px;
  height: auto;
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
