<template>
  <div class="container">
    <div v-if="!rebooting" class="w-100 d-flex flex-column align-center">
      <h4 class='white-text mb-3'>Current Time is {{ currentTimeFormatted }}</h4>
      <div class="card-container">
        <v-card class="mx-auto timer-card" max-width="500" width="100%" elevation="4">
          <v-btn icon @click="closeCard()" size="small" variant="text" style="position:absolute; top:8px; right:8px; z-index:2;">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-card-title class="d-flex justify-center pt-4">
            <span class="text-h6 font-weight-bold">PoE Timer & Time Zone</span>
          </v-card-title>
          <v-card-text class="pa-4">
            <!-- Time Zone Selection -->
            <div class="timezone-section mb-4">
              <div class="text-subtitle-2 font-weight-bold mb-1 text-grey-darken-2">Time Zone</div>
              <v-select
                v-model="selectedTimeZone"
                :items="timeZoneSelectItems"
                item-title="title"
                item-value="value"
                label="Select Time Zone"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-map-clock-outline"
                hide-details
              ></v-select>
            </div>

            <v-divider class="my-3"></v-divider>

            <!-- PoE Off Time Section -->
            <div class="poe-section">
              <div class="text-subtitle-2 font-weight-bold mb-1 text-grey-darken-2">PoE Power Schedule</div>
              <div>
                <div v-if="!stateStore.status.offtime" class="text-center text-grey-darken-1 py-1">Not Scheduled</div>
                <div v-else class="text-center font-weight-bold text-blue py-1">Current Off Time: {{ formattedCurrentOffTime }}</div>
              </div>
              <div class="d-flex flex-column align-center justify-center mt-3">
                <div class="d-flex align-center justify-center flex-wrap ga-2">
                  <v-btn color="blue" @click="dialog = true" class="text-white" prepend-icon="mdi-clock-outline">
                    Set PoE Off Time
                  </v-btn>
                </div>

                <v-dialog v-model="dialog" max-width="350">
                  <v-card>
                    <v-card-text class="pa-2">
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
                      <v-btn color="primary" variant="text" @click="dialog = false">OK</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="d-flex justify-space-between px-4 pb-4">
            <v-btn @click="clearTimer()" color="red" variant="flat" class="text-white" prepend-icon="mdi-clock-remove-outline">
              Clear Time
            </v-btn>
            <v-btn @click="save()" color="blue" variant="flat" class="text-white" prepend-icon="mdi-content-save">
              Save and Reboot
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>
    </div>

    <div v-if="rebooting" class="progress-container">
      <v-progress-circular
        :model-value="value"
        :rotate="360"
        :size="100"
        :width="15"
        color="blue"
      >
        {{ value }}
      </v-progress-circular>
      <div class="progress-feedback mt-4 text-subtitle-1"> Please Wait. Restarting Controller </div>
    </div>

  </div>
  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="4000" location="top">
    {{ snackbarText }}
    <template v-slot:actions>
      <v-btn variant="text" @click="snackbar = false" class="text-white">Close</v-btn>
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
  async created() {
    const serverURL = location.hostname;
    try {
      const response = await fetch(`http://${serverURL}:3000/read/UserSwitchConfig`);
      const config = await response.json();
      if (config) {
        if (config.timezone) {
          this.selectedTimeZone = config.timezone;
        }
        if (config.offTime) {
          this.offTime = this.normalizeTo24Hour(config.offTime);
        }
        if (config.onTime) {
          this.onTime = this.normalizeTo24Hour(config.onTime);
        }
      }
    } catch (error) {
      console.error('Error loading switch config:', error);
    }
  },
  data() {
    return {
      now: new Date(),
      clockInterval: null,
      onTime: '',
      offTime: '',
      dialog: false,
      selectedTimeZone: 'America/New_York',
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'blue',
      rebooting: false,
      interval: {},
      value: 0,
      timeZoneGroups: [
        {
          "label": "US & Canada",
          "value": [
            {"label": "Eastern Time (US & Canada)", "value": "America/New_York"},
            {"label": "Central Time (US & Canada)", "value": "America/Chicago"},
            {"label": "Mountain Time (US & Canada)", "value": "America/Denver"},
            {"label": "Pacific Time (US & Canada)", "value": "America/Los_Angeles"},
            {"label": "Alaska", "value": "America/Anchorage"},
            {"label": "Hawaii", "value": "America/Adak"}
          ]
        },
        {
          "label": "Europe",
          "value": [
            {"label": "London / Dublin (GMT)", "value": "Europe/London"},
            {"label": "Paris / Berlin / Rome (CET)", "value": "Europe/Paris"},
            {"label": "Eastern Europe / Athens (EET)", "value": "Europe/Athens"},
            {"label": "Moscow", "value": "Europe/Moscow"}
          ]
        },
        {
          "label": "Asia & Australia",
          "value": [
            {"label": "Tokyo / Seoul", "value": "Asia/Tokyo"},
            {"label": "Hong Kong / Beijing / Singapore", "value": "Asia/Hong_Kong"},
            {"label": "India (IST)", "value": "Asia/Kolkata"},
            {"label": "Sydney / Melbourne", "value": "Australia/Sydney"},
            {"label": "Auckland / Wellington", "value": "Pacific/Auckland"}
          ]
        },
        {
          "label": "Americas (Other)",
          "value": [
            {"label": "Mexico City", "value": "America/Mexico_City"},
            {"label": "São Paulo", "value": "America/Sao_Paulo"},
            {"label": "Buenos Aires", "value": "America/Argentina/Buenos_Aires"}
          ]
        }
      ]
    };
  },
  computed: {
    currentTimeFormatted() {
      try {
        return this.now.toLocaleTimeString('en-US', {
          timeZone: this.selectedTimeZone || 'America/New_York',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
      } catch (e) {
        return this.now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
      }
    },
    formattedOffTime() {
      return this.formatTo12Hour(this.offTime);
    },
    formattedCurrentOffTime() {
      return this.formatTo12Hour(this.stateStore.status.offtime);
    },
    timeZoneSelectItems() {
      const items = [];
      this.timeZoneGroups.forEach((group, index) => {
        if (index > 0) {
          items.push({ type: 'divider' });
        }
        items.push({ type: 'subheader', title: group.label });
        group.value.forEach((tz) => {
          items.push({
            title: tz.label,
            value: tz.value
          });
        });
      });
      return items;
    }
  },
  methods: {
    normalizeTo24Hour(timeStr) {
      if (!timeStr) return '';
      timeStr = String(timeStr).trim();
      const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
      if (ampmMatch) {
        let hour = parseInt(ampmMatch[1], 10);
        const minute = ampmMatch[2];
        const modifier = ampmMatch[3].toUpperCase();
        if (modifier === 'PM' && hour !== 12) {
          hour += 12;
        } else if (modifier === 'AM' && hour === 12) {
          hour = 0;
        }
        return `${hour.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
      }
      const match24 = timeStr.match(/^(\d{1,2}):(\d{2})/);
      if (match24) {
        const hour = parseInt(match24[1], 10);
        const minute = match24[2];
        return `${hour.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
      }
      return timeStr;
    },
    formatTo12Hour(timeStr) {
      if (!timeStr) return '';
      const norm = this.normalizeTo24Hour(timeStr);
      if (!norm) return '';
      const parts = norm.split(':');
      if (parts.length < 2) return norm;
      let hour = parseInt(parts[0], 10);
      const minute = parts[1];
      const modifier = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12;
      return `${hour}:${minute} ${modifier}`;
    },
    closeCard() {
      this.$router.push({ name: `home` });
    },
    clearTimer() {
      this.onTime = '';
      this.offTime = '';
      this.save();
    },
    startTimer() {
      // wait for 60 seconds while server reboots, then reload and goto page /
      this.interval = setInterval(() => {
        this.value = this.value === 100 ? 0 : this.value + 1;

        if (this.value == 100) {
          this.rebooting = false;
          this.$router.push('/');
          setTimeout(function() {
            location.reload();
          }, 3000);
        }
      }, 600);
    },
    save(e) {
      const finalOnTime = this.normalizeTo24Hour(this.onTime);
      const finalOffTime = this.normalizeTo24Hour(this.offTime);
      const serverURL = location.hostname;
      const switchConfig = {
        model: this.stateStore.status.model,
        ip: this.stateStore.status.SwitchIPAddress,
        TXports: this.stateStore.status.txCount,
        RXports: this.stateStore.status.rxCount,
        onTime: finalOnTime,
        offTime: finalOffTime,
        timezone: this.selectedTimeZone,
      };
      const jsonConfig = JSON.stringify(switchConfig);
      console.log(`http://${serverURL}:3000/write/UserSwitchConfig/${jsonConfig}`);

      this.rebooting = true;
      this.startTimer();

      fetch(`http://${serverURL}:3000/write/UserSwitchConfig/${encodeURIComponent(jsonConfig)}`)
        .then(() => {
          fetch(`http://${serverURL}:1880/timer/poe`);
          if (this.selectedTimeZone) {
            console.log(`http://${serverURL}:1880/set_time_zone?value=${this.selectedTimeZone}`);
            fetch(`http://${serverURL}:1880/set_time_zone?value=${encodeURIComponent(this.selectedTimeZone)}`);
          }
        })
        .catch((error) => console.error('Error saving switch config:', error));
    },
  },
  mounted() {
    this.clockInterval = setInterval(() => {
      this.now = new Date();
    }, 1000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
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
  min-height: 80vh;
  margin: 0 auto;
  color: white;
}
.card-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.timer-card {
  background: #fff !important;
  color: #000 !important;
  position: relative;
  border-radius: 12px;
}
.compact-time-picker {
  max-width: 220px;
  margin: 0 auto;
  font-size: 0.85rem;
}
.progress-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.progress-feedback {
  color: white;
}
</style>


