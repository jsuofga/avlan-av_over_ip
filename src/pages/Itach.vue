<template>
  <div class="itach-container">
    <v-card class="itach-card" elevation="4">
      <v-card-title class="text-h6 text-center">
        Add Global Cache iTach
      </v-card-title>
      
      <div class="text-center my-2">
        <img src="@/assets/itach.png" alt="iTach Device" class="itach-image" />
      </div>
      
      <v-card-text>
        <div class="field mb-4">
          <v-select
            v-model="selected"
            :items="countOptions"
            label="Count of Set Top Boxes you need to IR Control - you will need 1 iTach for every 3 Set Top Boxes"
            variant="outlined"
          ></v-select>
          <div v-if="selected" class="text-center mt-2">
            <v-icon>mdi-set-top-box</v-icon> {{selected}}
          </div>
        </div>

        <div class="field mb-4">
          <v-text-field
            v-model.trim="itachIP"
            label="IP Address of iTach"
            placeholder="192.168.1.xx"
            variant="outlined"
            maxlength="15"
            :disabled="!selected || !canAddMore"
            :error="!!generalError"
            :error-messages="generalError"
          >
            <template v-slot:append-inner>
              <v-btn icon size="small" @click="add" color="blue" :disabled="!selected || !canAddMore">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </div>

        <div class="list-grid">
          <v-card
            v-for="(item, index) in itachIPs"
            :key="index"
            class="grid-item"
            elevation="1"
          >
            <v-card-text class="pa-2">
              <div class="d-flex justify-space-between align-center mb-2">
                <label class="text-caption">Global Cache iTach {{index+1}}</label>
                <v-btn icon size="x-small" @click="trash(index)" color="red">
                  <v-icon size="small">mdi-delete</v-icon>
                </v-btn>
              </div>
              <div class="text-center mb-2">
                <img src="@/assets/itach.png" alt="iTach" class="itach-grid-image" />
              </div>
              <v-text-field
                v-model="itachIPs[index]"
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

        <!-- Warning alert when insufficient iTach devices -->
        <v-alert
          v-if="selected && itachIPs.length > 0 && itachIPs.length < maxItachAllowed"
          type="warning"
          density="compact"
          class="mt-4"
        >
          You need {{maxItachAllowed - itachIPs.length}} more iTach device(s). 
          Total required: {{maxItachAllowed}} iTach for {{selected}} set-top boxes.
        </v-alert>

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
  name: 'Itach',

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
      itachIP: null,
      itachIPs: [],
      selected: '',
      count: [...Array(24).keys()],
      feedbackMessages: [],
      generalError: '',
      saveError: ''
    }
  },
  computed: {
    countOptions() {
      return this.count.map(i => i + 1)
    },
    maxItachAllowed() {
      if (!this.selected) return 0
      return Math.ceil(this.selected / 3)
    },
    canAddMore() {
      return this.itachIPs.length < this.maxItachAllowed
    }
  },

  watch: {
    selected() {
      this.generalError = ''
    },
    itachIP() {
      if (this.generalError && this.itachIP) {
        this.generalError = ''
      }
    }
  },
  methods: {
    async loadExistingConfig() {
      const config = await this.stateStore.loadItachConfig()
      
      if (config) {
        this.itachIPs = config.itachIPs
        this.selected = config.set_top_box_count
      }
    },

    isValidIP(ip) {
      const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/
      return ipv4Regex.test(ip)
    },

    add() {
      this.generalError = ''
      
      if (!this.selected) {
        this.generalError = 'Please select the number of set-top boxes first'
        return
      }
      
      if (!this.canAddMore) {
        this.generalError = `Maximum ${this.maxItachAllowed} iTach allowed for ${this.selected} set-top boxes (3 set-top boxes per iTach)`
        return
      }
      
      if (this.isValidIP(this.itachIP)) {
        this.itachIPs.push(this.itachIP)
        this.itachIP = ''
        this.generalError = ''
      } else {
        this.generalError = 'Enter Valid IP Address'
      }
    },

    trash(index) {
      this.itachIPs.splice(index, 1)
      this.feedbackMessages.splice(index, 1)
    },

    validateItem(index) {
      const ip = this.itachIPs[index] || ''
      if (!this.isValidIP(ip)) {
        this.feedbackMessages[index] = 'Invalid IP format'
      } else {
        this.feedbackMessages[index] = ''
      }
    },

    async save() {
      this.saveError = ''
      
      if (!this.selected) {
        this.saveError = 'Please select the number of set-top boxes'
        return
      }
      
      if (this.itachIPs.length === 0) {
        this.saveError = 'Please add at least one iTach IP address'
        return
      }
      
      const requiredItach = Math.ceil(this.selected / 3)
      if (this.itachIPs.length < requiredItach) {
        this.saveError = `You need ${requiredItach} iTach device(s) for ${this.selected} set-top boxes (3 per iTach)`
        return
      }
      
      let hasInvalid = false
      this.itachIPs.forEach((ip, index) => {
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

      const serverURL = `${location.hostname}:3000`

      try {
        let itachAddresses = {}
        this.itachIPs.forEach((item, index) => {
          itachAddresses[`itach${index+1}_ipaddress`] = item
        })
        
        itachAddresses.set_top_box_count = this.selected
        await fetch(`http://${serverURL}/write/UserItachIPs/${JSON.stringify(itachAddresses)}`)
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
.itach-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #121212;
  padding: 20px;
}

.itach-card {
  width: 90%;
  max-width: 1200px;
  padding: 20px;
}

.itach-image {
  max-width: 150px;
  height: auto;
}

.itach-grid-image {
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
