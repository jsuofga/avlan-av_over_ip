<template>
  <div class="name-inputs">
      <v-card class="mx-auto pa-6" width="100%" color="white">
            <v-card-title class="text-h5 text-center">Add Video Inputs</v-card-title>
            
            <v-card-text>
                <div class="input-section">
                      <v-text-field
                        v-model="inputName"
                        label="Enter Name of Video Input"
                        placeholder="Enter Name of Video Input"
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
                            Add Input
                          </v-btn>
                        </template>
                      </v-text-field>
                </div>
                
                <v-alert v-if="inputNameError" type="error" density="compact" class="mt-2">
                  {{inputNameError}}
                </v-alert>

                <div class="inputs-grid mt-4">
                  <v-card 
                    v-for="(item, index) in stateStore.inputNames" 
                    :key="index"
                    class="input-item"
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
                      <div class="input-header">
                        <span class="input-label">Input {{index+1}}</span>
                      </div>
                      <div class="d-flex align-center">
                        <v-text-field
                          v-model="stateStore.inputNames[index]"
                          density="compact"
                          variant="outlined"
                          hide-details
                          maxlength="10"
                          class="input-field"
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
  name: 'NameInputs',
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
  data() {
    return {
      inputName: '',
      inputNameError: ''
    }
  },
  methods: {
    add() {
      // Reset error message
      this.inputNameError = ''
      const name = this.inputName.trim()
      
      // --- 1. Check for Empty Input ---
      if (!name) {
        this.inputNameError = 'Input name cannot be empty.'
        return
      }
      
      // --- 2. Check for Duplicate Name (Case-insensitive) ---
      if (this.stateStore.inputNames.map(n => n.toLowerCase()).includes(name.toLowerCase())) {
        this.inputNameError = `An input named "${name}" already exists.`
        return
      }
      
      // --- 3. Check for Max Limit ---
      // Determine max allowed inputs based on mode
      const maxInputs = this.stateStore.txCount === 0
        ? this.stateStore.rxCount
        : this.stateStore.txCount;

      if (this.stateStore.inputNames.length < maxInputs) {
        this.stateStore.inputNames.push(name);
        this.inputName = '';
      } else {
        this.inputNameError = ` Max allowed inputs is ${maxInputs}`;
        this.inputName = '';
      }
  
    },
    
    trash(index) {
      this.stateStore.inputNames.splice(index, 1)
    },
    
    async save(e) {
      e.preventDefault()
      const serverURL = location.hostname
      
      // Prepare input names with IDs
      let videoInputNames = {}
      this.stateStore.inputNames.forEach((item, index) => {
        videoInputNames[`input${index+1}`] = item
      })
      
      // Send to Express to save in 'UserInputNames.txt'
      try {
        await fetch(`http://${serverURL}:3000/write/UserInputNames/${JSON.stringify(videoInputNames)}`)
        this.$router.push({name: 'home'})
      } catch (error) {
        console.log(error)
      }
    },
    
    cancel(e) {
      e.preventDefault()
      this.$router.push({name: 'home'})
    }
  },
  
  async created() {
    // Load input names from stateStore if available
    if (this.stateStore.get_inputNames) {
      await this.stateStore.get_inputNames()
    }
  }
}
</script>

<style scoped>
.name-inputs {
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

.inputs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.input-item {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.12);
  width: 100%;
  position: relative;
}

.input-header {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.input-label {
  font-weight: 500;
  white-space: nowrap;
  color: black;
}

.input-field {
  flex: 1;
}

.input-field :deep(input) {
  color: black !important;
}

.trash-container {
  position: absolute;
  top: 4px;
  right: 4px;
}
</style>
