<template>
  <div class="dashboard">

      <div id="vital-stat" class="grid-container">
          <div class="grid-item model-display-text"> Model : {{stateStore.status.model}}</div>
          <div class="grid-item"> IP : {{stateStore.status.SwitchIPAddress}}</div>
          <div class="grid-item"> Temperature : {{stateStore.status.Temperature}} &#8451;</div>
          <div class="grid-item">Power Supply : {{stateStore.status.PS1Stat}}</div>
          <div class="grid-item"> PoE : {{stateStore.status.PoE}} Watts</div>
          <div class="grid-item"> PoE Usage : {{stateStore.status.PoE_Percentage}} %</div>
          <div class="grid-item"><span><v-icon size="small">mdi-fan</v-icon>1 : {{stateStore.status.Fan1Stat}}</span></div>
          <div class="grid-item"><span><v-icon size="small">mdi-fan</v-icon>2 : {{stateStore.status.Fan2Stat}}</span></div>
          <div class="grid-item"><span><v-icon size="small">mdi-fan</v-icon>3 : {{stateStore.status.Fan3Stat}}</span></div>
          <div class="grid-item"><span><v-icon size="small" color="blue">mdi-inbox</v-icon></span>Transmitters : {{txCount}}</div>
          <div class="grid-item"><span><v-icon size="small" color="orange">mdi-inbox</v-icon></span>Receivers : {{rxCount}}</div>
          <div class="grid-item"><span><v-icon size="small" color="white">mdi-inbox</v-icon></span>LAN</div>
      </div>

      <!-- SG350 series switch -->
     <div v-if="isSG350" class="sg350">
        <div v-if="SG350_52p" class="port1-48">
            <div class="grid-item" v-for="(item, index) in portS" :key="index" ><v-icon size="small" :style="{color: portsColor[index],opacity: portsActive[index]}">mdi-inbox</v-icon>{{item+1}}</div>
        </div>  
        <div v-else class="port1-24">
            <div class="grid-item" v-for="(item, index) in portS" :key="index" ><v-icon size="small" :style="{color: portsColor[index],opacity: portsActive[index]}">mdi-inbox</v-icon>{{item+1}}</div>
        </div> 
        <div class="port-combo-sfp">
            <div class="grid-item"><v-icon size="small" :style="{color: portsColor[portS.length],opacity: portsActive[portS.length]}">mdi-inbox</v-icon>{{portS.length+1}}</div>       
            <div class="grid-item"><v-icon size="small" :style="{color: portsColor[portS.length],opacity: portsActive[portS.length]}">mdi-crop-free</v-icon>{{portS.length+1}}b</div>       
            <div class="grid-item"><v-icon size="small" :style="{color: portsColor[portS.length+2],opacity: portsActive[portS.length+2]}">mdi-crop-free</v-icon>{{portS.length+3}}</div>       
            <div class="grid-item"><v-icon size="small" :style="{color: portsColor[portS.length+1],opacity: portsActive[portS.length+1]}">mdi-inbox</v-icon>{{portS.length+2}}</div>       
            <div class="grid-item"><v-icon size="small" :style="{color: portsColor[portS.length+1],opacity: portsActive[portS.length+1]}">mdi-crop-free</v-icon>{{portS.length+2}}b</div>       
            <div class="grid-item"><v-icon size="small" :style="{color: portsColor[portS.length+3],opacity: portsActive[portS.length+3]}">mdi-crop-free</v-icon>{{portS.length+4}}</div>       
        </div>
     </div>
      <!-- CBS 250/350 C1200/1300series switch -->
     <div v-else class="cbs250_350">
        <div v-if="cbs250_350_48p" class="cbs_port1-48">
            <div class="grid-item cbs-black" v-for="(item, index) in portS" :key="index" ><v-icon size="small" :style="{color: portsColor[item-1],opacity: portsActive[item-1]}">mdi-inbox</v-icon>{{item}}</div>
        </div>  
        <div v-else-if="cbs250_350_24p" class="cbs_port1-24">
            <div class="grid-item cbs-black" v-for="(item, index) in portS" :key="index" ><v-icon size="small" :style="{color: portsColor[item-1],opacity: portsActive[item-1]}">mdi-inbox</v-icon>{{item}}</div>
        </div> 
        <div v-else-if="cbs250_350_16p" class="cbs_port1-16">
            <div class="grid-item cbs-black" v-for="(item, index) in portS" :key="index" ><v-icon size="small" :style="{color: portsColor[item-1],opacity: portsActive[item-1]}">mdi-inbox</v-icon>{{item}}</div>
        </div> 
        <div v-else-if="cbs250_350_8p" class="cbs_port1-8">
            <div class="grid-item cbs-black" v-for="(item, index) in portS" :key="index" ><v-icon size="small" :style="{color: portsColor[item-1],opacity: portsActive[item-1]}">mdi-inbox</v-icon>{{item}}</div>
        </div> 
        <!-- SFP Ports -->
        <div v-if="cbs250_350_8p" class="cbs_250_350-8p-sfp">
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length+1],opacity: portsActive[portS.length+1]}">mdi-inbox</v-icon>{{portS.length+1}}</div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length+2],opacity: portsActive[portS.length+2]}">mdi-inbox</v-icon>{{portS.length+2}}</div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length+1],opacity: portsActive[portS.length+1]}">mdi-crop-free</v-icon>{{portS.length+1}} </div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length+2],opacity: portsActive[portS.length+2]}">mdi-crop-free</v-icon>{{portS.length+2}}</div>       
        </div>
        <div v-else-if="cbs250_350_16p" class="cbs_250_350-16p-sfp">
            <div class="grid-item hidden"><v-icon size="small">mdi-crop-free</v-icon>{{portS.length+1}}</div>       
            <div class="grid-item hidden"><v-icon size="small">mdi-crop-free</v-icon>{{portS.length+2}}</div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length],opacity: portsActive[portS.length]}">mdi-crop-free</v-icon>{{portS.length+1}}</div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length+1],opacity: portsActive[portS.length+1]}">mdi-crop-free</v-icon>{{portS.length+2}}</div>       
        </div>
        <div v-else-if="cbs250_350_24p" class="cbs_250_350-24p-sfp"> 
            <div class="grid-item hidden"><v-icon size="small">mdi-crop-free</v-icon>{{portS.length+1}}</div>       
            <div class="grid-item hidden"><v-icon size="small">mdi-crop-free</v-icon>{{portS.length+2}}</div>       
            <div class="grid-item hidden"><v-icon size="small">mdi-crop-free</v-icon>{{portS.length+3}}</div>       
            <div class="grid-item hidden"><v-icon size="small">mdi-crop-free</v-icon>{{portS.length+4}}</div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length],opacity: portsActive[portS.length]}">mdi-crop-free</v-icon>{{portS.length+1}}</div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length+1],opacity: portsActive[portS.length+1]}">mdi-crop-free</v-icon>{{portS.length+2}}</div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length+2],opacity: portsActive[portS.length+2]}">mdi-crop-free</v-icon>{{portS.length+3}}</div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length+3],opacity: portsActive[portS.length+3]}">mdi-crop-free</v-icon>{{portS.length+4}}</div>       
        </div>
        <div v-else class="cbs_250_350-48p-sfp">
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length],opacity: portsActive[portS.length]}">mdi-crop-free</v-icon>SF-49</div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length+2],opacity: portsActive[portS.length+2]}">mdi-crop-free</v-icon>SF-51</div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length+1],opacity: portsActive[portS.length+1]}">mdi-crop-free</v-icon>SF-50</div>       
            <div class="grid-item cbs-black"><v-icon size="small" :style="{color: portsColor[portS.length+3],opacity: portsActive[portS.length+3]}">mdi-crop-free</v-icon>SF-52</div>       
        </div>

     </div>

    <div id="progress-container">
      <v-progress-linear 
        :model-value="completionValue" 
        color="blue" 
        height="25"
      ></v-progress-linear>
      <div class="progressFeedback">Reading switch settings {{completion}}</div>
    </div>


    <v-btn v-if="showSaveButton" @click="save" color="blue" size="large" :disabled="onOff">
      <v-icon start>mdi-content-save</v-icon>
      Save
    </v-btn>
    <v-btn v-else @click="cancel" color="red" size="large">
      <v-icon start>mdi-cancel</v-icon>
      Cancel
    </v-btn>


  </div>
</template>

<script>
import { useStateStore } from '@/stores/stateStores'

export default {
  name: 'Dashboard',
  setup() {
    const stateStore = useStateStore()
    return { stateStore }
  },
  data () {
    return {
        completion: '0%',
        completionValue: 0,
        showSaveButton: true,
        onOff: true,
        SG350_52p: false,
        cbs250_350_8p: false,
        cbs250_350_16p: false,
        cbs250_350_24p: false,
        cbs250_350_48p: false,
        timer: null,
    }
  },
  computed:{
      portS: function(){
        let portS = []
        console.log('portS: model =', this.stateStore.status.model)
        const model = this.stateStore.status.model
        if(model?.includes('SG350-52')){
          portS = [...Array(48).keys()] 
        }else if (model?.includes('SG350-28')){
          portS = [...Array(24).keys()] 
        }else if (model?.includes('CBS250-48') || model?.includes('CBS350-48') || model?.includes('C1200-48')|| model?.includes('C1300-48')){
          portS = [1,3,5,7,9,11,13,15,17,19,21,23,25,27,29,31,33,35,37,39,41,43,45,47,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48] 
        }else if (model?.includes('CBS250-24') || model?.includes('CBS350-24') || model?.includes('C1200-24')|| model?.includes('C1300-24')){
          portS = [1,3,5,7,9,11,13,15,17,19,21,23,2,4,6,8,10,12,14,16,18,20,22,24] 
        }else if (model?.includes('CBS250-16') || model?.includes('CBS350-16') || model?.includes('C1200-16') || model?.includes('C1300-16')){
          portS = [1,3,5,7,9,11,13,15,2,4,6,8,10,12,14,16] 
        }else if (model?.includes('CBS250-8') || model?.includes('CBS350-8') || model?.includes('C1200-8') || model?.includes('C1300-8')){
          portS = [1,2,3,4,5,6,7,8] 
        }

        return portS
      },

      isSG350:function(){
        const model = this.stateStore.status.model
        if(model?.includes('SG350-52')){
          this.SG350_52p = true
          return true
        }else if(model?.includes('SG350-28')){
          this.SG350_52p = false
          return true
        }else if(model?.includes('CBS250-48') || model?.includes('CBS350-48') || model?.includes('C1200-48')|| model?.includes('C1300-48')){
          this.cbs250_350_48p = true
          return false
        }else if(model?.includes('CBS250-24') || model?.includes('CBS350-24') || model?.includes('C1200-24')|| model?.includes('C1300-24')){
          this.cbs250_350_24p = true
          return false
        }else if(model?.includes('CBS250-16') || model?.includes('CBS350-16') || model?.includes('C1200-16')|| model?.includes('C1300-16')){
          this.cbs250_350_16p = true
          return false
        } else if(model?.includes('CBS250-8') || model?.includes('CBS350-8') || model?.includes('C1200-8') || model?.includes('C1300-8')){
          this.cbs250_350_8p = true
          return false
        }
        return false
      },
      txCount: function(){
        // Count of TX 
        let txCount = 0
        //  Switch configured as Vlan2 only- used as RX only switch.
        if(this.stateStore.status.PortVlanMembership && [...new Set(this.stateStore.status.PortVlanMembership)].length == 2){
            txCount = 0 // TX = 0
        }else if(this.stateStore.status.PortVlanMembership){
            txCount = [...new Set(this.stateStore.status.PortVlanMembership)].length - 1
        }
        return txCount

      },
      rxCount: function(){
        // Count of rx
        let rxCount = 0
        //rxCount = this.portS.length - this.txCount
        const model = this.stateStore.status.model
        if(model?.includes('SG350-28')|| model?.includes('SG350-52')){
              rxCount = this.portS.length - this.txCount - (this.stateStore.status.vlan1Count-4)
        }else if(model?.includes('CBS250-8')|| model?.includes('CBS350-8') || model?.includes('C1200-8')|| model?.includes('C1300-8')){
              rxCount = this.portS.length - this.txCount - (this.stateStore.status.vlan1Count-2)
        }else if(model?.includes('CBS250-16')|| model?.includes('CBS350-16') || model?.includes('C1200-16')|| model?.includes('C1300-16')){
              rxCount = this.portS.length - this.txCount - (this.stateStore.status.vlan1Count-2)
        }else if(model?.includes('CBS250-24')|| model?.includes('CBS350-24') || model?.includes('C1200-24')|| model?.includes('C1300-24')){
              rxCount = this.portS.length - this.txCount - (this.stateStore.status.vlan1Count-4)
        }else if(model?.includes('CBS250-48')|| model?.includes('CBS350-48') || model?.includes('C1200-48')|| model?.includes('C1300-48')){
              rxCount = this.portS.length - this.txCount - (this.stateStore.status.vlan1Count-4)
        }
    
        return rxCount
      },
      portsColor: function() {
            let portsColor = []
            // Check if PortVlanMembership exists and has data
            if (!this.stateStore.status.PortVlanMembership || this.stateStore.status.PortVlanMembership.length === 0) {
              return portsColor
            }
            // Cisco Switch configured for TX and RX
            if(this.txCount !== 0 && this.txCount !== ''){
              
                this.stateStore.status.PortVlanMembership.forEach((item,index)=>{
              
               if(index <= this.txCount-1){
                    if(item == 1){
                        portsColor.push('white')
                    }else {
                        portsColor.push('#2196f3')  //TX color is blueish
                    }
                  }else{
                    if(item == 1){
                        portsColor.push('white')
                    }else{
                        portsColor.push('orange')  //RX color orange color
                    }
                  }
                })

            // Cisco Switch configured for RX only. All ports are configured as vlan2 and vlan 1
            }else{
               this.stateStore.status.PortVlanMembership.forEach((item)=>{
                 if(item == 1){
                     portsColor.push('white')
                 }else{
                     portsColor.push('orange')  //RX color orange color
                 }
                })
            }
          return portsColor
        },

        portsActive: function(){
          let portsActive = []
          // Check if PortOperationalStatus exists
          if (!this.stateStore.status.PortOperationalStatus || this.stateStore.status.PortOperationalStatus.length === 0) {
            return portsActive
          }
          
          this.stateStore.status.PortOperationalStatus.forEach((item)=>{
            //port active
            if(item == 1){
                portsActive.push(1) //set opacity to 1
            //port NOT active
            }else{
                portsActive.push(0.3)  //set opacity to .3
            }
          })
          return portsActive
        },

  },
  methods:{
      async save(){
            const serverURL = location.hostname
            // Save switch config to server
            let switchConfig = {"model":"","ip":"","TXports":"" ,"RXports":""}  //
            switchConfig['model'] = this.stateStore.status.model
            switchConfig['ip'] = this.stateStore.status.SwitchIPAddress
            switchConfig['TXports'] = this.txCount
            switchConfig['RXports'] = this.rxCount
            
            try {
              await fetch(`http://${serverURL}:3000/write/UserSwitchConfig/${JSON.stringify(switchConfig)}`)
              // Show Home Page
              this.$router.push({name:'home'})
            } catch (error) {
              console.log(error)
            }
       },
      cancel(){
            // Show Home Page
              this.$router.push({name:'home'})
      },
},
  created(){

  },
  mounted(){
    const serverURL = location.hostname

    //clearVariablesNodeRed
     fetch(`http://${serverURL}:1880/clearVariablesNodeRed`)
    .then(()=> {
    })
    .catch(error => console.log(error));
       
    //Run progress bar and update every 600ms. Hide Save button until after 1 minute
    let counter = 0
    this.timer = setInterval(()=>{
        counter++
        this.completion = `${counter}%`
        this.completionValue = counter
        if(counter == 100){
          clearInterval(this.timer)
          if(this.stateStore.status.model !== ''){
            
            this.onOff = false

          //switch not detected
          }else{
            alert("Switch not detected. Please check")
             this.showSaveButton = false
          }
          
        }
    },600)

  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

}
</script>

<style scoped>
.dashboard{
    display:flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    height:90vh;
    margin: 0 auto;
    max-width: 100%;
}
.grid-container {
  color:white;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: start;
  grid-gap: 10px;
  height:20vh;
  width:90%;
  border:1px solid  white;
  border-radius:6px;
}
.sg350,.cbs250_350{
  display:flex;
  flex-direction:row;
  width:90%;
  justify-content: center;
  align-items: center;
  background-color: rgb(28,28,30);
  border:3px solid rgb(28,28,30) ;
}
.cbs250_350{
  color:white;
  display:flex;
  flex-direction:row;
  width:90%;
  justify-content: center;
  align-items: center;
  background-color: whitesmoke;
  border:3px solid whitesmoke ;
}
.port1-48{
  color:white;
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  align-items: center;
  grid-gap: 2px;
  width:87.5%;
  height:15vh;
}
.port1-24{
  color:white;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  align-items: center;
  grid-gap: 2px;
  width:87.5%;
  height:15vh;
}

.cbs_port1-48{
  color:white;
  display: grid;
  grid-template-columns: repeat(24, 1fr);
  align-items: center;
  grid-gap: 2px;
  width:87.5%;
  height:15vh;
}
.cbs_port1-24{
  color:white;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  align-items: center;
  grid-gap: 2px;
  width:87.5%;
  height:15vh;
}
.cbs_port1-16{
  color:white;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  align-items: center;
  grid-gap: 2px;
  width:87.5%;
  height:15vh;
}
.cbs_port1-8{
  color:white;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  align-items: center;
  grid-gap: 2px;
  width:87.5%;
  height:15vh;
}
.port-combo-sfp{
  color:white;
  margin:2px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  width:12.5%;
  height:15vh;
}
.cbs_250_350-16p-sfp{
  color:white;
  margin:2px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  width:12.5%;
  height:15vh;
 }
 .cbs_250_350-8p-sfp{
  color:white;
  margin:2px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  width:12.5%;
  height:15vh;
 }
 .cbs_250_350-24p-sfp{
  color:white;
  margin:2px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  width:12.5%;
  height:15vh;
 }
 .cbs_250_350-48p-sfp{
  color:white;
  margin:2px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  width:12.5%;
  height:15vh;
 }
.grid-item{
  display:flex;
  flex-direction: column;
  align-items: center;
  border:1px solid #2c3e50
}
.model-display-text {
  font-size: 0.75em; /* Smaller font size */
  white-space: nowrap; /* Prevent text wrapping */
}
.cbs-black{
   background-color: rgb(28,28,30);
}

#vital-stat div{
  border:1px none red;
}

#progress-container{
  display:flex;
  flex-direction:column;
  justify-content: center;
  align-items: center;
  width: 30%
}
.progressFeedback{
  color:white;
  margin-top: 8px;
}
.hidden{
  opacity:0;
}

</style>
