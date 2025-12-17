<template>
  <div class="ipaddress container">
    <v-card class="ip-card" elevation="4">
      <v-card-title class="text-h6 text-center">
        Cisco Switch IP Address
      </v-card-title>
      
      <v-card-text>
        <h6 v-if="stateStore.status.model" class="text-center mb-2">{{stateStore.status.model}}</h6>
        <h6 class='red-text text-center mb-4'>Re-power Cisco Switch before proceeding!</h6>
        
        <v-text-field
          id="ipAddress"
          v-model.trim="ipAddress" 
          label="IP Address"
          placeholder="192.168.1.128" 
          variant="outlined"
          @input="clearFeedback"
          :error="!!feedbackMessage"
        ></v-text-field>
        
        <p class='feedback text-center' v-if="feedbackMessage">{{feedbackMessage}}</p>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn color="red" @click="cancel" variant="flat" class="mx-2">
          <span style="color: white;">Cancel</span>
        </v-btn>
        <v-btn color="blue" @click="connect" variant="flat" class="mx-2">
          <span style="color: white;">Connect</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { useStateStore } from '@/stores/stateStores'

export default {
  name: 'Ipaddress',
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
    async created() {
    // Load existing IP if available
    await this.stateStore.get_UserSwitchConfig()
  },
  data () {
    return {
        feedbackMessage: null
    }
  },
  computed: {
    ipAddress: {
      get() {
        return this.stateStore.switch_ipAddress
      },
      set(value) {
        this.stateStore.switch_ipAddress = value
      }
    }
  },

  methods:{

    clearFeedback() {
      this.feedbackMessage = null
    },

    cancel(){
        this.$router.push({name:'home'})
    },

    isValidIP(ip) {
      // Regex for IPv4 validation
      const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/
      return ipv4Regex.test(ip)
    },

    async connect(){
      // Clear any previous feedback
      this.feedbackMessage = null

      // Validate IP address is not empty
      if (!this.ipAddress) {
        this.feedbackMessage = "Please enter an IP address for the Cisco Switch"
        return
      }

      // Validate IP address format
      if (!this.isValidIP(this.ipAddress)) {
        this.feedbackMessage = "Invalid IP address format. Please use format like 192.168.1.128"
        return
      }

      const serverURL = location.hostname
      
      try {
        // Save switch config to server
        const switchIP = {
          ip: this.ipAddress
        }
        
        await fetch(`http://${serverURL}:3000/write/UserSwitchConfig/${JSON.stringify(switchIP)}`)
        
        // Show success message
        this.feedbackMessage = "Switch configuration saved successfully!"
        
        // Navigate to dashboard after short delay
        setTimeout(() => {
          this.$router.push({name:'dashboard'})
        }, 1000)
        
      } catch (error) {
        console.error('Error saving switch config:', error)
        this.feedbackMessage = "Error saving switch configuration. Please try again."
      }
    },
  },

}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.ipaddress {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #121212;
}

.container{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.ip-card {
  width: 50%;
  max-width: 600px;
  min-width: 400px;
  padding: 20px;
}

h4 {
  color: #333;
  margin: 0;
}

h6 {
  color: #666;
  margin: 0;
}

.red-text {
  color: #f44336;
  font-weight: 500;
}

.feedback{
  color: #f44336;
  font-weight: 500;
  margin-top: 10px;
}

</style>
