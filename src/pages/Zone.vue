<template>
  <div class="zone-page">
    <div class="zone-title">
      <button class="zone-title-btn" @click="zoneTitleClicked">
        {{ zoneName }}
      </button>
    </div>
    <div class="zone-content">
      <div class="tv-grid">
        <button
          v-for="tv in filteredTvs"
          :key="tv.rxId"
          class="tv-button"
          @click="selectDisplay(tv)"
        >
          <div class="button-content">
            <span class="port-number">P{{ stateStore.txCount + tv.rxId }}</span>
            <span class="tv-name">{{ tv.name }}</span>
            <span class="port-vlan">{{ getCurrentInput(tv.rxId) }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useStateStore } from '@/stores/stateStores'

export default {
  name: 'Zone',
  setup() {
     const stateStore = useStateStore()
    return { stateStore }
  },
  async created() {
    // Get zone name from route params
    this.zoneIndex = this.$route.params.index

    // Load necessary data if not already loaded
    if (!this.stateStore.zoneNames.length) {
      await this.stateStore.get_zoneNames()
    }
    if (!this.stateStore.inputNames.length) {
      await this.stateStore.get_inputNames()
    }
   
    // Load TV data from server
    const serverURL = location.hostname
    try {
      const response = await fetch(`http://${serverURL}:3000/read/UserTvNames`, {method: 'GET'})
      const result = await response.json()
      if (result && Array.isArray(result)) {
        this.tvList = result
      }
    } catch (error) {
      console.error('Error loading TV data:', error)
    }
  },
  data() {
    return {
      zoneIndex: null,
      tvList: []
    }
  },
  computed: {
    zoneName() {
      if (this.zoneIndex === 'all') {
        return 'ALL TVs'
      } else if (this.zoneIndex !== null && this.zoneIndex !== undefined) {
        return this.stateStore.zoneNames[this.zoneIndex] || 'Unknown Zone'
      }
      return ''
    },
    filteredTvs() {
      if (this.zoneIndex === 'all') {
        return this.tvList
      }
      const targetZone = this.stateStore.zoneNames[this.zoneIndex]
      return this.tvList.filter(tv => tv.zone === targetZone)
    }
  },
  methods: {
    getCurrentInput(rxId) {
      const portIndex = this.stateStore.txCount + rxId - 1
      if (this.stateStore.status.PortVlanMembership && 
          this.stateStore.status.PortVlanMembership[portIndex]) {
        const vlanId = this.stateStore.status.PortVlanMembership[portIndex]
        // VLAN ID maps to input port number (vlanId - 2 = input index)
        if (this.stateStore.inputNames && this.stateStore.inputNames[vlanId - 2]) {
          return this.stateStore.inputNames[vlanId - 2 ]
        }
      }
    },
    selectDisplay(tv) {
      this.stateStore.selectedDisplay = {
        rxId: tv.rxId,
        name: tv.name
      }
      this.$router.push({ name: 'videoinputs' })
    },
    zoneTitleClicked() {
      this.stateStore.selectedDisplay = {
        rxId: 'rxS_in_a_zone',
        name: this.zoneName 
      }
      this.$router.push({ name: 'videoinputs' })
    }
  },
  
}
</script>

<style scoped>
  /* Layout for the zone page */
.zone-page {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  /* overflow-y: visible;
  overflow-x: hidden; */
}
.zone-title {
  background-color: transparent;
  padding: 10px ;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
}

.zone-title-btn {
  font-size: 2rem;
  font-weight: normal;
  color: white;
  text-transform: none;
  border: 2px solid white;
  border-radius: 10px;
  padding: 10px 10px;
  background: transparent;
  box-shadow: none;
  letter-spacing: 1px;
  transition: box-shadow 0.2s;
}
.zone-content {
  padding: 24px;
}
.tv-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 8px;
  width: 100%;
  justify-content: center;
  align-items: stretch;
  position: relative;
  /* No height, max-height, or overflow properties */
}

.tv-button {
  height: 50px;
  width: 100px;
  position: relative;
  border-radius: 10px;
  border:1px solid white 
}
.button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.port-number {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 0.65rem;
  font-weight: normal;
  color: white;
  background-color: #2196F3;
  padding: 2px 6px;
  border-radius: 0 0 8px 0;
  border-top-left-radius: 10px;
}
.tv-name {
  font-size: 0.75rem;
  font-weight: normal;
  color: white;
  text-align: center;
}
.port-vlan {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: white;
}

/* iPad landscape specific optimizations (1024x768) */
@media screen and (min-width: 1024px) and (max-width: 1366px) and (orientation: landscape) {
  .zone-title {
    font-size: 2.8rem;
    padding: 24px;
  }
  .zone-content {
    padding: 32px;
  }
}

/* iPad Pro landscape (1366x1024) */
@media screen and (min-width: 1366px) and (orientation: landscape) {
  .zone-title {
    font-size: 3rem;
    padding: 28px;
  }
  
  .zone-content {
    padding: 40px;
  }
}
</style>
