import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'


createApp({
    data(){
        return{
           site:{
            name: "After School Hub",
            isFetchingError: false,
           },
           cart:{
            counter: 0,
            lessons: []
           },
           copyright:{
            year: 2023
           },
           lessons: {
            lessons: []
          },
        }
    },
    methods:{
        fetchLessons(){
            fetch('/data/lessons.json')
                .then(response => {
                    if(!response.ok){
                        this.site.isFetchingError = true
                    }
                    return response.json()
                })
                .then(data =>{
                    this.lessons = data 
                })
        },
        addToCart(lesson){
            this.cart.lessons.push(lesson)
            this.cart.counter = this.cart.lessons.length
        }
    },
    mounted(){
        this.fetchLessons();
    }
  }).mount('#app')