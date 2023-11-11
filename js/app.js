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
      tax: 0,
      discount: 0,
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
  },
  methods: {
    /**
     * Fetch and set lessons data from a JSON file.
     * The JSON file should be located at "./data/lessons.json".
     * Sets an error flag if the fetch operation fails.
     */
    fetchLessons() {
      // Perform a fetch operation to get lessons data from the specified JSON file
      fetch("./data/lessons.json")
        .then((response) => {
          // Check if the fetch operation is successful
          if (!response.ok) {
            // Set an error flag if the fetch operation fails
            this.lessons.isOnFetchingError = true;
          }
           // Parse the response as JSON and return it
          return response.json();
        })
        .then((data) => {
            // Set the fetched lessons data to the component's 'lessons' property
          this.lessons = data;
        });
    },
    /**
     * Fetch and set discounts data from a JSON file.
     * The JSON file should be located at "./data/discounts.json".
     * Logs a message if the fetch operation fails.
     */
    fetchDiscounts() {
      // Perform a fetch operation to get discounts data from the specified JSON file
      fetch("./data/discounts.json")
        .then((response) => {
          // Check if the fetch operation is successful
          if (!response.ok) {
            console.log("faild to fetch");
          }
          // Parse the response as JSON and return it
          return response.json();
        })
        .then((data) => {
          // Set the fetched discounts data to the component's 'discounts' property
          this.discounts = data;
        });
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
        this.showConfirmationPopUp();
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

    /**
     * Sort lessons based on a specified attribute and order.
     * @returns {Array} - The sorted array of lessons.
    */
    sortLessons() {
      // Extract the sorting attribute and order from component properties
      const attribute = this.sortBy;
      const order = this.sortOrder === "asc" ? 1 : -1;

      // Create a copy of the lessons array and sort it
      return this.lessons.lessons.slice().sort((a, b) => {
        // Compare the specified attribute of each lesson
        if (a[attribute] < b[attribute]) {
          return -1 * order;
        }
        if (a[attribute] > b[attribute]) {
          return 1 * order;
        }
        // If values are equal, maintain the current order
        return 0;
      });
    },

    /**
     * Filter lessons based on search query words.
     * Uses subject and location properties of lessons for filtering.
     * @param {Array} lessons - The array of lessons to be filtered.
     * @returns {Array} - The filtered array of lessons.
     */
    filterLessons(lessons) {
      // Retrieve query words from the search engine's query
      const queryWords = this.site.search_engine.query.toLowerCase().split(" ");

      // Filter lessons based on the search query words
      return lessons.filter((lesson) => {
         // Check if every query word is present in either subject or location of the lesson
        return queryWords.every((word) => {
          return (
            lesson.subject.toLowerCase().includes(word) ||
            lesson.location.toLowerCase().includes(word)
          );
        });
      });
    }
  },
  mounted() {
    this.pages.lessons_page = true;
    this.fetchLessons();
    this.fetchDiscounts();
  },
  computed: {
    computedCart_SubTotal() {
      let cartSubTotal = 0;
      for (let lesson of this.cart.lessons) {
        cartSubTotal += lesson.price;
      }
      return cartSubTotal;
    },
    computedCart_Tax() {
      let tax = this.computedCart_SubTotal * (this.checkout.tax / 100);
      return tax;
    },
    computedCart_Discount() {
      let discount =
        this.computedCart_SubTotal * (this.checkout.discount / 100);
      return discount;
    },
    computedCart_Total() {
      return (
        this.computedCart_SubTotal +
        this.computedCart_Tax -
        this.computedCart_Discount
      );
    },
    computedCartSize() {
      return this.cart.lessons.length;
    },
    filteredAndSortedLessons() {
      const sorted = this.sortLessons();
      return this.filterLessons(sorted);
    },
  },
});
