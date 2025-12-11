<template>
  <v-app class="dark-bg">
    <Navbar />
    <v-main class="pa-4 dark-bg">
      <v-container fluid class="fill-height">
        <router-view />
      </v-container>
    </v-main>
    <BottomNav />
    
    <v-snackbar
      v-model="statusStore.snackbar.show"
      :color="statusStore.snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ statusStore.snackbar.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useStateStore } from '@/stores/stateStores'
import Navbar from './components/Navbar.vue'
import BottomNav from './components/BottomNav.vue'

const statusStore = useStateStore()
let statusInterval = null

onMounted(() => {

  // Initial fetch
  statusStore.getStatus()
  statusStore.get_zoneNames()
  statusStore.get_UserSwitchConfig()
  statusStore.load_PoE_settings()
  
  // Poll every 5 seconds
  statusInterval = setInterval(() => {
    statusStore.getStatus()
  }, 5000)
})

onBeforeUnmount(() => {
  if (statusInterval) {
    clearInterval(statusInterval)
  }
})
</script>
