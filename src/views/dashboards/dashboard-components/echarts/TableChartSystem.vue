<template>
    <b-row>
     <b-col cols="12">
       <b-card class="mb-4">
         <h5 class="card-title mb-3">Installed Smartmeters</h5>
         <b-table :items="all" :fields="fields" :select-mode="selectMode" responsive="sm" ref="selectableTable" selectable @row-selected="onRowSelected">
           <!-- Scoped slot for the 'online' status -->
           <template #cell(status)="{ item }">
             <span class="led-indicator" :class="getLedClass(item.online)"></span>
           </template>
           <template #cell(edit)="{ item }">
            
            <div class="d-flex align-items-center">
              <!-- Button to open modal -->
                <b-button size="sm" variant="primary" @click="openModal(item)">Details</b-button>
                <!-- Display the cell value -->
                
              </div>
              <!-- Modal for displaying details -->
              <b-modal :id="'modal_' + item.id" :title="modalTitle">
                <b-form-group :label="labelGrid">
                <div class="d-flex align-items-center mb-3">
                  <!-- Input field -->
                  <b-form-input v-model="inputGrid" placeholder="Enter Grid Node..." class="mr-2"></b-form-input>
                  <!-- Flex container for button -->
                  <div class="d-flex">
                    <!-- Send button -->
                    <b-button @click="sendDataGrNode(item.id)" :disabled="inputGrid === ''">Send</b-button>            
                  </div>
                </div>
              </b-form-group>
              <b-form-group :label="labelLat">
                <div class="d-flex align-items-center mb-3">
                <!-- Input field -->
                <b-form-input v-model="inputLat" placeholder="Enter Latitude..." class="mr-2"></b-form-input>
                <!-- Send button -->
                <div class="d-flex">
                <b-button @click="sendDataLat(item.id)" :disabled="inputLat === ''">Send</b-button>
                </div>
                </div>
              </b-form-group>
              <b-form-group :label="labelLong">
                <div class="d-flex align-items-center mb-3">
                <!-- Input field -->
                <b-form-input v-model="inputLong" placeholder="Enter Longitude..." class="mr-2"></b-form-input>
                <!-- Send button -->
                <div class="d-flex">
                <b-button @click="sendDataLong(item.id)" :disabled="inputLong === ''">Send</b-button>
                </div>
                </div>
              </b-form-group>
              <b-form-group :label="labelCap">
                <div class="d-flex align-items-center mb-3">
                <!-- Input field -->
                <b-form-input v-model="inputCap" placeholder="Enter Capacity..." class="mr-2"></b-form-input>
                <!-- Send button -->
                <div class="d-flex">
                <b-button @click="sendDataCap(item.id)" :disabled="inputCap === ''">Send</b-button>
                </div>
                </div>
              </b-form-group>
              <!-- Modal footer with only the "OK" button -->
              <template #modal-footer="{ cancel, ok }">
                <b-button @click="ok" variant="primary">Apply changes</b-button>
              </template>
              <!-- Add more content as needed -->
            </b-modal>
            </template>


           
           <!-- <template #cell(assaignCap)="{ item }">
             <div class="d-flex align-items-center">        
                 <input type="text" class="form-control mr-2" style="width: 50px; height: 32px;" placeholder="#" v-model="item.capacityAssign">
                 <b-button size="sm" variant="primary" @click="submitCapacity(item)">Submit</b-button>
                 
             </div>
           </template> -->
           <!-- <template #cell(capacity)="{ item }">
             <div class="d-flex align-items-center">        
                 
             </div>
           </template> -->
         </b-table>
 
         <!-- <p class="btn-grp">
           <b-button size="sm" variant="outline-primary" @click="selectAllRows">Select all</b-button>
           <b-button size="sm" variant="outline-danger" @click="clearSelected">Clear selected</b-button>
         </p>
         <p>Selected Rows:<br />{{ selected }}</p> -->
       </b-card>
     </b-col>
   </b-row>
 </template>
   
   <script>
   import { mapState } from 'vuex';
   import axios from 'axios';
   // import { coords } from './coords.js';
   //import PahoMQTT from 'paho-mqtt';
   export default {
   
     data() {
       return {
         selectMode: 'multi',        
         selected: [],
         currentGrid:'',      
         currentLat:'',
         currentLong:'',
         currentCap:'',
         inputGrid:'',
         inputLat:'',
         inputLong:'',
         inputCap:'',
         fields: [
         { key: 'id', sortable: true },
         { key: 'status', sortable: true },
         { key: 'customer', sortable:true},
         { key: 'power', sortable: true, label: 'Power kW'},
         { key: 'lat', sortable: true, label: 'Latitude' },
         { key: 'long', sortable: true, label: 'Longitude' },
         { key: 'type', sortable: true },
         // { key: 'assaignCap', label: 'Asign Capacity'},       
         { key: 'capacity', label: 'Capacity'},  
         { key: 'grid', label: 'Grid Node'}, 
         { key: 'edit', label: 'Edit SM'}  
       ],        
         power: '',
         powerCorr:'',
         time:'',
         countDown: {},
         polling: null,
         newEntries: {},
         singleCorrection:{},
         checked: {},
         allSelected: true,
         activeClass: 'disabled',
         btn_class: 'btn btn-success mb-2',
         all: [],
         posts: [],
         
 
 
         
         sm_coeff: [{"sm-0001":120},{"sm-0002":320},{"sm-0003":400},{"sm-0004":200},{"sm-0006":200},{"sm-0008":200},{"sm-0009":80},
                    {"sm-0010":60},{"sm-0011":60},{"sm-0015":60},{"sm-0016":250},{"sm-0017":200},{"sm-0018":400},{"sm-0019":500},{"sm-0020":500},{"sm-0025":200}],  
       };
     },
   
     methods: {
    
          openModal(sm) {            
            // Open modal based on grid node
            if(sm.grid){
              this.currentGrid = sm.grid
            }
            if (sm.lat){
              this.currentLat = sm.lat
            }
            if(sm.long){
              this.currentLong = sm.long
            }
            if(sm.capacity){
              this.currentCap = sm.capacity 
            }
   
            this.$bvModal.show('modal_' + sm.id);
          },      

          sendDataGrNode(id){
            console.log(this.inputGrid, id)  
            axios.post('http://85.14.6.37:16455/api/asign/',     
            {
              "dev" : id,
              "node": this.inputGrid
            }).then(response =>{
            
              this.success = 'Data saved successfully';
              this.response = JSON.stringify(response, null, 2)
            }).catch(error => {
              this.response = 'Error: ' + error.response.status
            })
            this.inputGrid = ''      


          },
          sendDataLat(id){
            console.log(this.inputLat, id)
          },
          sendDataLong(id){
            console.log(this.inputLong, id)
          },
          sendDataCap(id){           

            axios.post('http://85.14.6.37:16455/api/capa/', {
              "dev" : id,
              "capacity": this.inputCap
            }).then(response =>{
              console.log(response.data)
              this.success = 'Data saved successfully';
              this.response = JSON.stringify(response, null, 2)
            }).catch(error => {
              this.response = 'Error: ' + error.response.status
            })
            this.inputCap = ''
            



          },
 
         async pollData() {
           this.polling = setInterval(async () => {
             await this.createAllDevs();
             await this.capacityLog();
             await this.asignedNodes();
           }, 15000);
         },
         
         async capacityLog(){
 
             axios
                 .get("http://85.14.6.37:16455/api/capa_asign/")
                 .then(response => response.data.forEach(el=>{         
                     let capacityObj = {
                         "dev":el.dev,
                         "cap":el.capacity              
                     }
                     let found = this.all.find(element => element.id === capacityObj.dev)
                     if (found){
                         found.capacity = capacityObj.cap
                     }
 
                 }))
                 .catch(error=>{
                 console.log(error)
                 })
             },
           
 
         async asignedNodes(){
           axios
               .get("http://85.14.6.37:16455/api/grid_asign/")
               .then(response => response.data.forEach(el=>{                
               
                   let found = this.all.find(element => element.id === el.dev)
                   if (found){
                       found.grid = el.grid_name
                   }
 
               }))
               .catch(error=>{
               console.log(error)
               })
         
         },
 
         // submitCapacity(item) {
         //     console.log(item)
         //     axios.post('http://85.14.6.37:16455/api/capa/', {
         //         "dev" : item.id,
         //         "capacity": item.capacityAssign
         //     }).then(response =>{
         //         console.log(response.data)
         //         this.success = 'Data saved successfully';
         //         this.response = JSON.stringify(response, null, 2)
         //     }).catch(error => {
         //         this.response = 'Error: ' + error.response.status
         //     })
             
         // },
 
         getLedClass(status) {
             switch (status) {
             case 'not-ready':
                 return 'led-blue';
             case 'offline':
                 return 'led-gray';
             case 'ready':
                 return 'led-green';
             case 'providing':
                 return 'led-orange';
             default:
                 return '';
             }
         },
 
         onRowSelected(selectedItems) {
         this.selected = selectedItems;
         },
         selectAllRows() {
         this.$refs.selectableTable.selectAllRows();
         },
         clearSelected() {
         this.$refs.selectableTable.clearSelected();
         },

        updateDeviceStatus() {
          const deviceMap = {}
          this.all = []
          // Index all_devs by ID
          this.all_devs.forEach(dev => {
            deviceMap[dev.id] = dev
          })

          // Loop through online data and update matching devices
          this.online.forEach(entry => {
            const dev = deviceMap[entry.devId]
            if (dev) {
              dev.online = entry.value >= 0 ? 'not-ready' : 'offline'
              dev.power = entry.value
            }            
          })
          this.all = Object.values(deviceMap).sort((a, b) => {
            const aId = parseInt(a.id.split('-')[1])
            const bId = parseInt(b.id.split('-')[1])
            return aId - bId
          })
          .filter(dev => dev.id !== 'sm-54' && dev.id !== 'sm-55')
        },
 
       
      
       async createAllDevs() {        
         //this.all = this.all_devs
         let url =  `http://85.14.6.37:16455/api/siko/?date_range=today`
         axios.get(url)
        .then(response => {
          const data = response.data;         
          const mostRecentTimestamp = data.reduce((latest, item) => {
            return new Date(item.created_date) > new Date(latest) ? item.created_date : latest;
          }, data[0]?.created_date); 

          const uniqueLatestRecords = Object.values(
            data
              .filter(item => item.created_date === mostRecentTimestamp)
              .reduce((acc, item) => {
                acc[item.devId] = item; // override any duplicate devId
                return acc;
              }, {})
          );
          this.online = uniqueLatestRecords;
     
          this.updateDeviceStatus();
       
        })      
         
       } 
     },
   
     created (){       
       this.createAllDevs()      
       this.capacityLog()
       this.asignedNodes()
       this.pollData()
     },
     beforeDestroy () {
          clearInterval(this.polling)
     },
     computed: {
       isDisabled: function(){
           return !this.power || !this.countDown;
       },
       ...mapState(['all_devs']),

      labelGrid() {
        return `Edit Grid Node (${this.currentGrid})`;
      },
      labelLat() {
        return `Edit Latitude (${this.currentLat})`;
      },
      labelLong() {
        return `Edit Longitude (${this.currentLong})`;
      },
      labelCap() {
        return `Edit Capacity (${this.currentCap})`;
      },
      modalTitle() {
        return `Enter Smart Meter Details `;
      }
      }
   
   
   
   };
   </script>
   
   <style scoped>
   .led-indicator {
   display: inline-block;
   width: 12px;
   height: 12px;
   border-radius: 50%;
   margin-right: 5px;
 }
 
 .led-blue {
   background-color:skyblue;
 }
 
 .led-gray {
   background-color: gray;
 }
 
 .led-green {
   background-color: green;
 }
 
 .led-orange {
   background-color: orange;
 }
   </style>
   