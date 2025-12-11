import { defineStore } from 'pinia'

// Centralized stores file — add more stores here as needed.

export const useStateStore = defineStore('stateStore', {
  state: () => ({
    status: {},
    switch_ipAddress: '',
    pingController: null,
    zoneNames: [],
    tvNames: [],
    tvZones: [],
    tvZonesId: [],
    txCount:0,
    rxCount:0,
    inputNames: [],
    selectedDisplay: {
      rxId: null,
      name: ''
    },
    selectedInput: null,
    preset1Created: false,
    preset2Created: false,
    preset3Created: false,
    iTachUnits: [],
    videoInputsWithRemoteAccess: [],
    remoteSelectedIndex: 0,
    irFavChannels: [],
    favChNames: [],
    favChStations: [],
    snackbar: {
      show: false,
      message: '',
      color: 'success'
    },
    isAuthenticated: false,
  }),
  getters: {

  },
  actions: {
    setAuthenticated(val) {
      this.isAuthenticated = val
    },
    switchDisplay(inputId) {
      this.selectedInput = inputId+1
      const serverURL = `${location.hostname}:1880`
      const rxId = this.selectedDisplay.rxId
      if (rxId === 'all') {
        fetch(`http://${serverURL}/switchAll/vlan/${this.selectedInput}`)
      } else if (rxId === 'rxS_in_a_zone') {
        // Handle the case when rxId is 'rxS_in_a_zone'
        fetch(`http://${serverURL}/switchZone/${this.selectedDisplay.name}/vlan/${this.selectedInput}`)
      } else if (rxId) {
        fetch(`http://${serverURL}/switchRX/${rxId}/vlan/${this.selectedInput}`)
      }
    },
    async switchPreset(preset) {
      const serverURL = `${location.hostname}:3000`
      const nodeRedURL = `${location.hostname}:1880`
      
      try {
        const response = await fetch(`http://${serverURL}/read/UserPreset${preset}`)
        const presetData = await response.json()
        console.log(`Loading Preset ${preset}`, presetData)
        
        // Apply each TV's preset input
        for (let key in presetData) {
          const tvNumber = parseInt(key.replace('tv', ''))
          const inputVlan = presetData[key] + 1
          
          console.log(`Switching TV ${tvNumber} to VLAN ${inputVlan}`)
          
          // Switch each RX to its preset VLAN
          await fetch(`http://${nodeRedURL}/switchRX/${tvNumber}/vlan/${inputVlan}`)
        }
        
        // Show success snackbar
        this.snackbar = {
          show: true,
          message: `Preset ${preset} loaded successfully`,
          color: 'success'
        }
        
        return { success: true, message: `Preset ${preset} loaded successfully` }
      } catch (error) {
        console.error(`Error loading Preset ${preset}:`, error)
        
        // Show error snackbar
        this.snackbar = {
          show: true,
          message: `Failed to load Preset ${preset}`,
          color: 'error'
        }
        
        return { success: false, message: `Failed to load Preset ${preset}` }
      }
    },
    async switchMix() {
      const nodeRedURL = `${location.hostname}:1880`
      
      try {
        await fetch(`http://${nodeRedURL}/switchRX/mix`)
        console.log('Mix command sent')
        
        // Show success snackbar
        this.snackbar = {
          show: true,
          message: 'Mix mode activated',
          color: 'success'
        }
        
        return { success: true }
      } catch (error) {
        console.error('Error sending Mix command:', error)
        
        // Show error snackbar
        this.snackbar = {
          show: true,
          message: 'Failed to activate Mix mode',
          color: 'error'
        }
        
        return { success: false }
      }
    },
    async getStatus() {
     const serverURL_ciscoStat = `${location.hostname}:1880/ciscoStat`
      try {
        const response = await fetch(`http://${serverURL_ciscoStat}`)
        const myJson = await response.json()
        this.status = myJson
        this.pingController = 'ok'
        console.log(this.status)
        return { status: this.status, pingController: 'ok' }
      } catch (error) {
        this.pingController = 'fail'
        return { status: null, pingController: 'fail' }
      }
    },
     async get_zoneNames(){
        this.zoneNames=[]
         const serverURL = `${location.hostname}:3000`
        // Read from Server
        try {
          const response = await fetch(`http://${serverURL}/read/UserZoneNames`, {method: 'GET',})
          const result = await response.json()
          console.log('ZoneNames Success:', result);
          let item;
          for( item in result){
            this.zoneNames.push(result[item])
          }
          console.log('Zone names = ',this.zoneNames)
        } catch (error) {
          console.error('Error:', error);
        }
    },

       async get_UserSwitchConfig(){
        const serverURL = `${location.hostname}:3000`
        // Read from Server
        try {
          const response = await fetch(`http://${serverURL}/read/UserSwitchConfig`, {method: 'GET',})
          const result = await response.json()
          console.log('UserSwitchConfig loaded:', result);
          this.switch_ipAddress = result.ip|| ''
          this.txCount = result.TXports || 0
          this.rxCount = result.RXports || 0

        } catch (error) {
          console.error('Error:', error);
        }
    },

    async get_tvNames(){
        this.tvNames = []
        this.tvZones = []
        this.tvZonesId = []
        const serverURL = `${location.hostname}:3000`
        // Read from Server
        try {
          const response = await fetch(`http://${serverURL}/read/UserTvNames`, {method: 'GET',})
          const result = await response.json()
          if (result && Array.isArray(result)) {
            result.forEach(item => {
              this.tvNames.push(item.name)
              this.tvZones.push(item.zone)
              this.tvZonesId.push(item.zoneId)
            })
          }
        } catch (error) {
          console.error('Error loading TV names:', error)
        }
    },
    async get_inputNames(){
        this.inputNames = []
        const serverURL = `${location.hostname}:3000`
        // Read from Server
        try {
          const response = await fetch(`http://${serverURL}/read/UserInputNames`, {method: 'GET',})
          const result = await response.json()
          if (result) {
            for(let key in result) {
              this.inputNames.push(result[key])
            }
          }
        } catch (error) {
          console.error('Error loading Input names:', error)
        }
    },

    async checkPresets() {
      const serverURL = `${location.hostname}:3000`
      
      // Check each preset
      for (let presetNumber = 1; presetNumber <= 3; presetNumber++) {
        try {
          const response = await fetch(`http://${serverURL}/read/UserPreset${presetNumber}`, { method: 'GET' })
          const result = await response.json()
          this[`preset${presetNumber}Created`] = Object.keys(result).length > 0
        } catch (error) {
          console.error(`Error checking Preset ${presetNumber}:`, error)
          this[`preset${presetNumber}Created`] = false
        }
      }
    },

    async savePreset(preset) {
      const serverURL = `${location.hostname}:3000`
      let currentScene = {}

      // Save current scene 
      for(let i = 0; i < this.status.rxCount; i++){
        currentScene[`tv${i+1}`] = this.status.PortVlanMembership[i + this.status.txCount] - 1
      }

      try {
        // Save to server
        await fetch(`http://${serverURL}/write/Preset${preset}/${JSON.stringify(currentScene)}`)
        
        // Update preset status reactively
        if (preset === 1) this.preset1Created = true
        else if (preset === 2) this.preset2Created = true
        else if (preset === 3) this.preset3Created = true
        
        // Show success snackbar
        this.snackbar = {
          show: true,
          message: `Preset ${preset} saved successfully`,
          color: 'success'
        }
        
      } catch (error) {
        console.error(`Error saving Preset ${preset}:`, error)
        
        // Show error snackbar
        this.snackbar = {
          show: true,
          message: `Failed to save Preset ${preset}`,
          color: 'error'
        }
      }
    },

    async clearPreset(preset) {
      const serverURL = `${location.hostname}:3000`
      
      try {
        // Clear preset by writing empty object (encoded properly)
        let emptyObject = {}
       await fetch(`http://${serverURL}/write/Preset${preset}/${JSON.stringify(emptyObject)}`)
         
        // Update preset status reactively
        if (preset === 1) this.preset1Created = false
        else if (preset === 2) this.preset2Created = false
        else if (preset === 3) this.preset3Created = false
        
        // Show success snackbar
        this.snackbar = {
          show: true,
          message: `Preset ${preset} cleared successfully`,
          color: 'success'
        }

      } catch (error) {
        console.error(`Error clearing Preset ${preset}:`, error)
        
        // Show error snackbar
        this.snackbar = {
          show: true,
          message: `Failed to clear Preset ${preset}`,
          color: 'error'
        }
      }
    },

    async loadItachConfig() {
      try {
        const serverURL = location.hostname
        const response = await fetch(`http://${serverURL}:3000/read/UserItachIPs`)
        const config = await response.json()
        
        if (config) {
          const itachKeys = Object.keys(config).filter(key => key.startsWith('itach'))
          this.iTachUnits = itachKeys.map(key => config[key])
          
          const setTopBoxCount = config.set_top_box_count || 0
          
          // Populate videoInputsWithRemoteAccess array
          // Same length as inputNames, true for indices < set_top_box_count
          this.videoInputsWithRemoteAccess = this.inputNames.map((_, index) => index < setTopBoxCount)
          return {
            itachIPs: this.iTachUnits,
            set_top_box_count: setTopBoxCount
          }
        }
        return null
      } catch (error) {
        console.log('No existing iTach config found')
        return null
      }
    },
    async loadUserFavChannels() {
      this.irFavChannels = []
      this.favChNames = []
      this.favChStations = []
      const serverURL = `${location.hostname}:3000`
      
      try {
        const response = await fetch(`http://${serverURL}/read/UserFavChannels`, { method: 'GET' })
        const result = await response.json()
        console.log('UserFavChannels Success:', result)
        
        if (result) {
          const nameKeys = Object.keys(result).filter(key => key.startsWith('fav_ch_name_'))
          const channelKeys = Object.keys(result).filter(key => key.startsWith('fav_ch_') && !key.includes('name'))
          
          this.favChNames = nameKeys.map(key => result[key])
          this.favChStations = channelKeys.map(key => result[key])
          
          // Also populate irFavChannels for backward compatibility
          for (let item in result) {
            this.irFavChannels.push(result[item])
          }
        }
        console.log('Favorite channels:', this.favChNames, this.favChStations)
      } catch (error) {
        console.error('Error loading favorite channels:', error)
      }
    },

    async poe_on_off(_param){
        const serverURL = `${location.hostname}:1880`
        try {
          const response = await fetch(`http://${serverURL}/poe/${_param}`, { method: 'GET' })
          if (response.ok) {
            this.snackbar = {
              show: true,
              message: `PoE Power ${_param === 'on' ? 'On' : 'Off'} `,
              color: _param === 'off' ? 'red' : 'success'
            }
          } else {
            this.snackbar = {
              show: true,
              message: `Failed to send PoE Power ${_param === 'on' ? 'On' : 'Off'} `,
              color: 'error'
            }
          }
        } catch (error) {
          console.error('Error fetching PoE:', error)
          this.snackbar = {
            show: true,
            message: `Error sending PoE Power ${_param === 'on' ? 'On' : 'Off'}`,
            color: 'error'
          }
        }
    },
    async load_PoE_settings(){
      //read node red poe timer to force node to save offTime and set tx rx count to ciscoStus
      const serverURL = `${location.hostname}:1880`
      fetch(`http://${serverURL}/timer/poe`, { method: 'GET' })
    },

    async poe_timer_node_installed_in_node_red(){
      const serverURL = `${location.hostname}:1880`
      try {
        const response = await fetch(`http://${serverURL}/check_if_node_red_timer_poe_installed`)
        if (!response.ok) {
          return false;
        }
        const text = await response.text();
        if (text === 'node-red-timer-poe-installed') {
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking Node-RED PoE timer node:', error);
        return false;
      }
    }
   
  }
})
