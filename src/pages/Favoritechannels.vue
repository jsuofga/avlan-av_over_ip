<template>
  <div class="favorite-channels-container">
    <v-card class="favorite-channels-card" elevation="4">
      <v-card-title class="text-h5 text-center">
        Set Favorite Channels
      </v-card-title>
      
      <v-card-text>
        <div class="field mb-4">
          <v-select
            v-model="selected"
            :items="channelOptions"
            label="Set Channel Number"
            variant="outlined"
            density="comfortable"
          ></v-select>
          <div class="text-center mt-2">
            <v-btn @click="add" color="green" variant="flat">
              <v-icon start>mdi-arrow-down</v-icon>
              <span style="color: white;">Add</span>
            </v-btn>
          </div>
        </div>

        <div class="list-grid">
          <v-card
            v-for="(item, index) in favChNames"
            :key="index"
            class="grid-item"
            elevation="1"
          >
            <v-card-text class="pa-2">
              <div class="d-flex justify-space-between align-center mb-2">
                <v-chip size="small" color="primary">
                  {{favChNames[index]}}
                </v-chip>
                <v-btn icon size="x-small" @click="trash(index)" color="red">
                  <v-icon size="small">mdi-delete-forever</v-icon>
                </v-btn>
              </div>
              <p class="text-caption mb-2">Channel-{{favChStations[index]}}</p>
              <v-text-field
                v-model="favChNames[index]"
                variant="outlined"
                density="compact"
                placeholder="Enter Station Name"
                maxlength="10"
                hide-details="auto"
              ></v-text-field>
            </v-card-text>
          </v-card>
        </div>

        <v-alert v-if="errorMessage" type="error" density="compact" class="mt-4">
          {{ errorMessage }}
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
  name: 'Favoritechannels',
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
  async created() {
    await this.stateStore.loadUserFavChannels()
  },
  data() {
    return {
      channels: [...Array(999).keys()],
      selected: '',
      errorMessage: ''
    }
  },
  computed: {
    channelOptions() {
      return this.channels.map(i => i + 1)
    },
    favChNames() {
      return this.stateStore.favChNames
    },
    favChStations() {
      return this.stateStore.favChStations
    }
  },
  methods: {
    add() {
      if (!this.selected) {
        this.errorMessage = 'Please select a channel number'
        return
      }
      
      // Check if channel number already exists
      if (this.stateStore.favChStations.includes(this.selected)) {
        this.errorMessage = `Channel ${this.selected} is already added`
        return
      }
      
      this.errorMessage = ''
      this.stateStore.favChNames.push('')
      this.stateStore.favChStations.push(this.selected)
      this.selected = '' // Clear selection after adding
    },
    trash(index) {
      this.stateStore.favChNames.splice(index, 1)
      this.stateStore.favChStations.splice(index, 1)
    },
    async save() {
      this.errorMessage = ''
      const serverURL = `${location.hostname}:3000`

      // Check for empty names
      if (this.stateStore.favChNames.includes('')) {
        this.errorMessage = 'Please enter a name for all channels'
        return
      }

      // Check for duplicate names (case-insensitive)
      const lowerCaseNames = this.stateStore.favChNames.map(name => name.toLowerCase())
      const hasDuplicates = lowerCaseNames.some((name, index) => {
        return lowerCaseNames.indexOf(name) !== index
      })
      
      if (hasDuplicates) {
        this.errorMessage = 'Each channel must have a unique name'
        return
      }

      let irFavChannels = {}
      this.stateStore.favChNames.forEach((item, index) => {
        irFavChannels[`fav_ch_name_${index + 1}`] = this.stateStore.favChNames[index]
        irFavChannels[`fav_ch_${index + 1}`] = this.stateStore.favChStations[index]
      })
      
      console.log('ir favorites', irFavChannels)
      
      try {
        await fetch(`http://${serverURL}/write/UserFavChannels/${JSON.stringify(irFavChannels)}`)
        this.$router.push({ name: 'home' })
      } catch (error) {
        console.log(error)
        this.errorMessage = 'Error saving favorite channels. Please try again.'
      }
    },
    cancel() {
      this.$router.push({ name: 'home' })
    },

  },

}
</script>

<style scoped>
.favorite-channels-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #121212;
  padding: 20px;
}

.favorite-channels-card {
  width: 90%;
  max-width: 1200px;
  padding: 20px;
}

.field {
  width: 70%;
  margin: 0 auto;
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 20px 0;
  width: 90%;
  margin: 20px auto;
}

.grid-item {
  position: relative;
}
</style>
