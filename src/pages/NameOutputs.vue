<template>
  <div class="name-outputs">
    <v-card class="mx-auto pa-6" width="100%" max-width="1400px" color="white">
      <v-card-title class="text-h5 text-center">Add Displays</v-card-title>
      
      <v-card-text>
        <!-- Zone Selection -->
        <div class="mb-6 zone-selection-container">
          <p class="text-subtitle-1 text-center mb-3">Assign zone to display</p>
          <v-radio-group v-model="selectedZoneIndex" inline class="zone-radio-group">
            <v-radio
              v-for="(zoneName, index) in stateStore.zoneNames"
              :key="index"
              :label="zoneName"
              :value="index"
              color="blue"
            ></v-radio>
          </v-radio-group>
        </div>

        <!-- Add Display Input -->
        <div class="input-section mb-4">
          <v-text-field
            v-model="tvName"
            label="Enter Name of TV to add"
            placeholder="Enter Name of TV to add"
            maxlength="10"
            variant="outlined"
            density="comfortable"
          >
            <template v-slot:append-inner>
              <v-btn 
                color="blue" 
                @click="add()" 
                size="small"
                prepend-icon="mdi-plus"
              >
                Add Display
              </v-btn>
            </template>
          </v-text-field>
        </div>

        <!-- Error Alert -->
        <v-alert v-if="rxNameError" type="error" density="compact" class="mb-4">
          {{ rxNameError }}
        </v-alert>

        <!-- Display List -->
        <div class="displays-grid mt-4">
          <v-card
            v-for="(item, index) in stateStore.tvNames"
            :key="index"
            class="display-item"
            variant="outlined"
            color="white"
          >
            <v-card-text class="pa-3">
              <div class="card-header">
                <div class="port-number">
                  Port {{ (stateStore.txCount + index + 1) }}
                </div>
                <div class="zone-chip-container">
                  <v-chip 
                    size="x-small" 
                    :color="stateStore.tvZonesId[index] === 0 ? 'red' : 'grey-darken-4'"
                  >
                    {{ stateStore.tvZonesId[index] === 0 ? 'Disabled' : (stateStore.zoneNames[stateStore.tvZonesId[index] - 1] || 'Unknown') }}
                  </v-chip>
                </div>
              </div>
              
              <div class="trash-container">
                <v-btn
                  icon="mdi-delete"
                  size="x-small"
                  color="red"
                  variant="text"
                  @click="trash(index)"
                ></v-btn>
              </div>
              
              <div class="edit-container">
                <v-btn
                  icon="mdi-pencil"
                  size="x-small"
                  color="blue"
                  variant="text"
                  @click="openEditDialog(index)"
                ></v-btn>
              </div>

              <div class="display-info">
                <p class="text-body-2 font-weight-medium mb-1">{{ stateStore.tvNames[index] }}</p>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>

      <!-- Action Buttons -->
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

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6 text-center">
          Edit TV {{ editIndex + 1 }}
        </v-card-title>
        
        <v-card-text>
          <v-text-field
            v-model="stateStore.tvNames[editIndex]"
            label="TV Name"
            maxlength="10"
            variant="outlined"
            class="mb-4"
          ></v-text-field>

          <p class="text-subtitle-2 font-weight-bold mb-2">Select Zone:</p>
          <v-radio-group v-model="editZoneIndex" inline>
            <v-radio
              v-for="(zoneName, index) in stateStore.zoneNames"
              :key="index"
              :label="zoneName"
              :value="index"
              color="blue"
            ></v-radio>
            <v-radio
              label="Disable"
              :value="-1"
              color="red"
            ></v-radio>
          </v-radio-group>
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn color="blue" @click="saveEdit" variant="flat">
            <span style="color: white;">OK</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useStateStore } from '@/stores/stateStores'

export default {
  name: 'NameOutputs',
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
    async created() {
    // Load switch config to get txCount
    await this.stateStore.get_UserSwitchConfig()
    // Load TV names from stateStore
    await this.stateStore.get_tvNames()
  },
  data() {
    return {
      tvName: '',
      selectedZoneIndex: 0,
      rxNameError: '',
      editDialog: false,
      editIndex: 0,
      editZoneIndex: 0
    }
  },
  methods: {
    add() {
      // Reset error message
      this.rxNameError = ''
      const name = this.tvName.trim()
      
      // --- 1. Check for Empty TV Name ---
      if (!name) {
        this.rxNameError = 'TV/Display name cannot be empty.'
        return
      }
      
      // --- 2. Check for Duplicate TV Name (Case-insensitive) ---
      if (this.stateStore.tvNames.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
        this.rxNameError = `A TV/Display named "${name}" already exists.`
        this.tvName = ''
        return
      }
      
      // --- 3. Check for Zone Selection ---
      if (this.selectedZoneIndex === null || this.selectedZoneIndex === undefined) {
        this.rxNameError = 'You must select a Zone for the new TV/Display.'
        return
      }
      
      // --- 4. Check for Max Limit (adjust as needed) ---
      const maxDisplays = this.stateStore.rxCount
      
      if (this.stateStore.tvNames.length < maxDisplays) {
        // SUCCESS: Add the data
        this.stateStore.tvNames.push(name)
        this.stateStore.tvZones.push(this.stateStore.zoneNames[this.selectedZoneIndex])
        this.stateStore.tvZonesId.push(this.selectedZoneIndex + 1)
        
        // Clear inputs
        this.tvName = ''
      } else {
        this.rxNameError = `Exceeded maximum of ${maxDisplays} displays.`
        this.tvName = ''
      }
    },
    
    openEditDialog(index) {
      this.editIndex = index
      // Find the zone index for the current display
      const currentZone = this.stateStore.tvZones[index]
      if (currentZone === 'Disabled') {
        this.editZoneIndex = -1
      } else {
        this.editZoneIndex = this.stateStore.zoneNames.indexOf(currentZone)
      }
      this.editDialog = true
    },
    
    saveEdit() {
      // Update the zone for the edited display
      if (this.editZoneIndex === -1) {
        this.stateStore.tvZones[this.editIndex] = 'Disabled'
        this.stateStore.tvZonesId[this.editIndex] = 0
      } else {
        this.stateStore.tvZones[this.editIndex] = this.stateStore.zoneNames[this.editZoneIndex]
        this.stateStore.tvZonesId[this.editIndex] = this.editZoneIndex + 1
      }
      this.editDialog = false
    },
    
    trash(index) {
      this.stateStore.tvNames.splice(index, 1)
      this.stateStore.tvZones.splice(index, 1)
      this.stateStore.tvZonesId.splice(index, 1)
    },
    
    async save(e) {
      e.preventDefault()
      const serverURL = location.hostname
      
      // Prepare data for saving
      let tvNamesZones = []
      this.stateStore.tvNames.forEach((item, index) => {
        let tvAndzone = {
          rxId: index + 1,
          name: item,
          zoneId: this.stateStore.tvZonesId[index],
          zone: this.stateStore.tvZones[index]
        }
        tvNamesZones.push(tvAndzone)
      })
       
      // Send to Express to save in 'UserTvNames.txt'
      try {
        await fetch(`http://${serverURL}:3000/write/UserTvNames/${JSON.stringify(tvNamesZones)}`)
        this.$router.push({ name: 'home' })
      } catch (error) {
        console.log(error)
      }
    },
    
    cancel(e) {
      e.preventDefault()
      this.$router.push({ name: 'home' })
    }
  },

}
</script>

<style scoped>
.name-outputs {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  padding: 20px;
  width: 100%;
}

.input-section {
  display: flex;
  gap: 10px;
  align-items: center;
}

.displays-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.display-item {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.12);
  width: 100%;
  position: relative;
  min-height: 120px;
}

.display-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 10px;
  color: black;
}

.display-info p {
  color: black;
}
.zone-chip-container {
  display: flex;
  align-items: center;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}

.port-number {
  font-size: 0.55rem;
  color: #666;
}

.trash-container {
  position: absolute;
  bottom: 4px;
  left: 4px;
}

.edit-container {
  position: absolute;
  bottom: 4px;
  right: 4px;
}

.zone-radio-group {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.zone-selection-container {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 16px;
}
</style>