
const userDashboard={
        template:`

        
        <div  style="text-align: center ;margin-top:20px;">
        <h1>Welcome to Grocery Store, {{ username }}</h1>
        
        <div >
          <div class=" d-flex justify-content-center">
            <button type="button" class="btn btn-warning" @click="fetchCategories" style="margin: 20px; padding: 10px;">View Categories</button>
            <button type="button" class="btn btn-warning" @click="viewCart" style="margin: 20px; padding: 10px;">View Cart</button>
            <button type="button" class="btn btn-warning" @click="viewOrders" style="margin: 20px; padding: 10px;">View Orders</button>
            <div class="input-group" style="width: 300px;margin: 20px;margin-top:20px;margin-bottom:20px;">
              <input type="search" class="form-control rounded" placeholder="Search" aria-label="Search" aria-describedby="search-addon" v-model="searchQuery" />
              <button type="button" class="btn btn-outline-secondary" @click="search"  data-mdb-ripple-init>Search</button>
            </div>
          </div>
        </div>
        
        <div v-if="showCategories" class="d-flex justify-content-center">
        <div v-if="categories && categories.length > 0">
          <h2>Categories:</h2>
          <div class="row">
            <div v-for="category in categories" :key="category.C_ID" class="col-md-4 mb-4">
              <div class="card" style="width: 18rem; margin-bottom: 20px;background-color: rgba(255, 255, 255, 0.8);">
                <div class="card-body">
                  <h5 class="card-title">{{ category.C_name }}</h5>
                  <div>
                    <button type="button" class="btn btn-outline-primary" @click="viewProductsInCategory(category.C_ID, category.C_name)">View Products</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          No categories to display
        </div>
        </div>
    
        <div v-if="showProducts" class="d-flex justify-content-center">
        <div v-if="products && products.products && products.products.length > 0">
          <h2>Products in {{ selectedCategoryName }}:</h2>
          <div class="row">
            <div v-for="product in products.products" :key="product.P_ID" class="col">
              <div class="card" style="width: 18rem; margin-bottom: 20px;background-color: rgba(255, 255, 255, 0.8);">
                <div class="card-body">
                  <h5 class="card-title">{{ product.P_name }}</h5>
                  <p>Price per Unit: {{ product.price_per_unit }}/{{ product.unit }}</p>
                  <p>Manuf/Exp Date: {{ product.manf_exp_Date || 'N/A' }}</p>
                  <label for="quantity">Quantity:</label>
                  <input type="number" id="quantity" v-model="product.quantity" min="1" max="99">
                  <button type="button" class="btn btn-outline-success" @click="addToCart(product.P_ID)">Add to Cart</button>
                  <!-- Add other details about the product as needed -->
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No products to display</p>
        </div>
        </div>

        <div v-if="showCart" class="cart-container">
        <h2 class="cart-heading" style ="font-size: 1.5em; margin-bottom: 10px;">Your Shopping Cart</h2>
        <div v-if="cart.length > 0" class="cart-items-container" style="margin-top: 20px;margin-top: 20px;border: 1px solid #ccc;border-radius: 5px;background-color: #f9f9f9;">
            <ul class="cart-items-list" style="list-style-type: none;padding: 0;">
                <li v-for="item in cart" :key="item.product.P_ID" class="cart-item" style="margin-bottom: 10px;padding: 10px;border: 1px solid #ddd;border-radius: 5px;background-color: #fff;">
                     <span class="item-name">{{ item.product.P_name }}</span> - Quantity: <span class="item-quantity">{{ parseInt(item.quantity) || 1 }}</span> - Price: <span class="item-price">{{ item.product.price_per_unit }}/{{ item.product.unit }}</span>
                </li>
            </ul>
            <p class="cart-total" style="font-weight: bold;margin-top: 10px;">Total: {{ cartTotal }}</p>
            <button @click="clearCart" class="clear-cart-button" style="margin-top: 10px;padding: 10px;background-color: #e74c3c;color: #fff;border: none;border-radius: 5px;cursor: pointer;">Clear Cart</button>
            <button @click="checkout" class="checkout-button" style="margin-top: 10px;margin-bottom: 10px;padding: 10px;background-color: #4caf50;color: #fff;border: none;border-radius: 5px;cursor: pointer;">Checkout</button>
        </div>
        <div v-else>
            <p class="empty-cart-message" style="font-style: italic;">Your cart is empty</p>
        </div>
        </div>


        <!-- Display search results -->
        <div v-if="showsearchResults" class="d-flex justify-content-center">
          <div v-if="searchResults.categories.length > 0">
            <div v-for="category in searchResults.categories" :key="category.C_ID">
              <h2>Search results Products in {{ category.C_name }}:</h2>
              <!-- Display products under this category -->
              <div v-if="category.products.length > 0">
                <div class="row">
                  <div v-for="product in category.products" :key="product.P_ID" class="col">
                    <div class="card" style="width: 18rem; margin-bottom: 20px;">
                      <div class="card-body">
                        <h5 class="card-title">{{ product.P_name }}</h5>
                        <p>Price per Unit: {{ product.price_per_unit }}/{{ product.unit }}</p>
                        <p>Manuf/Exp Date: {{ product.manf_exp_Date || 'N/A' }}</p>
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" v-model="product.quantity" min="1" max="99">
                        <button type="button" class="btn btn-outline-success" @click="addToCartFromSearch(product.P_ID, product.quantity)">Add to Cart</button>
                        <!-- Add other details about the product as needed -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <p>No products found in this category.</p>
              </div>
            </div>
          </div>
          <div v-else-if="searchResults.products.length > 0">
            <h2>Search Results:</h2>
            <h3>Products:</h3>
            <div class="row">
              <div v-for="product in searchResults.products" :key="product.P_ID" class="col-md-4 mb-4">
                <div class="card" style="width: 18rem; margin-bottom: 20px;">
                  <div class="card-body">
                    <h5 class="card-title">{{ product.P_name }}</h5>
                    <p>Price per Unit: {{ product.price_per_unit }}/{{ product.unit }}</p>
                    <p>Manuf/Exp Date: {{ product.manf_exp_Date || 'N/A' }}</p>
                    <label for="quantity">Quantity:</label>
                    <input type="number" id="quantity" v-model="product.quantity" min="1" max="99">
                    <button type="button" class="btn btn-outline-success" @click="addToCartFromSearch(product.P_ID, product.quantity)">Add to Cart</button>
                    <!-- Add other details about the product as needed -->
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No categories or products found.</p>
          </div>
        </div>


        <div v-if="showOrders" id="order-container" style="margin: 20px;padding: 10px;">
            <h2 style="font-size: 26px;color: #333;">Your Orders</h2>
            <div v-if="orders.length > 0" style="margin-top: 10px;">
                <div v-for="order in orders" :key="order.orderID" class="order-info" style="margin-bottom: 10px;padding: 10px;;border: 1px solid #ccc; background-color: #f9f9f9;">
                    <p class="order-id" style=" font-weight: bold;font-size: 18px;">Order ID: {{ order.orderID }}</p>
                    <p class="order-date">Order Date: {{ order.order_date }}</p>
                    <ul class="product-list" style="list-style-type: none;padding: 0;">
                        <li v-for="detail in order.order_details" :key="detail.productID" class="product-item" style="margin-bottom: 5px;padding: 5px;background-color: #fff;">
                            {{ detail.quantity }} x {{ detail.product_name }} - Price: {{ detail.price_per_unit }} - Total Price: {{ detail.total_price }}
                        </li>
                    </ul>
                    <p class="grand-total" style=" font-weight: bold;font-size: 18px;color: #e44d26; ">Grand Total: {{ order.grand_total }}</p>
                </div>
            </div>
            <div v-else>
                <p>No orders to display</p>
            </div>
        </div>
    
    
  
    

      </div>
        
        `,
        data(){
            return {
                username:'',
                categories: [],
                showCategories:false,
                selectedCategoryName: '',
                showProducts: false,
                products: [],
                selectedProduct:'',
                showCart:false,
                product: {
                  quantity: 1, // Set the default quantity to 1
                },
                searchQuery: '',
                searchResults: [],
                showsearchResults:false,
                showOrders:false,
                order:[],
            };
        },

        mounted(){
            this.fetchUsername();
            
        },
        computed: { 
            cart() {
              return this.$store.state.cart;
            },
            cartTotal() {
              // Assuming each product has a 'price' property
              return this.$store.getters.cartTotal;
            },
        },


        methods:{
            fetchUsername() {
                const authToken = localStorage.getItem('Auth-token');
                if (authToken) {
                fetch('/api/get_user_name', {
                    method: 'GET',
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                    },
                })
                    .then(response => response.json())
                    .then(data => {
                    this.username = data.username;
                    this.id = data.user_id;
                    })
                    .catch(error => {
                    console.error('Error:', error);
                    });
                }
            },
            fetchCategories() {
                // Fetch categories from your API
                fetch('/api/get_categories', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error('Network response was not ok');
                    }
                    return response.json();
                  })
                  .then(data => {
                    // Update the categories data property
                    this.categories = data.categories;
                    this.showCategories = true;
                    this.showProducts = false;
                    this.showCart= false;
                    this.showOrders = false;
                  })
                  .catch(error => {
                    console.error('Error fetching categories:', error.message);
                    // Handle the error, e.g., show an error message
                  });
            },
            viewProductsInCategory(categoryId, categoryName) {
                // Fetch products for the selected category and update the view
                // You need to implement the logic for fetching products from your API
                // Replace the following with your actual API endpoint
                fetch(`/api/categories/${categoryId}/products`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                })
                  .then(response => {
                    if (response.status === 404) {
                      // Handle the case where no products are found (404 error)
                      console.log(`No products found for category ${categoryId}`);
                      // Display a message to the user
                      this.noProductsMessage = `No products found for category ${categoryId}`;
                      // You may want to handle this case differently, e.g., display a message in the UI
                      return Promise.reject(new Error('No products found for the category'));
                    } else {
                      return response.json();
                    }
                  })
                  .then(data => {
                    // Products found for the category
                    console.log('Products for category:', data);
                    this.selectedCategoryId = categoryId;
                    this.selectedCategoryName = categoryName;
                    this.products = data;
                    this.showProducts = true;
                    this.showCategories = false;
                    this.showOrders = false;
                    console.log('Products array:', this.products);
                  })
                  .catch(error => {
                    // Handle other errors
                    console.error('Error:', error.message);
                  });
            },
            addToCart(productId) {
              // Check if this.products is defined and has a 'products' property
              if (this.products && this.products.products && Array.isArray(this.products.products)) {
                  // Find the selected product in the products array
                  const selectedProduct = this.products.products.find(product => product.P_ID === productId);
          
                  // Check if a product is found
                  if (selectedProduct) {
                      // Get the user-inputted quantity from the product object
                      const quantity = selectedProduct.quantity || 1;
          
                      // Dispatch the addToCart mutation with the selected product and quantity
                      this.$store.commit('addToCart', { product: selectedProduct, quantity });
          
                      // Optionally, you can show a notification or perform other actions
                      alert('Product added to cart!');
                  } else {
                      console.error('Product not found.'); // Log an error or handle it appropriately
                  }
              } else {
                  console.error('Invalid products data structure.'); // Log an error or handle it appropriately
              }
            },
            viewCart() {
                this.showCart = true;
                this.showProducts = false;
                this.showCategories = false;
                this.showsearchResults= false;
                this.showOrders = false;
                
            },
            search() {
              // Make an API call to search for categories and products
              // Update this logic based on your backend API structure
            
              // Example API call using fetch
              fetch(`/api/search?q=${this.searchQuery}`)
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  return response.json();
                })
                .then(data => {
                  console.log('Search Results:', data);
                  if (data.products.length > 0) {
                    console.log('First Product:', data.products[0]);
                  }
                  // Update the searchResults with the response from the server
                  this.searchResults = data;
                  this.showsearchResults= true;
                  this.showCategories = false;
                  this.showProducts = false;
                  this.showCart = false;
                  this.showOrders = false;
                })
                .catch(error => {
                  console.error('Error fetching search results:', error);
                });
            },
            addToCartFromSearch(productId, quantity) {
              // Check if the selected product is from categories
              const selectedCategory = this.searchResults.categories.find(category => {
                const foundProduct = category.products.find(product => product.P_ID === productId);
                if (foundProduct) {
                  this.$store.commit('addToCart', { product: foundProduct, quantity });
                  alert('Product added to cart!');
                  return true; // Exit the loop if the product is found in a category
                  
                }
              });
          
              // If the product is not found in categories, check regular search results
              if (!selectedCategory) {
                const selectedProduct = this.searchResults.products.find(product => product.P_ID === productId);
          
                // Check if a product is found
                if (selectedProduct) {
                  // Dispatch the addToCart mutation with the selected product and quantity
                  this.$store.commit('addToCart', { product: selectedProduct, quantity });
                  // Optionally, you can show a notification or perform other actions
                  alert('Product added to cart!');
                } else {
                  console.error('Product not found.'); // Log an error or handle it appropriately
                }
              }
            },
            checkout() {

              const grandTotal = this.$store.getters.cartTotal;

              // Prepare data for the API request
              const checkoutData = {
                items: this.cart.map(item => ({
                    product_id: item.product.P_ID,
                    product_name: item.product.P_name,
                    price_per_unit: item.product.price_per_unit,
                    quantity: item.quantity,
                    total: item.product.price_per_unit * item.quantity,
                })),
                grand_total: grandTotal,
              };
          
              // Make an API call to save the details to the database
              fetch('/api/checkout', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(checkoutData),
              })
              .then(response => {
                  if (!response.ok) {
                      throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  // Clear the cart on successful checkout
                  this.$store.commit('clearCart');
                  alert('Checkout successful!');
              })
              .catch(error => {
                  console.error('Error during checkout:', error);
                  alert('Error during checkout. Please try again.');
              });
            },
            clearCart() {
              this.$store.commit('clearCart'); // Assuming you have a mutation named 'clearCart' in your Vuex store
            },
            viewOrders() {
              // Make an API call to fetch user orders
              fetch('/api/orders', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              })
                .then(response => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  return response.json();
                })
                .then(data => {
                  // Update the component state with the fetched orders
                  this.orders = data.orders;
                  // Show the orders in the UI or perform other actions
                  this.showOrders = true;
                  this.showsearchResults= false;
                  this.showCategories = false;
                  this.showProducts = false;
                  this.showCart = false;
                })
                .catch(error => {
                  console.error('Error fetching orders:', error);
                });
            },

          
        },    

};
export default userDashboard;



