<template>
    <v-container>
        <div class="update">
                <h5 v-if="!rebooting">Update dist.tar file</h5>
                    <div v-if="showFileButton" id="input">
                    <input v-on:change="fileSelect" id="file-select-button" type="file" accept=".tar">
                </div>

                <div v-if="showUploadButton" class="field center-align">
                <button v-on:click="upload" class="waves-effect waves-light btn blue"><v-icon icon="mdi-upload"></v-icon>publish upload</button>
                </div>

                <div v-if="showProgressBar" id="progress-container">
                  <div class="progress">
                      <div class="determinate blue" v-bind:style="{width: completion}"></div>
                  </div>
                  <div v-if="!rebooting" class="progressFeedback">Uploading {{completion}}</div>
                  
                    <v-progress-circular v-if="rebooting"
                      :model-value="value"
                      :rotate="360"
                      :size="100"
                      :width="15"
                      color="blue"
                    >
                      {{ value }}
                  </v-progress-circular>
                  <div v-if="rebooting"> Please Wait. Restarting Controller </div>
                </div>
        </div>

    </v-container>

</template>

<script>

import axios from 'axios'
import { useStateStore } from '@/stores/stateStores'


export default {
  name: 'Update',
  props: [],
   setup(){
    // Pinia
      const statusStore = useStateStore()
      return {statusStore}
    },
  data () {
    return {
      selectedFile: null,
      completion: '0%',
      showFileButton: true,
      showUploadButton: false,
      showProgressBar: false,
      rebooting: false,
      interval: {},
      value: 0,

    }
  },
  computed:{

  },
  methods:{
    startTimer(){
      // wait for 60 seconds while server reboots, then reload and goto page /
        this.interval = setInterval(() => {
        this.value = this.value === 100 ? 0 : this.value + 1

        if(this.value == 100){
            this.rebooting = false
            this.$router.push('/')
            setTimeout(function() {location.reload()}, 3000)
        }
      }, 600)
    },
    fileSelect(event){
      this.showFileButton = false
      this.showUploadButton = true
      this.selectedFile = event.target.files[0]  // get selected file 
    },
    upload(){
      const serverURL = `${location.hostname}:1880`
      const fd = new FormData()

      // file name and type must be "dist.tar" and a tar file
      if(this.selectedFile == null){
          alert('No file selected')
      }else{
        if((this.selectedFile.type == 'application/x-tar')&&(this.selectedFile.name == 'dist.tar')){
          this.showFileButton = false
          this.showUploadButton = false
          this.showProgressBar = true
          fd.append('image',this.selectedFile)
          axios.post(`http://${serverURL}/update`,fd,{
           onUploadProgress:  uploadEvent => {
            // Do whatever you want with the native progress event
            console.log('upload progress:' + Math.round(uploadEvent.loaded/uploadEvent.total * 100) +'%')
            this.completion = Math.round(uploadEvent.loaded/uploadEvent.total * 100).toString() + '%'
          },

          })
          .then(res => {
            // JSON responses are automatically parsed.
            console.log(res.status)
            if (res.status === 200) {
              this.rebooting = true
              this.startTimer()
           
            } else {
              // Handle the user data here...
              alert('fail')
            }
        
          })
          .catch(e => {
            console.error(e)
          })

        }else{
          // file not dist.tar . do nothing
          alert('Wrong file.File should be dist.tar. Please contact info@octavainc.com to get correct file')
        }
      }
      
    }
  },

  //Life Cycle Hooks
  async created(){
        // this.statusStore.showSideMenu = false
  },
  mounted(){

  },
  beforeUnmount(){
    clearInterval(this.interval)
  }

}
</script>

<style scoped>
.update{
  display:flex;
  flex-direction: column;
  color:white;
  justify-content: center;
  align-items: center;
  width: 100%;
  height:80vh;
}
#input{
    margin-top:50px;
}
#file-select-button{
    /* padding:50px; */
}
button{
  background-color: rgb(0,122,255);
  padding: .5em .5em;
  border-radius: 1em;
  border: none;
}
input[type="file"]::file-selector-button {
  padding: .5em .5em;
  border-radius: 1em;
  border: none;
  background-color:  rgb(0,122,255);
}
#progress-container{
  display:flex;
  flex-direction:column;
  justify-content: center;
  align-items: center;
  /* border:1px solid red; */
  width: 30%
}
.progress{
  width:100%;
  background-color: white;
}
.progressFeedback{
  color:white;
}


</style>
