let app = new Vue({
    el: "#app",
    data: {
        site_name: "After School Hub",
        site: {
            search_engine: {
                placeholder: "Search for lessons",
                query: ""
            }
        },
        copyright: {
            year: 2023
        },
        cart: {
            counter: 0,
            lessons: [],
        },
        lessons: {
            lessons: [],
            isOnFetchingError: false,
        },
        pages:{
            lessons_page: false,
            cart_page: false
        },
        checkout:{
            fields:{
                first_name: "",
                last_name: "",
                email_address: "",
                phone: ""
            },
            tax: 0
        },
        prompt:{
            message: "",
            show: false
        }
    },
    methods: {
        fetchLessons() {
            fetch('./data/lessons.json')
                .then(response => {
                    if (!response.ok) {
                        this.lessons.isOnFetchingError = true
                    }
                    return response.json()
                })
                .then(data => {
                    this.lessons = data
                })
        },
        addToCart(lesson) {
            if (lesson.spaces != 0) {
                this.cart.lessons.push(lesson);
                this.cart.counter = this.cart.lessons.length;
                lesson.spaces -= 1;

                if (lesson.spaces == 0) {
                    lesson.button_text = "Out of Spaces";
                } else {
                    lesson.button_text = "Add to Cart";
                }
            }

        },
        removeFromCart(lesson) {
            for (let l of this.cart.lessons) {
                if (JSON.stringify(l) === JSON.stringify(lesson)) {
                    this.cart.lessons.pop(l);
                    this.cart.counter = this.cart.lessons.length;
                    l.spaces += 1;
                    break
                }
            }
        },
        toggleCart() {
            const cartLength = this.cart.lessons.length;
            if (cartLength >= 1) {
                this.pages.cart_page = !this.pages.cart_page;
                this.pages.lessons_page = !this.pages.lessons_page;
            }
        },
        backToShopping(){
            this.pages.cart_page = false;
            this.pages.lessons_page = true;
        },
        isFormEmpty(){
            let isFormEmpty = false;
            Array.from(arguments).forEach(function (value) {
                if (value === '') {
                    isFormEmpty = true; 
                }
            });

            return isFormEmpty;
        },
        isCartEmpty(cartLength) {
            return cartLength == 0;
        },
        getCartSize(){
            return this.cart.lessons.length;
        },
        isEmailAddressValid(email){
            const validEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return validEmail.test(email);
        },
        isPhoneValid(phone){
            const validPhone = /^07\d{9}$/ ;
            return validPhone.test(phone);
        },
        submitCheckoutForm(){
            const first_name = this.checkout.fields.first_name;
            const last_name = this.checkout.fields.last_name;
            const email_address = this.checkout.fields.email_address;
            const phone = this.checkout.fields.phone;
            const cart_length = this.cart.lessons.length;

            const isEmailAddressValid = this.isEmailAddressValid(email_address);
            const isPhoneValid = this.isPhoneValid(phone);
            const isCartEmpty = this.isCartEmpty(cart_length);
            const isFormEmpty = this.isFormEmpty(first_name,last_name,email_address,phone);

            if(!isFormEmpty && !isCartEmpty && isPhoneValid && isEmailAddressValid){
                alert("submitted");
                this.resetCart();
                this.setPrompt("", false);
            }else if(isFormEmpty){
                this.setPrompt("missing fields - please fill out the missing fields",true);
            }else if(isCartEmpty){
                this.setPrompt("no cart items - cart is empty",true);
            }else if(!isPhoneValid){
                this.setPrompt("invalid phone number - enter correct number",true);
            }else if(!isEmailAddressValid){
                this.setPrompt("invalid email address - enter correct email address",true);
            }
        },
        setPrompt(message,show){
            this.prompt.message = message;
            this.prompt.show = show;
        },
        resetCart(){
            this.cart.lessons = [];
            this.cart.counter = 0;
        }
    },
    mounted() {
        this.pages.lessons_page = true;
        this.fetchLessons();
    },
    computed: {
        filteredLessons() {
            const queryWords = this.site.search_engine.query.toLowerCase().split(' ');

            return this.lessons.lessons.filter(lesson => {
                return queryWords.every(word => {
                    return lesson.subject.toLowerCase().includes(word) || lesson.location.toLowerCase().includes(word);
                });
            });
        },
        computedCart_SubTotal(){
            let cartSubTotal = 0;
            for(let lesson of this.cart.lessons){
                cartSubTotal += lesson.price;
            }
            return cartSubTotal;
        },
        computedCart_Total(){
            let tax_added = this.computedCart_SubTotal * (this.checkout.tax / 100);
            return (this.computedCart_SubTotal + tax_added); 
        }
    }
});