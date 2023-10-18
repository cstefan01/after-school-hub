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
           lessons: {},

        
        }
    },
    methods:{
        fetchLessons(){
            fetch('/data/lessons.json')
                .then(response => {
                    if(!response.ok){
                        throw new Error('Network response was not ok')
                    }
                    return response.json()
                })
                .then(data =>{
                    this.lessons = data
                    
                })

        }
    },
    mounted(){
        this.fetchLessons();
    }
  }).mount('#app')