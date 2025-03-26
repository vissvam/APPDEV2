import home from './components/home.js'
import login from './components/login.js'
import signup from './components/signup.js'
import userDashboard from './components/userDashboard.js'
import adminDashboard from './components/adminDashboard.js'
import storemanagerDashboard from './components/storemanagerDashboard.js'



const routes = [
    {path : '/' ,component:home},
    {path : '/login',component: login },
    {path : '/signup',component: signup},
    {path :"/userDashboard",component:userDashboard},
    {path :"/adminDashboard",component:adminDashboard},
    {path :"/storemanagerDashboard",component:storemanagerDashboard}
];


const router = new VueRouter({
    routes,
    base:'/',

});

const store = new Vuex.Store({
    state: {
        products:[],
        product :null,
        cart: JSON.parse(localStorage.getItem('cart')) || [],
    },
    mutations: {
      // Mutations to modify the state go here
      addToCart(state, { product, quantity }) {
        // Check if the product is already in the cart
        const existingProduct = state.cart.find(item => item.product.P_ID === product.P_ID);
    
        if (existingProduct) {
            // If the product is already in the cart, update the quantity
            existingProduct.quantity += Number(quantity); // Convert to number
        } else {
            // If the product is not in the cart, add it with the given quantity
            state.cart.push({ product, quantity: Number(quantity) }); // Convert to number
        }
        localStorage.setItem('cart', JSON.stringify(state.cart));
      },
      clearCart(state) {
        state.cart = [];
      },
    },
    actions: {
      // Actions to perform asynchronous tasks go here
      addProductToCart({ commit }, payload) {
        commit('addToCart', payload.product);
      },

    },
    getters: {
      cartTotal(state) {
          return state.cart.reduce((total, item) => {
              console.log('Price:', item.product.price);
              console.log('Quantity:', item.quantity);
              return total + (item.product.price_per_unit  * item.quantity);
          }, 0);
      },
      // ... other getters
    }
});

const app=new Vue({
    el:'#app',
    router:router,
    store:store,
    data: {
      userRole: null, // Initialize to null
      // ... other data properties ...
    },
    // ... other Vue.js options ...
    created() {
      // Retrieve userRole from the query parameters
      const query = this.$route.query;
      if (query && query.userRole) {
        this.userRole = query.userRole;
      }
    },
    methods:{
        async logout(){
            const res= await fetch('/logout')
            if (res.ok){
                localStorage.clear()
                this.$router.push('/')
            }
            else{
                console.log('could not logout the user')
            }
        },
      },
})

export default router