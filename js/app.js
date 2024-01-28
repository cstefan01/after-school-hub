let app = new Vue({
  el: "#app",
  data: {
    site_name: "After School Hub",
    site: {
      search_engine: {
        placeholder: "Search for lessons",
        query: "",
      },
    },
    copyright: {
      year: 2023,
    },
    cart: {
      counter: 0,
      lessons: [],
    },
    lessons: {
      lessons: [],
      isOnFetchingError: false,
    },
    pages: {
      lessons_page: false,
      cart_page: false,
    },
    checkout: {
      fields: {
        first_name: "",
        last_name: "",
        email_address: "",
        phone: "",
      },
      sub_total: 0,
      tax: 0,
      discount: 0,
      total: 0,
      discount_code: "",
      confirmation_popup: false,
    },

    prompt: {
      message: "",
      show: false,
    },
    discounts: [],
    sortBy: "subject",
    sortOrder: "asc",

    endpoints: {
      host: "https://after-school-hub-env2.eba-iijwxnmm.eu-west-2.elasticbeanstalk.com",
      lessons: "/lessons",
      orders: "/orders",
      images: "/images"
    }
  },
  methods: {

    extractOrderIds(orders) {
      return orders.map(order => order._id);
    },

    updateLessonsSpaces() {
      const cart_lessons = this.extractOrderIds(this.cart.lessons);
      cart_lessons.forEach((lessonID) => {
        this.decrementLessonSpacesByID(lessonID);
      })
    },

    // ========================= Requests =========================
    async submitOrder() {
      const order = {
        created_at: new Date(),
        customer: {
          first_name: this.checkout.fields.first_name,
          last_name: this.checkout.fields.last_name,
          email_address: this.checkout.fields.email_address,
          phone: this.checkout.fields.phone
        },
        lessons: this.extractOrderIds(this.cart.lessons),
        sub_total: this.checkout.sub_total.toFixed(2),
        tax: this.checkout.tax.toFixed(2),
        discount: this.checkout.discount.toFixed(2),
        total: this.checkout.total.toFixed(2)
      };

      const header = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      };

      try {
        const endpoint = `${this.endpoints.host}${this.endpoints.orders}`;

        const response = await fetch(endpoint, header);

        if (!response.ok) {
          // Handle error if the response status is not OK (e.g., 4xx or 5xx)
          throw new Error(`Failed to submit order: ${response.statusText}`);
        }

        const response_json = await response.json();

        const response_status = response_json.status;

        if (response_status === 201) {
          this.showConfirmationPopUp();
        }

      } catch (error) {
        console.error('Error submitting order:', error.message);
      }
    },
    async getLessons() {
      try {
        const endpoint = `${this.endpoints.host}${this.endpoints.lessons}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const lesson = await response.json();

        return lesson;

      } catch (error) {
        console.error('There was a problem in fetching lesson spaces:', error);
        throw error;
      }
    },
    async getLessonByID(lessonId) {
      const endpoint = `${this.endpoints.host}${this.endpoints.lessons}/${lessonId}`;

      try {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to get lesson by ID: ${response.statusText}`);
        }

        const lesson = await response.json();
        console.log('Lesson retrieved successfully:', lesson);
        return lesson;
      } catch (error) {
        console.error('Error getting lesson by ID:', error.message);
        throw error; // Rethrow the error if needed
      }
    },

    async decrementLessonSpacesByID(lessonId) {
      const endpoint = `${this.endpoints.host}${this.endpoints.lessons}/${lessonId}`;

      try {
        // Fetch the current lesson based on its ID
        const lesson = await this.getLessonByID(lessonId);

        // Calculate the new spaces value by decrementing 1
        const newSpaces = lesson.spaces - 1;

        // Update the lesson spaces with a PUT request
        const response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ spaces: newSpaces }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update lesson spaces: ${response.statusText}`);
        }

        const updatedLesson = await response.json();
        console.log('Lesson spaces updated successfully:', updatedLesson);
        return updatedLesson;
      } catch (error) {
        console.error('Error updating lesson spaces by ID:', error.message);
        throw error; // Rethrow the error if needed
      }
    },
    async searchLessons() {
      try {
        let endpoint = "";

        if (this.site.search_engine.query == "") {
          this.fetchLessons();
        } else {
          endpoint = `${this.endpoints.host}${this.endpoints.lessons}?search=${this.site.search_engine.query}`;

          const response = await fetch(endpoint);

          const lessons = await response.json();
          this.lessons.lessons = lessons;
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
      }
    },

    fetchLessons() {
      this.getLessons().then((lessons) => {
        this.lessons.lessons = lessons;
      })
    },
    // ========================= Requests =========================
    addToCart(lesson) {
      if (lesson.spaces != 0) {
        this.cart.lessons.push(lesson);
        this.cart.counter = this.cart.lessons.length;
        lesson.spaces -= 1;
      }
    },
    removeFromCart(lesson) {
      for (let l of this.cart.lessons) {
        if (JSON.stringify(l) === JSON.stringify(lesson)) {
          this.cart.lessons.pop(l);
          this.cart.counter = this.cart.lessons.length;
          l.spaces += 1;
          break;
        }
      }
    },
    /**
     * Toggle between the lessons page and the cart page.
     * Displays the cart page only if there are items in the cart.
    */
    toggleCart() {
      // Get the current length of items in the cart
      const cartLength = this.cart.lessons.length;

      // Check if there are items in the cart
      if (cartLength >= 1) {
        // Toggle the visibility of the cart and lessons pages
        this.pages.cart_page = !this.pages.cart_page;
        this.pages.lessons_page = !this.pages.lessons_page;
      }
    },

    /**
     * Navigate back to the lessons page from the cart page.
    */
    backToShopping() {
      // Hide the cart page and show the lessons page
      this.pages.cart_page = false;
      this.pages.lessons_page = true;
    },
    /**
     * Check if any of the provided form fields are empty.
     * @param {...string} values - The values of form fields to be checked.
     * @returns {boolean} - True if any of the form fields are empty, false otherwise.
     */
    isFormEmpty() {
      // Flag to track whether any form field is empty
      let isFormEmpty = false;

      // Iterate through the provided form field values
      Array.from(arguments).forEach(function (value) {
        // Check if the current form field value is empty
        if (value === "") {
          isFormEmpty = true;
        }
      });

      // Return the result indicating whether any form field is empty
      return isFormEmpty;
    },
    isCartEmpty(cartLength) {
      return cartLength == 0;
    },
    getCartSize() {
      return this.cart.lessons.length;
    },
    /**
     * Check if the provided email address is valid according to a basic email format regex.
     * @param {string} email - The email address to be validated.
     * @returns {boolean} - True if the email address is valid, false otherwise.
     */
    isEmailAddressValid(email) {
      // Regular expression for a basic email format validation
      const validEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      // Test the provided email against the regex
      return validEmail.test(email);
    },
    /**
     * Check if the provided phone number is valid according to a basic format regex.
     * @param {string} phone - The phone number to be validated.
     * @returns {boolean} - True if the phone number is valid, false otherwise.
    */
    isPhoneValid(phone) {
      // Regular expression for a basic phone number format validation
      const validPhone = /^07\d{9}$/;

      // Test the provided phone number against the regex
      return validPhone.test(phone);
    },
    /**
     * Check if the provided name is valid according to a basic format regex.
     * @param {string} name - The name to be validated.
     * @returns {boolean} - True if the name is valid, false otherwise.
     */
    isNameValid(name) {
      // Regular expression for a basic name format validation
      const validName = /^[A-Za-z\s\-']+$/;

      // Test the provided name against the regex
      return validName.test(name);
    },
    /**
     * Validate and process the submission of the checkout form.
     * Validates form fields, checks cart items, and shows appropriate prompts or confirmation.
     */
    submitCheckoutForm() {
      // Trim form field values for consistency
      const first_name = this.checkout.fields.first_name.trim();
      const last_name = this.checkout.fields.last_name.trim();
      const email_address = this.checkout.fields.email_address.trim();
      const phone = this.checkout.fields.phone.trim();
      const cart_length = this.cart.lessons.length;

      // Validate form field values and check cart items
      const isEmailAddressValid = this.isEmailAddressValid(email_address);
      const isPhoneValid = this.isPhoneValid(phone);
      const isCartEmpty = this.isCartEmpty(cart_length);
      const isFormEmpty = this.isFormEmpty(
        first_name,
        last_name,
        email_address,
        phone
      );
      const isFirstNameValid = this.isNameValid(first_name);
      const isLastNameValid = this.isNameValid(last_name);

      if (
        !isFormEmpty &&
        !isCartEmpty &&
        isPhoneValid &&
        isEmailAddressValid &&
        isFirstNameValid &&
        isLastNameValid
      ) {

        this.submitOrder();
        this.updateLessonsSpaces();

      } else if (isFormEmpty) {
        this.setPrompt(
          "missing fields - please fill out the missing fields",
          true
        );
      } else if (isCartEmpty) {
        this.setPrompt("no cart items - cart is empty", true);
      } else if (!isPhoneValid) {
        this.setPrompt("invalid phone number - enter correct number", true);
      } else if (!isEmailAddressValid) {
        this.setPrompt(
          "invalid email address - enter correct email address",
          true
        );
      } else if (!isFirstNameValid) {
        this.setPrompt("invalid first name - enter a valid name", true);
      } else if (!isLastNameValid) {
        this.setPrompt("invalid last name - enter a valid name", true);
      }
    },
    /**
     * Set the prompt message and control its visibility.
     * @param {string} message - The message to be displayed in the prompt.
     * @param {boolean} show - A flag indicating whether to show or hide the prompt.
     */
    setPrompt(message, show) {
      // Set the message in the prompt
      this.prompt.message = message;
      // Control the visibility of the prompt
      this.prompt.show = show;
    },
    /**
     * Reset the cart by clearing lessons and resetting the counter.
     */
    resetCart() {
      // Clear the lessons array in the cart
      this.cart.lessons = [];
      // Reset the counter in the cart
      this.cart.counter = 0;
    },
    /**
     * Apply a discount to the checkout based on a provided discount code.
     * If the discount code is found in the available discounts, update the checkout's discount rate.
     * If the discount code is not valid, set a prompt message indicating the issue.
     */
    applyDiscount() {
      // Flag to track whether the discount code was found
      let isDiscountFound = false;

      // Iterate through available discounts to find a matching code
      for (let discount of this.discounts.discounts) {
        if (
          discount.code.toLowerCase() ===
          this.checkout.discount_code.toLowerCase()
        ) {
          // Update the checkout's discount rate
          this.checkout.discount = discount.rate;
          isDiscountFound = true;
          // Exit the loop once a matching discount code is found
          break;
        }
      }

      // Check if a valid discount code was not found
      if (!isDiscountFound) {
        // Set a prompt message indicating the invalid promo discount code
        this.setPrompt("promo discount code is not valid", true);
      } else {
        // Clear the prompt message if a valid discount code is applied
        this.setPrompt("", false);
      }
    },
    showConfirmationPopUp() {
      this.checkout.confirmation_popup = true;
    },
    /**
     * Hide the confirmation pop-up and perform additional cleanup actions.
     * - Hide the confirmation pop-up.
     * - Reset the cart.
     * - Clear any existing prompts.
     */
    hideConfirmationPopUp() {
      // Hide the confirmation pop-up
      this.checkout.confirmation_popup = false;
      // Reset the cart
      this.resetCart();
      // Clear any existing prompts
      this.setPrompt("", false);
    },

    parseImageUrl(image_file_name) {
      return `${this.endpoints.host}${this.endpoints.images}/${image_file_name}`;

    }
  },
  beforeMount() {
    this.pages.lessons_page = true;
    this.fetchLessons();
  },
  computed: {
    computedCart_SubTotal() {
      let cartSubTotal = 0;
      for (let lesson of this.cart.lessons) {
        cartSubTotal += lesson.price;
      }
      this.checkout.sub_total = cartSubTotal;
      return cartSubTotal;
    },
    computedCart_Tax() {
      let tax = this.computedCart_SubTotal * (this.checkout.tax / 100);
      this.checkout.tax = tax;
      return tax;
    },
    computedCart_Discount() {
      let discount = this.computedCart_SubTotal * (this.checkout.discount / 100);
      this.checkout.discount = discount;
      return discount;
    },
    computedCart_Total() {
      const cart_total = this.computedCart_SubTotal + this.computedCart_Tax - this.computedCart_Discount;
      this.checkout.total = cart_total;
      return cart_total;
    },
    computedCartSize() {
      return this.cart.lessons.length;
    },
    filteredLessons() {
      const queryWords = this.site.search_engine.query.toLowerCase().split(" ");

      return this.lessons.lessons;
    },
  },
});
