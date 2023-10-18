import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'


createApp({
    data(){
        return{
           site:{
            name: "After School Hub"
           },
           cart:{
            counter: 0
           },
           copyright:{
            year: 2023
           },
        }
    }
  }).mount('#app')