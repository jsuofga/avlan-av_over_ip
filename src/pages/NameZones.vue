<template>
  <div class="name-zones">
      <v-card class="mx-auto pa-6" width="100%" color="white">
            <v-card-title class="text-h5 text-center">Create Zones</v-card-title>
            
            <v-card-text>
                <div class="input-section">
                      <v-text-field
                        v-model="zoneName"
                        label="Enter Name of Zone/Group"
                        placeholder="Enter Name of Zone/Group"
                        maxlength="10"
                        variant="outlined"
                        density="comfortable"
                        style="width: 50%;"
                      >
                        <template v-slot:append-inner>
                          <v-btn 
                            color="blue" 
                            @click="add()" 
                            size="small"
                            prepend-icon="mdi-plus"
                          >
                            Add Zone
                          </v-btn>
                        </template>
                      </v-text-field>
                </div>
                
                <v-alert v-if="zoneNameError" type="error" density="compact" class="mt-2">
                  {{zoneNameError}}
                </v-alert>

                <div class="zones-grid mt-4">
                  <v-card 
                    v-for="(item, index) in stateStore.zoneNames" 
                    :key="index"
                    class="zone-item"
                    variant="outlined"
                    color="white"
                  >
                    <v-card-text class="pa-2">
                      <div class="trash-container">
                        <v-btn
                          icon="mdi-delete"
                          size="x-small"
                          color="red"
                          variant="text"
                          @click="trash(index)"
                        ></v-btn>
                      </div>
                      <div class="zone-header">
                        <span class="zone-label">Zone {{index+1}}</span>
                      </div>
                      <div class="d-flex align-center">
                        <v-text-field
                          v-model="stateStore.zoneNames[index]"
                          density="compact"
                          variant="outlined"
                          hide-details
                          maxlength="10"
                          class="zone-input"
                          color="black"
                          base-color="grey"
                        ></v-text-field>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
            </v-card-text>

            <v-card-actions class="justify-center">
                <v-btn color="red" @click="cancel" size="large" variant="flat">
                  <v-icon start color="white">mdi-cancel</v-icon>
                  <span style="color: white;">Cancel</span>
                </v-btn>
                <v-btn color="blue" @click="save" size="large" variant="flat">
                  <v-icon start color="white">mdi-content-save</v-icon>
                  <span style="color: white;">Update/Save</span>
                </v-btn>
            </v-card-actions>
      </v-card>
  </div>
</template>

<script>
import { useStateStore } from '@/stores/stateStores'

export default {
  name: 'NameZones',
  props: [],
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
  data() {
    return {
      zoneName: '',
      zoneNameError: ''
    }
  },
  methods: {
    add() {
      // Reset error message at the start of the attempt
      this.zoneNameError = ''
      const name = this.zoneName.trim()
      
      // --- 1. Check for Empty Input ---
      if (!name) {
        this.zoneNameError = 'Zone name cannot be empty.'
        return
      }
      
      // --- 2. Check for Duplicate Name (Case-insensitive) ---
      if (this.stateStore.zoneNames.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
        this.zoneNameError = `A zone named "${name}" already exists.`
        return
      }
      
      // --- 3. Check for Max Limit (Existing Logic) ---
      if (this.stateStore.zoneNames.length < 8) {
        this.stateStore.zoneNames.push(name) // Use the trimmed 'name'
        this.zoneName = '' // Clear the input after successful addition
      } else {
        this.zoneNameError = 'Max allowed zones is 8'
        this.zoneName = '' // Clear input
      }
    },
    
    trash(index) {
      this.stateStore.zoneNames.splice(index, 1)
    },
    
    async save(e) {
      e.preventDefault()
      const serverURL = location.hostname

      // Fetch previous zone names from server
      let prevZoneNames = []
      try {
        const response = await fetch(`http://${serverURL}:3000/read/UserZoneNames`, {method: 'GET'})
        const result = await response.json()
        if (result) {
          prevZoneNames = Object.values(result)
        }
      } catch (error) {
        console.error('Error loading previous zone names:', error)
      }

      // Load current TV data
      let tvData = []
      try {
        const response = await fetch(`http://${serverURL}:3000/read/UserTvNames`, {method: 'GET'})
        tvData = await response.json()
      } catch (error) {
        console.error('Error loading TV data:', error)
      }

      // Map old zone names to new zone names by index
      if (Array.isArray(tvData) && tvData.length > 0) {
        let needsUpdate = false
        tvData = tvData.map(tv => {
          if (tv.zone !== 'Disabled') {
            // Find index of old zone name
            const oldIndex = prevZoneNames.indexOf(tv.zone)
            // If zone name was changed, update to new name at same index
            if (oldIndex !== -1 && this.stateStore.zoneNames[oldIndex] && tv.zone !== this.stateStore.zoneNames[oldIndex]) {
              needsUpdate = true
              return {
                ...tv,
                zone: this.stateStore.zoneNames[oldIndex],
                zoneId: oldIndex + 1
              }
            }
            // If zone was deleted, disable TV
            if (oldIndex === -1 || !this.stateStore.zoneNames[oldIndex]) {
              needsUpdate = true
              return {
                ...tv,
                zone: 'Disabled',
                zoneId: 0
              }
            }
          }
          return tv
        })
        // Save updated TV data if any changes were made
        if (needsUpdate) {
          await fetch(`http://${serverURL}:3000/write/UserTvNames/${JSON.stringify(tvData)}`)
        }
      }

      // Save zone names
      let zoneInputNames = {}
      this.stateStore.zoneNames.forEach((item, index) => {
        zoneInputNames[`zone${index+1}`] = item
      })

      // Send to Express to save in 'UserZoneNames.txt'
      fetch(`http://${serverURL}:3000/write/UserZoneNames/${JSON.stringify(zoneInputNames)}`)
        .then(() => {
          this.$router.push({name: 'home'})
        })
        .catch(error => console.log(error))
    },
    
    cancel(e) {
      e.preventDefault()
      this.$router.push({name: 'home'})
    }
  },

}
</script>

<style scoped>
.name-zones {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  padding: 20px;
  width: 100%;
}

.v-card {
  margin: 0 auto;
}

.input-section {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.zones-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.zone-item {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.12);
  width: 100%;
  position: relative;
}

.zone-header {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.zone-label {
  font-weight: 500;
  white-space: nowrap;
  color: black;
}

.zone-input {
  flex: 1;
}

.zone-input :deep(input) {
  color: black !important;
}

.trash-container {
  position: absolute;
  top: 4px;
  right: 4px;
}
</style>
