const storemanagerDashboard={
    template:`


        <div  style="text-align: center ;margin-top:20px;">

            <h1 style="text-align:center">Welcome to Grocery Store, {{ username }}</h1>
            <button  type="button" class="btn btn-outline-secondary" @click="triggerceleryjob" style="margin: 20px; padding: 10px;">Download Product data</button>

            <div v-if="!showProducts" class="d-flex justify-content-center">
            <div v-if="categories && categories.length > 0" >
                <h2>Categories:</h2>
                <div class="row">
                <div v-for="category in categories" :key="category.C_ID" class="col-md-4 mb-4">
                    <div class="card"  style="width: 18rem; margin-bottom: 20px;background-color: rgba(255, 255, 255, 0.8);">
                    <div class="card-body">
                        <h5 class="card-title">
                        <a @click="viewProductsInCategory(category.C_ID, category.C_name)" style="cursor: pointer;">
                            {{ category.C_name }}
                        </a>
                        </h5>
                        <div>
                        <button type="button" class="btn btn-outline-success" data-bs-toggle="modal" data-bs-target="#editCategoryModal" @click="editCategoryapproval(category.C_ID)">Edit</button>
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
            <div v-if="products && products.products && products.products.length > 0" >
              <h2>Products in {{ selectedCategoryName }}:</h2>
              <div class="row">
                <div v-for="product in products.products" :key="product.P_ID" class="col">
                  <div class="card" style="width: 18rem; margin-bottom:10px;margin-left:0px;margin-right:0px;background-color: rgba(255, 255, 255, 0.8);">
                    <div class="card-body">
                      <h5 class="card-title">{{ product.P_name }}</h5>
                      <p>Unit: {{ product.unit }}</p>
                      <p>Price per Unit: {{ product.price_per_unit }}</p>
                      <p>Manufacturing/Expiration Date: {{ product.manf_exp_Date || 'N/A' }}</p>
                      <p>UOM ID: {{ product.umo_id }}</p>
                      <p>Available Quantity: {{ product.avable_qunty }}</p>
                      <p>Remaining Quantity: {{ product.remaining_quantity }}</p>
          
                      <!-- Edit button -->
                      <button type="button" class="btn btn-outline-success" data-bs-toggle="modal" data-bs-target="#editProductModal" @click="editProduct(product.P_ID)">Edit</button>
          
                      <!-- Delete button -->
                      <button type="button" class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal" @click="deleteProduct(product.P_ID)">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Add New Product button -->
              <div class="card" style="width: 18rem; margin-bottom: 20px;background-color: rgba(255, 255, 255, 0.8);">
                <div class="card-body">
                  <h5 class="card-title">Add New Product</h5>
                  <button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#addProductModal" @click="addProduct">Add Product</button>
                </div>
              </div>
            </div>
            <div v-else>
              <p v-if="products && products.message">{{ products.message }}</p>
              <p v-else>No products to display</p>
              <!-- Add New Product button -->
              <div class="card" style="width: 18rem; margin-bottom: 20px;background-color: rgba(255, 255, 255, 0.8);">
                <div class="card-body">
                  <h5 class="card-title">Add New Product</h5>
                  <button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#addProductModal" @click="addProduct">Add Product</button>
                </div>
              </div>
            </div>
            </div>
          


            <div v-if="addProducts">
            <div class="modal" id="addProductModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Product</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p style="font-weight: bold;">Adding a product to category: {{ selectedCategoryName }}</p>
                        <!-- Add form or input fields for entering product details here -->
                        <!-- For example, you can add an input for product name -->
                        <label for="productName" style="display: block; margin-bottom: 5px;">Product Name:</label>
                        <input type="text" id="productName" v-model="newProduct.P_name" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" />
                    
                        <label for="unit" style="display: block; margin-bottom: 5px;">Unit:</label>
                        <input type="text" id="unit" v-model="newProduct.unit" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" />
                    
                        <label for="pricePerUnit" style="display: block; margin-bottom: 5px;">Price Per Unit:</label>
                        <input type="number" id="pricePerUnit" v-model="newProduct.price_per_unit" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" />
                    
                        <label for="manfExpDate" style="display: block; margin-bottom: 5px;">Manufacturing/Expiration Date:</label>
                        <input type="text" id="manfExpDate" v-model="newProduct.manf_exp_Date" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" />
                    
                        <label for="umoId" style="display: block; margin-bottom: 5px;">UOM:</label>
                        <select id="umoId" v-model="newProduct.umo_id" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;">
                        <option v-for="uom in uomOptions" :key="uom.id" :value="uom.id">{{ uom.name }}</option>
                        </select>
                    
                        <label for="availableQty" style="display: block; margin-bottom: 5px;">Available Quantity:</label>
                        <input type="number" id="availableQty" v-model="newProduct.avable_qunty" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" />
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="saveProduct">Save Product</button>
                    </div>
                </div>
            </div>
            </div>
            </div>

            <!-- Edit Product Modal -->
            <div v-if="editModalVisible" class="modal" id="editProductModal" tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Product</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                        <!-- Add form or input fields for editing product details here -->
                        <label for="editProductName" style="display: block; margin-bottom: 5px;">Product Name:</label>
                        <input type="text" id="editProductName" v-model="selectedProduct.P_name" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" />
                    
                        <label for="editUnit" style="display: block; margin-bottom: 5px;">Unit:</label>
                        <input type="text" id="editUnit" v-model="selectedProduct.unit" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" />
                    
                        <label for="editPricePerUnit" style="display: block; margin-bottom: 5px;">Price Per Unit:</label>
                        <input type="number" id="editPricePerUnit" v-model="selectedProduct.price_per_unit" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" />
                    
                        <label for="editManfExpDate" style="display: block; margin-bottom: 5px;">Manufacturing/Expiration Date:</label>
                        <input type="text" id="editManfExpDate" v-model="selectedProduct.manf_exp_Date" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" />
                    
                        <label for="editUmoId" style="display: block; margin-bottom: 5px;">UOM ID:</label>
                        <input type="number" id="editUmoId" v-model="selectedProduct.umo_id" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" />
                    
                        <label for="editAvailableQty" style="display: block; margin-bottom: 5px;">Available Quantity:</label>
                        <input type="number" id="editAvailableQty" v-model="selectedProduct.avable_qunty" style="width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box;" />
                    
                        <!-- Add other input fields for editing other product details -->
                    
                    </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" @click="saveEditedProduct">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>



            <!-- Confirmation Modal -->
            <div v-if="Deletemodal" class="modal" id="confirmDeleteModal"" tabindex="-1" role="dialog">
            <div>
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Confirm Delete</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Are you sure you want to delete this product?</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" @click="confirmDelete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
            </div>

            <div v-if="editCategory" class="modal" id="editCategoryModal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Category Request</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Current Category Name: {{ existingCategoryName }}</p>
                        <!-- Add form or input fields for editing category details here -->
                        <label for="editCategoryName">Category Name:</label>
                        <input type="text" id="editCategoryName" v-model="editCategoryName" />
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="sendEditRequest">Send Request</button>
                    </div>
                </div>
            </div>
            </div>
            
        </div>
    `,
    data(){
        return {
            username:'',
            categories: [],
            selectedCategoryName: '',
            showProducts: false,
            products: [],
            newProduct: {
                P_name: '',
                unit: '',
                price_per_unit: '',
                manf_exp_Date: '',
                umo_id: null,
                avable_qunty: '',
            },
            uomOptions: [],
            addProducts : false,
            selectedCategoryId: null,
            selectedProduct: null,
            editModalVisible: false,
            selectedProductId: null,
            Deletemodal: false,
            editCategory:false,
            existingCategoryName:'',
            editCategoryName: '',
            categoryId: '',
            
        };
    },

    mounted(){
        this.fetchUsername();
        this.fetchCategories();
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
            fetch(`/api/categories/${categoryId}/products`)
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
                console.log('Products array:', this.products);
              })
              .catch(error => {
                // Handle other errors
                console.error('Error:', error.message);
              });
        },
        addProduct() {
            // This method is called when the "Add Product" button is clicked
            // You can perform any additional logic here before opening the modal, if needed
            // For example, you can reset the newProduct object or perform validation
    
            // Clear previous input values when opening the modal
            this.selectedCategoryId = this.selectedCategoryId || null; // or set it to a default value
            //this.showProducts = false; // Set to false to hide products (if needed)
            this.fetchUOMOptions();
            // Trigger the opening of the modal
            this.addProducts = true;
    
            // Use $nextTick to ensure that the DOM has been updated before opening the modal
            this.$nextTick(() => {
                // Trigger the modal to open after the DOM has been updated
                $('#addProductModal').modal('show');
            });
        },
        fetchUOMOptions() {
            // Make a fetch request to your server to get UOM options
            fetch('/api/uom') // Replace with the actual endpoint
                .then(response => response.json())
                .then(data => {
                    // Update the UOM options in your component's data
                    this.uomOptions = data.uomOptions; // Replace with the actual response structure
                })
                .catch(error => {
                    console.error('Error fetching UOM options:', error);
                });
        },
        
        saveProduct() {
            // Prepare the product data
            const productData = {
                C_ID: this.selectedCategoryId,
                P_name: this.newProduct.P_name,
                unit: this.newProduct.unit,
                price_per_unit: this.newProduct.price_per_unit,
                manf_exp_Date: this.newProduct.manf_exp_Date,
                umo_id: this.newProduct.umo_id,
                avable_qunty: this.newProduct.avable_qunty,
                remaining_quantity: this.newProduct.avable_qunty, // Set remaining_quantity to avable_qunty initially
                // Add other properties as needed
            };
        
            fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers if needed
                },
                body: JSON.stringify(productData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Handle the response data, update the UI, etc.
                // For example, you can display a success message, update product lists, etc.
                console.log('Product saved successfully:', data);
                
                // Optionally, close the modal after successfully saving the product
                this.addProducts = false;
                this.showProducts = true;
            })
            .catch(error => {
                // Handle errors, show error messages, etc.
                console.error('Error saving product:', error);
        
                // Optionally, display an error message or perform other error handling
                // For example, you can set an error message in your data and display it in the UI
                this.errorMessage = 'Error saving product. Please try again.';
            });
        },
        editProduct(productID) {
            // Find the selected product by its ID
            this.selectedProduct = this.products.products.find(product => product.P_ID === productID);

            // Show the edit modal
            this.editModalVisible = true;
        },
        saveEditedProduct() {
            // Prepare the edited product data
            const editedProductData = {
                P_ID: this.selectedProduct.P_ID, // Assuming P_ID is the product's unique identifier
                P_name: this.selectedProduct.P_name,
                unit: this.selectedProduct.unit,
                price_per_unit: this.selectedProduct.price_per_unit,
                manf_exp_Date: this.selectedProduct.manf_exp_Date,
                umo_id: this.selectedProduct.umo_id,
                avable_qunty: this.selectedProduct.avable_qunty,
                // Add other properties as needed
            };
    
            // Perform the update by sending a request to your API
            fetch('/api/update-product', {
                method: 'PUT', // Use the appropriate HTTP method for updates
                headers: {
                    'Content-Type': 'application/json',
                    // Add other headers if needed
                },
                body: JSON.stringify(editedProductData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Handle the response data, update the UI, etc.
                // Close the modal after successfully saving the edited product
                $('#editProductModal').modal('hide');
            })
            .catch(error => {
                // Handle errors, show error messages, etc.
                console.error('Error saving edited product:', error);
            });
        },
        deleteProduct(productId) {
            // Set the selectedProductId for the confirmation modal
            this.selectedProductId = productId;
            // Open the confirmation modal
            //$('#Deletemodal').modal('show');
            this.Deletemodal = true;
        },
        confirmDelete() {
            // Perform the delete operation using the selectedProductId
            // Send a request to your API to delete the product
            fetch(`/api/delete-product/${this.selectedProductId}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Handle the response data, update the UI, etc.
                // Close the confirmation modal after successfully deleting the product
                $('#confirmDeleteModal').modal('hide');
                this.showProducts= false;
            })
            .catch(error => {
                // Handle errors, show error messages, etc.
                console.error('Error deleting product:', error);
            });
        },
        editCategoryapproval(categoryId) {
            // Call the fetchCategoryDetails method to get category details
            this.fetchCategoryDetails(categoryId)
                .then(category => {
                    console.log('Category details:', category);
                    // Assuming your category object has a 'C_name' field
                    this.editCategoryName = category ? category.name : '';
                    this.existingCategoryName = category ? category.name : ''; // Update this line
                    this.categoryIdForUpdate = categoryId;
                    // Trigger the opening of the modal
                    this.editCategory = true;
                })
                .catch(error => {
                    console.error('Error fetching category details:', error);
                    // Handle errors, show error messages, etc.
                });
        },
        
        fetchCategoryDetails(categoryId) {
            // Make an API call to fetch category details based on categoryId
            // Replace this with your actual API endpoint and logic
            return fetch(`/api/categories/${categoryId}`)
                .then(response => response.json())
                .then(data => {
                    return data.category; // Assuming your API response has a 'category' field
                });
        },
        sendEditRequest() {
            // Assuming you have an API endpoint to handle edit requests
            const apiUrl = '/api/send-edit-request';
        
            // Data to be sent in the request
            const requestData = {
                categoryId: this.categoryIdForUpdate,
                newCategoryName: this.editCategoryName,
                currentCategoryName: this.existingCategoryName,
                // Include other relevant data
            };
        
            // Make a POST request to the server
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include other headers if needed
                },
                body: JSON.stringify(requestData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Handle the response data, e.g., show a success message
                console.log('Edit request sent successfully:', data.message);
        
                // Optionally, you can close the modal or perform other actions
                this.editCategory = false;
            })
            .catch(error => {
                // Handle errors, show error messages, etc.
                console.error('Error sending edit request:', error);
            });
        },

        // Function to delete the category
        deleteCategoryapproval(categoryId) {
            // Send a request to the server to delete the category
            // You can use fetch or axios to make a DELETE request to your server
            // ...

            // Handle the response and update the UI accordingly
            // ...
        },
        triggerceleryjob(){
            fetch("/trigger-celery-job").then(r => r.json()
            ).then(d =>{ 
                console.log("celery task details:",d)
                window.location.href="/download-file"
            })
        },

    },    

};
export default storemanagerDashboard;