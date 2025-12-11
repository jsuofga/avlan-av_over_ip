<template>
  <div class="container">
    <h4 class='white-text'>Current Time is {{ stateStore.status.serverTime }}</h4>
    <div class="card-container">
      <v-card class="mx-auto timer-card" max-width="900" style="position:relative; height: 50%;">
        <v-btn icon @click="closeCard()" size="small" style="position:absolute; top:0px; right:px; z-index:2;">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-title class="d-flex justify-center">
          <span>PoE Off Time</span>
        </v-card-title>
        <v-card-text>
          <div>
            <div v-if="stateStore.status.offtime == undefined" class="text-center">Not Scheduled</div>
            <div v-else-if="stateStore.status.offtime === ''" class="text-center">Not Scheduled</div>
            <div v-else class="text-center blue--text">Off Time: {{ stateStore.status.offtime }}</div>
          </div>
          <div class="d-flex flex-column align-center justify-center mt-4" style="align-items: center;">
            <div style="width: 350px; margin: 0 auto; text-align: center;">
              <v-btn color="blue" @click="dialog = true" style="margin-bottom: 8px; color: #fff;">
                Set PoE Off Time
              </v-btn>
              <span v-if="offTime" style="margin-left: 10px; font-weight: bold; color: #1976d2;">{{ offTime }}</span>
              <v-dialog v-model="dialog" max-width="350">
                <v-card>
                  <!-- <v-card-title>PoE Power OFF time</v-card-title> -->
                  <v-card-text>
                    <v-time-picker
                      v-model="offTime"
                      format="ampm"
                      color="blue"
                      class="compact-time-picker"
                      scrollable
                    ></v-time-picker>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" text @click="dialog = false">OK</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between" style="position: absolute; bottom: 0; left: 0; width: 100%;">
          <v-btn @click="clearTimer()" class="bg-red text-white">Clear Time</v-btn>
          <v-btn @click="save()" class="bg-blue text-white">Save Time</v-btn>
        </v-card-actions>
      </v-card>
    </div>

  </div>
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000" top>
    {{ snackbarText }}
    <template v-slot:action="{ attrs }">
      <v-btn text v-bind="attrs" @click="snackbar = false" class="text-white">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { useStateStore } from '@/stores/stateStores'
export default {
  name: 'Timer',
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
   created() {

  },
  data() {
    return {
      onTime: '',
      offTime: '',
      dialog: false,
    };
  },
  methods: {
    closeCard() {
      this.$router.push({ name: `home` });
    },
    clearTimer() {
      this.onTime = '';
      this.offTime = '';
      this.save();
    },
    save(e) {
      const convertTo24Hour = (time12h) => {
        if (!time12h) return '';
        const [time, modifier] = time12h.split(' ');
        let [hour, minute] = time.split(':');
        let h = parseInt(hour, 10);
        if (modifier === 'PM' && h !== 12) {
          h += 12;
        } else if (modifier === 'AM' && h === 12) {
          h = 0;
        }
        const hourStr = h.toString().padStart(2, '0');
        const minuteStr = minute.padStart(2, '0');
        return `${hourStr}:${minuteStr}`;
      };
      const finalOnTime = convertTo24Hour(this.onTime);
      const finalOffTime = convertTo24Hour(this.offTime);
      const serverURL = location.hostname;
      const switchConfig = {
        model: this.stateStore.status.model,
        ip: this.stateStore.status.SwitchIPAddress,
        TXports: this.stateStore.status.txCount,
        RXports: this.stateStore.status.rxCount,
        onTime: finalOnTime,
        offTime: finalOffTime,
      };
      fetch(`http://${serverURL}:3000/write/UserSwitchConfig/${JSON.stringify(switchConfig)}`)
        .then(() => {
          fetch(`http://${serverURL}:1880/timer/poe`);
          if (this.offTime == '') {
            this.snackbarText = 'Cleared Timer';
            this.snackbarColor = 'blue';
          } else {
            this.snackbarText = `Saved PoE Off time to ${this.offTime}`;
            this.snackbarColor = 'blue';
          }
          this.snackbar = true;
          setTimeout(() => {
            this.$router.push({ name: `home` });
          }, 5000);
        })
        .catch((error) => console.error('Error saving switch config:', error));
    },
  },
 
};
</script>

<style scoped>
* { box-sizing: border-box; }
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
  margin: 0 auto;
  margin-top: 0;
  margin-bottom: 0;
  color: white;
}
.card-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin-top: 10px;
}
.timer-card {
  background: #fff !important;
  color: #000 !important;
  position: relative;
}
.compact-time-picker {
  max-width: 220px;
  margin: 0 auto;
  font-size: 0.85rem;
}
</style>
