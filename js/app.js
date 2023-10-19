import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

createApp({
    data(){
        return{
           site:{
            name: "After School Hub",
            copyright:{
                year: 2023
            }
           },
           cart:{
            counter: 0,
            lessons: [],
            show: false
           },
           lessons: {
            lessons: [],
            isOnFetchingError: false,
          }
        }
    },
    methods:{
        fetchLessons(){
            fetch('/data/lessons.json')
                .then(response => {
                    if(!response.ok){
                        this.lessons.isOnFetchingError = true
                    }
                    return response.json()
                })
                .then(data =>{
                    this.lessons = data 
                })
        },
        addToCart(lesson){
            if(lesson.spaces != 0){
                this.$refs.btnAddToCart.disabled = false;

                lesson.spaces -= 1
                this.cart.lessons.push(lesson)
                this.cart.counter = this.cart.lessons.length
            }
           
        },
        removeFromCart(lesson){
            for(let l of this.cart.lessons){
                if (JSON.stringify(l) === JSON.stringify(lesson)){
                    this.cart.lessons.pop(l)
                    this.cart.counter = this.cart.lessons.length
                    l.spaces += 1;
                    break  
                }
            }

        },
        toggleCart(){
            const cartLength = this.cart.lessons.length
            if(cartLength >= 1){
                this.cart.show = !this.cart.show
            }else{
                this.cart.show = false
            }
        }
    },
    mounted(){
        this.fetchLessons();
    }
  }).mount('#app')