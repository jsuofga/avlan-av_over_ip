<template>
  <div>
    <ButtonPoE />
    <v-bottom-navigation bg-color="grey-darken-4" height="60">
      <v-btn @click="goHome()">
        <v-icon size="xxx-large">mdi-gamepad-circle</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>
         

<script>
import { useStateStore } from '@/stores/stateStores'
import ButtonPoE from './ButtonPoE.vue';


export default {
  name: "BottomNav",
  components: {
    ButtonPoE
  },
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
  methods: {
    goHome() {
      this.$router.push({ name: 'home' })
    }
  }
}
</script>

<style scoped>
</style>
