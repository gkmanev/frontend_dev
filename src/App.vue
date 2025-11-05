<template>
  <div id="main-wrapper">
    <router-view />
  </div>
</template>

<script>

// import { mapActions } from 'vuex';
import { coords } from './coords.js';
import PahoMQTT from 'paho-mqtt';
import { mapActions } from 'vuex';
export default {  
  name: 'App',
  data() {
    return {
      all: [],
      errors: [],
        connection: {
          protocol: "ws",
          host: "159.89.103.242",          
          port: 9001,
          endpoint: "/mqtt",          
          clean: true,
          connectTimeout: 30 * 1000, // ms
          reconnectPeriod: 4000, // ms
          clientId: "emqx_vue_" + Math.random().toString(16).substring(2, 8),
        },
        subscription: {
          topic: "ping/+",
          qos: 0,
        },
        client: {
          connected: false,
        },
        subscribeSuccess: false,
        connecting: false,
        retryTimes: 0,
        sm_coeff: [{"sm-0001":120},{"sm-0002":320},{"sm-0003":400},{"sm-0004":200},{"sm-0006":200},{"sm-0008":200},{"sm-0009":80},
                   {"sm-0010":60},{"sm-0011":60},{"sm-0015":60},{"sm-0016":250},{"sm-0017":200},{"sm-0018":400},{"sm-0019":500},{"sm-0020":500},{"sm-0025":200}],  
    }
  },
  components: {
    
  },
  created (){
    this.createAllDevs()
    this.createConnection()
  },
  

  mounted(){
           
  },
  methods:{
    ...mapActions(['allDevsCreation']),

    parseMalformedPayload(raw) {
    const match = raw.match(/"payload"\s*:\s*{(.*)}/);
    if (!match) {
      console.error("Invalid payload format");
      return null;
    }

    const parts = match[1].split(',');
    const payloadObj = {};

    parts.forEach((item, index) => {
      if (item.includes(':')) {
        const [key, value] = item.split(':');
        payloadObj[key.trim()] = parseFloat(value.trim());
      } else if (index === 0) {
        payloadObj['timestamp'] = parseInt(item.trim());
      }
    });

    return { payload: payloadObj };
  },
    
    createAllDevs() {
        let deviceIds = []
        // Generate device IDs upfront with the correct format
        // let deviceIds = Array.from({ length: 31 }, (_, i) =>
        //     `sm-${(i + 1).toString().padStart(4, '0')}`
        // );
        const sikoDevsIds = ['sm-46', 'sm-47']

        deviceIds = deviceIds.concat(sikoDevsIds);
        // const additional_devices = ['sm-81', 'sm-82','sm-83','sm-84','sm-85', 'sm-96', 'sm-97', 'sm-94', 'sm-95', 'sm-91', 'sm-92', 'sm-93']
        // deviceIds.push(...additional_devices)
        // Map device IDs to device objects, incorporating coords data
        this.all = deviceIds.map(id => {
            // Find coordinates for the current device, if available
            const coord = coords.find(coord => coord[id]);            
            const deviceType = ['sm-0001', 'sm-0016'].includes(id) ? 'Producer' : 'Consumer';
            
            return {
            id: id,
            online: 'offline', // Default state
            power: 'N/A',
            lat: coord ? coord[id].lat : undefined,
            long: coord ? coord[id].long : undefined,                  
            type: deviceType,
            customer:'',
            capacity: coord ? coord[id].capacity :undefined            
            };
           
        });        
        
        this.allDevsCreation(this.all);

    },
    doSubscribe() {
        const { topic, qos } = this.subscription;
        this.client.subscribe(topic, { qos: qos });
        // this.client.subscribe("siko/+", { qos: qos }); // second topic
    },
    createConnection() {
        try {
            
          this.connecting = true;
          const { protocol, host, port, endpoint, clientId, connectTimeout, reconnectPeriod } = this.connection;
          const connectUrl = `${protocol}://${host}:${port}${endpoint}`;
          this.client = new PahoMQTT.Client(connectUrl, clientId);

          // Set additional client options if needed
          this.client.connectTimeout = connectTimeout;
          this.client.reconnectPeriod = reconnectPeriod;

          // Set up event listeners
        
          this.client.onConnectionLost = this.onConnectionLost.bind(this); // Bind to the component's context
          this.client.onMessageArrived = this.onMessageArrived.bind(this); // Bind to the component's context


          // Connect to the MQTT broker
          this.client.connect({
            onSuccess: () => {
              this.connecting = false;
              console.log('Connected to MQTT broker');
              this.doSubscribe(); // Subscribe after successful connection
            },
            onFailure: (error) => {
              this.connecting = false;
              console.error('MQTT connection failed:', error);
            },
          });
        } catch (error) {
          this.connecting = false;
          console.error('mqtt.connect error', error);
        }
      },
      onConnectionLost(responseObject) {
        if (responseObject.errorCode !== 0) {
          console.error('MQTT Connection Lost:', responseObject.errorMessage);
          // Handle reconnection logic here if needed
        }
      },
      onMessageArrived(message) {        
        try {
          const topic = message.destinationName;
          const payload = message.payloadString;
          if (topic.startsWith('siko/')){
            const parsedPayload = this.parseMalformedPayload(payload);
            if (!parsedPayload) return;

            // Update all relevant devices in `this.all`
            Object.entries(parsedPayload.payload).forEach(([key, value]) => {
              const found = this.all.find(dev => dev.id === key);
              
              if (found) {
                found.power = value.toFixed(2);
                found.online = 'ready';
              }
            });
          }
          else if (topic.startsWith('ping/')){
          // Process the incoming message here
          const parsedPayload = JSON.parse(payload);
          let dev = topic.split("/")[1]
          let pow = parsedPayload.payload.power
          let devObj = {
            "dev":dev,
            "power":pow.toFixed(2),
            "ready":parsedPayload.payload.gridReady,
            "providing":parsedPayload.payload.providing                
          }
          let found = this.all.find(element => element.id === devObj.dev)
          if(found){              
            found.power = devObj.power
            found.providing = devObj.providing
            found.online = 'online'
            found.ready = devObj.ready
            found.customer = parsedPayload.payload.blynkName
            if (found.ready == 1)
            {
              if (found.providing == 0)
              {
              found.online = 'ready'
              }
              else if (found.providing == 1)
              {
                found.online = 'providing'
              }
            }
            else if (found.ready == 0)
            {
              found.online = 'not-ready'
            }
            else{
              found.online = 'offline'
            }          
            
          } 
        }         
          this.allDevsCreation(this.all);
        
        } catch (error) {
          console.error('Error processing MQTT message:', error);
        }
      },

    },

}
</script>

<style>

</style>
