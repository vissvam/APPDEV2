const adminDashboard = {
    template: `
    <div style="text-align: center ;margin-top:20px; " >
        <h1>Welcome to Grocery Store, {{ username }}</h1>
        <button  type="button" class="btn btn-secondary" @click="viewCategories" style="margin: 20px; padding: 10px;">View Categories</button>
        <button  type="button" class="btn btn-secondary" @click="fetchApprovalRequests" style="margin: 20px; padding: 10px;">View Approval Requests</button>
        <button  type="button" class="btn btn-secondary" @click="viewEditRequests" style="margin: 20px; padding: 10px;">View Edit Requests</button>

        <div v-if="showCategories" class="d-flex justify-content-center">
        <div v-if="categories && categories.length > 0">
          <h2>Categories:</h2>
          <div class="row">
            <div v-for="category in categories" :key="category.C_ID"  class="col align-self-center">
              <div class="card"  style="width: 18rem; margin-bottom: 20px;background-color: rgba(255, 255, 255, 0.8);">
                <div class="card-body">
                  <h5 class="card-title">
                    <a @click="viewProductsInCategory(category.C_ID, category.C_name)" style="cursor: pointer;">
                      {{ category.C_name }}
                    </a>
                  </h5>
                  <button class="btn btn-outline-success" type="button" data-bs-toggle="modal" data-bs-target="#editCategoryModal" @click="editCategory(category.C_ID)">Edit</button>
                  <button class="btn btn-outline-danger" type="button" data-bs-toggle="modal" data-bs-target="#deleteConfirmationModal" @click="deleteCategory(category.C_ID)">Delete</button>
                </div>
              </div>
            </div>
          </div>
          <!-- Add Category Button -->
          <div class="card col-md-4 mb-4" style="width: 18rem; margin-bottom: 20px;background-color: rgba(255, 255, 255, 0.8);">
            <div class="card-body">
              <h5 class="card-title">Add Category</h5>
              <button class="btn btn-outline-info" type="button" data-bs-toggle="modal" data-bs-target="#addCategoryModal" @click="addCategory">Add Category</button>
            </div>
          </div>
        </div>
        <div v-else>
          No categories to display
          <!-- Add Category Button -->
          <div class="card mb-4" style="background-color: rgba(255, 255, 255, 0.8);">
            <div class="card-body">
              <h5 class="card-title">Add Category</h5>
              <button class="btn btn-outline-info" type="button" data-bs-toggle="modal" data-bs-target="#addCategoryModal" @click="addCategory">Add Category</button>
            </div>
          </div>
        </div>
        </div>
    

        <div v-else-if="showApprovalRequests" style="margin-top: 20px; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: rgba(249, 249, 249, 0.5);">
        <h2 style="font-size: 1.5em;margin-bottom: 10px;">Approval Requests:</h2>
            <ul v-if="approvalRequests && approvalRequests.length > 0" style="list-style-type: none;padding: 0;">
            <li v-for="request in approvalRequests" :key="request.email" style="margin-bottom: 10px;padding: 10px;border: 1px solid #ddd;border-radius: 5px;background-color: #fff;">
                <div style="font-weight: bold;">
                Username:{{ request.username }} Email:({{ request.email }}) - Role: {{ request.role }}
                <button  type="button" class="btn btn-outline-primary btn-sm" style="margin-top: 5px;margin-bottom: 5px;" @click="acceptRequest(request.email)">Accept</button>
                <button  type="button" class="btn btn-outline-danger btn-sm" style="margin-top: 5px;margin-bottom: 5px;" @click="rejectRequest(request.email)">Reject</button>
                </div>
            </li>
            </ul>
            <div v-else>
                <p style="font-style: italic;">No approval requests to display</p>
            </div>
        </div>

        <div v-else-if="showEditRequests">
            <div v-if="editRequests && editRequests.length > 0">
                <h2>Edit Requests:</h2>
                <div v-for="request in editRequests" :key="request.categoryId" class="card" style="width: 18rem; margin-bottom: 20px;">
                    <div class="card-body">
                        <h5 class="card-title">Edit Request for Category: {{ request.currentCategoryName }}</h5>
                        <p>New Category Name: {{ request.newCategoryName }}</p>
                        <!-- Add other details about the request as needed -->
                        <button type="button" class="btn btn-outline-primary btn-sm" style="margin-top: 5px;margin-bottom: 5px;" @click="acceptEditRequest(request.categoryId)">Accept</button>
                        <button type="button" class="btn btn-outline-danger btn-sm" style="margin-top: 5px;margin-bottom: 5px;" @click="rejectEditRequest(request.categoryId)">Reject</button>
                    </div>
                </div>
            </div>
            <div v-else>
                <p style="font-style: italic;"> No edit requests to display </p>
            </div>
        </div>

        <div v-else>
            Select an action to view content
        </div>

        <!-- Edit Category Modal -->
        <div v-if="editCategorymodal">
            <div class="modal fade" id="editCategoryModal" tabindex="-1" aria-labelledby="editCategoryModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false" >
            <div class="modal-dialog">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="editCategoryModalLabel">Edit Category</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" >
                    <p>Current Category Name: {{ existingCategoryName }}</p>
                    <div class="mb-3">
                    <label for="newCategoryName" class="form-label">New Category Name:</label>
                    <input type="text" id="newCategoryName" v-model="addnewCategoryName" class="form-control" required>
                    <!-- You can add more form fields or customize as needed -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="updateCategory">Update</button>
                </div>
                </div>
            </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="deleteConfirmationModal">
        <div class="modal fade" id="deleteConfirmationModal" tabindex="-1" aria-labelledby="deleteConfirmationModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="deleteConfirmationModalLabel">Confirm Deletion</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                <p>Are you sure you want to delete the category: {{ categoryToDelete.C_name }}?</p>
                </div>
                <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-danger" @click="confirmDeleteCategory">Delete</button>
                </div>
            </div>
            </div>
        </div>
        </div>

        <!-- Add Category Modal -->
        <div v-if="addCategoryModal">
          <div class="modal fade" id="addCategoryModal" tabindex="-1" aria-labelledby="addCategoryModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="addCategoryModalLabel">Add Category</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <!-- Input field for new category name -->
                  <label for="addnewCategoryName">New Category Name:</label>
                  <input type="text" id="addnewCategoryName" v-model="newCategoryName" required>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="button" class="btn btn-primary" @click="addCategoryToDatabase">Add Category</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        

        <div v-if="showProducts" class="d-flex justify-content-center" >
        <div v-if="products && products.products && products.products.length > 0" class="row">
          <h2>Products in {{ selectedCategoryName }}:</h2>
          <div v-for="product in products.products" :key="product.P_ID" class="col">
            <div class="card" style=" margin-left:20px;background-color: rgba(255, 255, 255, 0.8);">
              <div class="card-body">
                <h5 class="card-title">{{ product.P_name }}</h5>
                <p>Price per Unit: {{ product.price_per_unit }}</p>
                <p>Manufacturing/Expiration Date: {{ product.manf_exp_Date || 'N/A' }}</p>
                <p>UOM ID: {{ product.umo_id }}</p>
                <p>Available Quantity: {{ product.avable_qunty }}</p>
                <p>Remaining Quantity: {{ product.remaining_quantity }}</p>
                <!-- Add other details about the product as needed -->
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p v-if="products && products.message">{{ products.message }}</p>
          <p v-else>No products to display</p>
        </div>
        </div>
    
    </div>
  `,
    data() {
        return {
            username: '',
            showCategories: false,
            showApprovalRequests: false,
            categories: [],
            approvalRequests: [],
            editedCategory: {
                C_ID: null,
                C_name: '',
                // Add more properties as needed
              },
            editCategorymodal: false,
            existingCategoryName: '',
            categoryIdForUpdate: null,
            newCategoryName: '',
            deleteConfirmationModal: false,
            categoryToDelete: null,
            addnewCategoryName: '',
            addCategoryModal: false,
            selectedCategoryName: '',
            showProducts: false,
            products: [],
            editRequests: [],
            showEditRequests:false,
            

        };
    },
    mounted(){
        this.fetchUsername();
    },


    methods: {
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
        viewCategories() {
            // Fetch categories and show them
            fetch('/api/get_categories', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => {
                    this.categories = data.categories;
                    this.showCategories = true;
                    this.showApprovalRequests = false; // Hide approval requests
                    this.showProducts = false;
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        },

        fetchApprovalRequests() {
            // Fetch approval requests and show them
            console.log('Fetching approval requests...');
            fetch('/api/approval_requests', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => {
                    this.approvalRequests = data.approval_requests;
                    this.showApprovalRequests = true;
                    this.showCategories = false; // Hide categories
                    this.showProducts = false;

                })
                .catch(error => {
                    console.error('Error:', error);
                });
        },
        acceptRequest(email) {
            // Send an API request to accept the request for the user with the given email
            fetch('/api/accept_request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            })
            .then(response => {
                if (response.ok) {
                    // Request accepted successfully
                    // Remove the accepted request from the UI
                    this.approvalRequests = this.approvalRequests.filter(request => request.email !== email);
                } else {
                    console.error('Error accepting request');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        },
        rejectRequest(email) {
            // Send an API request to reject the request for the user with the given email
            fetch('/api/reject_request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            })
            .then(response => {
                if (response.ok) {
                    // Request rejected successfully
                    // Remove the rejected request from the UI
                    this.approvalRequests = this.approvalRequests.filter(request => request.email !== email);
                } else {
                    console.error('Error rejecting request');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        },
        editCategory(categoryId) {
            // Fetch the existing category name based on categoryId from the server
            this.fetchCategoryDetails(categoryId)
              .then(categoryDetails => {
                // Set up the existing category name and open the modal
                this.existingCategoryName = categoryDetails.name;
                // Set the category ID when opening the modal
                this.categoryIdForUpdate = categoryId;
                // Open the editCategoryModal
                this.editCategorymodal= true;
                
            })
              .catch(error => {
                console.error('Error fetching category details:', error);
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
        closeEditModal() {
            // Close the "Edit Category" modal
            this.editCategoryModal = false;
        },
      
        updateCategory() {
            // Assuming you have the category ID available
            const categoryId = this.categoryIdForUpdate;
    
            // Make an API call to update the category name
            fetch(`/api/update_categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ C_name: this.addnewCategoryName }),
            })
            .then(response => response.json())
            .then(data => {
                // Handle the response from the server
                console.log('Category updated:', data);
                
                // Close the modal and perform any other necessary actions
                $('#editCategorymodal').modal('hide');
                
                // Optionally, you may want to refresh the categories list
                // this.fetchCategories();
            })
            .catch(error => {
                console.error('Error updating category:', error);
            });
        },
        deleteCategory(categoryId) {
            // Set the category to be deleted
            this.categoryToDelete = this.categories.find(cat => cat.C_ID === categoryId);
            // Show the delete confirmation modal
            this.deleteConfirmationModal = true;
        },
        confirmDeleteCategory() {
            const categoryId = this.categoryToDelete.C_ID;
        
            // Make an API call to delete the category
            // Implement the necessary logic to delete the category from the server
            // After successful deletion, update the UI or fetch the updated category list
        
            // Example API call using fetch:
            fetch(`/api/categories/${categoryId}`, {
              method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                  console.log(`Category with ID ${categoryId} deleted successfully.`);
                  // Update the UI or fetch the updated category list
                  this.fetchCategories(); // You may need to implement this method
                } else {
                  console.error('Error deleting category:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error deleting category:', error);
            })
            .finally(() => {
                // Close the delete confirmation modal
                this.deleteConfirmationModal = false;
                // Reset the categoryToDelete
                this.categoryToDelete = null;
                this.showCategories = true;
            });
        },
        addCategory() {
            this.addCategoryModal = true;
            // Reset the newCategoryName when opening the modal
            this.newCategoryName = '';
        },
        addCategoryToDatabase() {
            // Check if the new category name is not empty
            if (!this.newCategoryName.trim()) {
              // Handle the case where the new category name is empty
              console.error('New category name is empty. Please enter a valid name.');
              return;
            }
        
            // Make an API call to add the new category
            fetch('/api/categories', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                C_name: this.newCategoryName,
                // Add other properties as needed
              }),
            })
              .then(response => response.json())
              .then(data => {
                // Handle the response from the server
                // For example, you can refresh the categories list or perform any other necessary actions
                console.log('New category added:', data);
        
                // Close the modal
                $('#addCategoryModal').modal('hide');
        
                // Optionally, you can set addCategoryModal to false to hide the modal
                this.addCategoryModal = false;
        
                // Refresh the categories list or perform other actions as needed
                // this.fetchCategories(); // Call your method to refresh categories
              })
              .catch(error => {
                console.error('Error:', error);
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
                this.selectedCategoryName = categoryName;
                this.products = data;
                this.showCategories = false;
                this.showProducts = true;
                this.showEditRequests=false,
                console.log('Products array:', this.products);
              })
              .catch(error => {
                // Handle other errors
                console.error('Error:', error.message);
              });
        },
        viewEditRequests() {
            // Fetch edit requests and show them
            console.log('Fetching edit requests...');
            fetch('/api/admin/edit-requests', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => {
                    this.editRequests = data.editRequests;
                    this.showEditRequests = true;
                    // Optionally, you can hide other sections if needed
                    this.showCategories = false;
                    this.showApprovalRequests = false;
                    this.showProducts = false;
                })
                .catch(error => {
                    console.error('Error fetching edit requests:', error);
                });
        },
        acceptEditRequest(categoryId) {
            // Make an API call to accept the edit request for the specified category ID
            fetch(`/api/admin/accept-edit-request/${categoryId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                // Refresh the editRequests list or update the UI as needed
            })
            .catch(error => {
                console.error('Error accepting edit request:', error);
            });
        },
        rejectEditRequest(categoryId) {
            // Make an API call to reject the edit request for the specified category ID
            fetch(`/api/admin/reject-edit-request/${categoryId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                // Refresh the editRequests list or update the UI as needed
            })
            .catch(error => {
                console.error('Error rejecting edit request:', error);
            });
        },
          
          
          
        // ... other methods
    }
};

export default adminDashboard;
