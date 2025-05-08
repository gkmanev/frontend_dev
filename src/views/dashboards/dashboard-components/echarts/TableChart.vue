<template>
   <b-row>
    <b-col cols="12">
      <b-card class="mb-4">
        <h5 class="card-title mb-3">Installed Smartmeters</h5>
        <b-table :items="all" :fields="fields" :select-mode="selectMode" responsive="sm" ref="selectableTable" >
          <template #cell(selected)="data">
            <b-form-checkbox v-model="data.item.selected" @change="toggleRowSelection(data.item)"></b-form-checkbox>
          </template>
          <!-- Scoped slot for the 'online' status -->
          <template #cell(status)="{ item }">
            <span class="led-indicator" :class="getLedClass(item.online)"></span>
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
  import { mapActions } from 'vuex';
  // import { coords } from './coords.js';
  //import PahoMQTT from 'paho-mqtt';
  export default {
  
    data() {
      return {
        selectMode: 'multi',        
        selected: [],
        fields: [
        { key: 'selected', sortable: false },
        { key: 'id', sortable: true },
        { key: 'status', sortable: true },
        { key: 'customer', sortable:true},
        { key: 'power', sortable: true, label: 'Power kW'},
        { key: 'capacity', label: 'Capacity'}, 
        { key: 'clsA', sortable: true, label: 'Cluster A' },
        { key: 'clsB', sortable: true, label: 'Cluster B' },
        { key: 'clsC', sortable: true, label: 'Cluster C' },
        // { key: 'long', sortable: true, label: 'Longitude' },
        // { key: 'type', sortable: true },
        // { key: 'assaignCap', label: 'Asign Capacity'},       
         
        // { key: 'grid', label: 'Grid Node'}  
      ],        
        power: '',
        powerCorr:'',
        time:'',
        countDown: {},
        polling: null,
        newEntries: {},
        singleCorrection:{},
        checked: true,
        allSelected: true,
        activeClass: 'disabled',
        btn_class: 'btn btn-success mb-2',
        all: [],
        posts: [],
        preparedArrForLineChartsToggle:[],


        
        sm_coeff: [{"sm-0001":120},{"sm-0002":320},{"sm-0003":400},{"sm-0004":200},{"sm-0006":200},{"sm-0008":200},{"sm-0009":80},
                   {"sm-0010":60},{"sm-0011":60},{"sm-0015":60},{"sm-0016":250},{"sm-0017":200},{"sm-0018":400},{"sm-0019":500},{"sm-0020":500},{"sm-0025":200}],  
      };
    },
  
    methods: {      

        ...mapActions(['checkedDevsCreation','selectBoxDevsCreation']),
        
        initializeSelection() {
          this.all.forEach(item => {
            item.selected = true;
          });
        },
        toggleRowSelection() {
         
          
          const allDevsArr = this.all.map(item => ({ [item.id]: item.selected }));
          const mergedObject = allDevsArr.reduce((acc, obj) => {
          // Get the key (device ID) and value (selected state) from each object in the array
            const [key, value] = Object.entries(obj)[0];
            // Merge the key-value pair into the accumulator object
            acc[key] = value;
            return acc;
          }, {});
    
          this.selectBoxDevsCreation(mergedObject)  
 
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
        
        // const sel = selectedItems.map(item => item.id)
        // const allDevsArr = this.all.map(item => ({ [item.id]: true }));
                
        // allDevsArr.forEach(el=>{
        //   if (sel.includes(Object.keys(el)[0])) {
        //     // If it exists, set its value to true
        //     el[Object.keys(el)[0]] = true;
        // } else {
        //     // If it doesn't exist, set its value to false
        //     el[Object.keys(el)[0]] = false;
        // }
        // })
        // this.preparedArrForLineChartsToggle = allDevsArr
        // this.checkedDevsCreation(allDevsArr)


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
      this.pollData(),
      // Call selectAllRows to select all rows by default
      
      this.$nextTick(() => {
        this.$refs.selectableTable.selectAllRows();
      });
    },
    mounted() {
      this.initializeSelection();
    },
    beforeDestroy () {
         clearInterval(this.polling)
    },
    computed: {
      isDisabled: function(){
          return !this.power || !this.countDown;
      },
      ...mapState(['all_devs']),
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
  