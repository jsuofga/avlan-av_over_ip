<template>
  <v-app-bar color="grey-darken-4" prominent>
    <v-app-bar-nav-icon variant="text" @click="checkPassword"></v-app-bar-nav-icon>

    <v-spacer></v-spacer>

    <v-img 
      :src="logo" 
      max-height="40" 
      max-width="120" 
      contain
    ></v-img>

    <v-spacer></v-spacer>

    <v-chip 
      v-if="stateStore.status.SwitchPingTest === 'fail'" 
      color="red" 
      text-color="white"
      class="mr-2"
    >
      Switch not detected
    </v-chip>

    <v-chip color="blue" text-color="white">AVLAN 1.1</v-chip>

  </v-app-bar>

  <!-- Password Dialog -->
  <v-dialog v-model="passwordDialog" max-width="400px">
    <v-card>
      <v-card-title class="text-h6 text-center">
        Admin Access
      </v-card-title>
      
      <v-card-text>
        <v-text-field
          v-model="password"
          label="Enter Admin Password"
          type="password"
          variant="outlined"
          @keyup.enter="validatePassword"
          autofocus
        ></v-text-field>
        <v-alert v-if="passwordError" type="error" density="compact" class="mt-2">
          {{ passwordError }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn color="grey" @click="cancelPassword" variant="text">
          Cancel
        </v-btn>
        <v-btn color="blue" @click="validatePassword" variant="flat">
          <span style="color: white;">OK</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-navigation-drawer v-model="drawer" temporary style="z-index:10000;">
    <v-list>
      <v-list-item prepend-icon="mdi-ethernet" title="Synch Switch" @click="navigate('/ipaddress')"></v-list-item>
      <v-list-item prepend-icon="mdi-gamepad-circle" title="Name Zones" @click="navigate('/namezones')"></v-list-item>
      <v-list-item prepend-icon="mdi-television" title="Name Outputs" @click="navigate('/nameoutputs')"></v-list-item>
      <v-list-item prepend-icon="mdi-video-input-component" title="Name Inputs" @click="navigate('/nameinputs')"></v-list-item>
      <v-list-item prepend-icon="mdi-content-save" title="Save Preset 1" @click="savePreset(1)">
        <template v-slot:append>
          <v-btn v-if="stateStore.preset1Created" icon size="small" @click.stop="clearPreset(1)">
            <v-icon size="small">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-list-item>
      <v-list-item prepend-icon="mdi-content-save" title="Save Preset 2" @click="savePreset(2)">
        <template v-slot:append>
          <v-btn v-if="stateStore.preset2Created" icon size="small" @click.stop="clearPreset(2)">
            <v-icon size="small">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-list-item>
      <v-list-item prepend-icon="mdi-content-save" title="Save Preset 3" @click="savePreset(3)">
        <template v-slot:append>
          <v-btn v-if="stateStore.preset3Created" icon size="small" @click.stop="clearPreset(3)">
            <v-icon size="small">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-list-item>
      <v-list-item  prepend-icon="mdi-router-wireless" title="Global Cache Itach" @click="navigate('/itach')"></v-list-item>
      <v-list-item 
        :disabled="stateStore.iTachUnits.length === 0"
        prepend-icon="mdi-star" 
        title="Favorite Channels" 
        @click="navigate('/favoritechannels')"
        :style="stateStore.iTachUnits.length === 0 ? 'opacity:0.4;pointer-events:none;' : ''"
      ></v-list-item>
      <v-list-item
        :disabled="!node_red_timer_poe_installed || !/-.*p/i.test(stateStore.status.model)"
        prepend-icon="mdi-power-plug-off"
        title="PoE Off Time"
        @click="navigate('/timer')"
        :style="!node_red_timer_poe_installed || !/-.*p/i.test(stateStore.status.model) ? 'opacity:0.4;pointer-events:none;' : ''"
      ></v-list-item>
      <v-list-item prepend-icon="mdi-update" title="Update Software" @click="navigate('/update')"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>


<script>
import { useStateStore } from '@/stores/stateStores'
import { useRouter } from 'vue-router'
import logo from '@/assets/octava_logo_white-200.png'

export default {
  name: 'Navbar',
  data() {
    return {
      drawer: false,
      passwordDialog: false,
      password: '',
      passwordError: '',
      logo,
      stateStore: useStateStore(),
      router: useRouter(),
      node_red_timer_poe_installed: false
    }
  },
  created() {
        // Use an arrow function to maintain 'this' context
        // send api request to Octava Controller to see if the Controller has the updated 'Timer_PoE' flow installed. 
        const get_check_if_node_red_timer_poe_installed = async () => {
               const serverURL = `${location.hostname}:1880`
                try {
                const response = await fetch(`http://${serverURL}/check_if_node_red_timer_poe_installed`);

                if (!response.ok) {
                // Throw an error if the status is not ok (e.g., 404, 500)
                throw new Error(`HTTP error! Status: ${response.status}`);
                }
                // 2. Await the response.text() call to read the body content
                const message = await response.text();
                    if (message === 'node-red-timer-poe-installed') {
                        this.node_red_timer_poe_installed = true; 
                    } else {
                        this.node_red_timer_poe_installed = false;
                    }
                } catch (error) {
                    console.error("Fetch failed:", error);
                }
        }
        get_check_if_node_red_timer_poe_installed();

  },
  methods: {
    checkPassword() {
      if (this.stateStore.isAuthenticated) {
        this.drawer = true
      } else {
        this.passwordDialog = true
        this.password = ''
        this.passwordError = ''
      }
    },
    validatePassword() {
      if (this.password === 'octava') {
        this.stateStore.setAuthenticated(true)
        this.passwordDialog = false
        this.drawer = true
        this.passwordError = ''
      } else {
        this.passwordError = 'Incorrect password'
      }
    },
    cancelPassword() {
      this.passwordDialog = false
      this.password = ''
      this.passwordError = ''
    },
    navigate(path) {
      this.router.push(path)
      this.drawer = false
    },
    async savePreset(preset) {
      const result = await this.stateStore.savePreset(preset)
      console.log(result.message)
      this.drawer = false
    },
    async clearPreset(preset) {
      console.log('Enter clearPrset')
      const result = await this.stateStore.clearPreset(preset)
    },
  }
}
</script>
