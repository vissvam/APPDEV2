const login ={
    template:`
    <div>
        
            <div class="container " style="display: flex;  flex-direction: column; align-items: center; justify-content: center;max-width: 300px; margin: 0 auto; padding: 40px;">
                <h1 style="font-size: 20px; color: black;">Enter Your Login Details</h1>
                    <form>
                        <div class="form-group" style="margin-top:5px;"  >
                            <label for="exampleInputEmail1">Email</label>
                            <p>
                            <input type="email" name="email" id="email" aria-describedby="emailHelp" placeholder="Enter email" v-model="formData.email" style="border-radius: 5px;" />
                            </p>
                        </div>
                        <div class="form-group" style="margin-top:5px;" >
                            <label for="exampleInputPassword1">Password</label>
                            <p>
                            <input type="password" name="password"   placeholder="Password"  v-model="formData.password" style="border-radius: 5px;" />
                            </P>
                        </div>
                        <div style="margin-top:5px;" >
                            <button @click.prevent="loginUser" class="btn btn-outline-success" >Submit</button>
                        </div>
                    </form>
                    <p v-if="errorMessage" style="color:black; margin-top: 10px;">{{ errorMessage }}</p>
            </div>
        
    </div>    
    `, 
    
    data(){
        return {
            formData: {
                email:'',
                password:''
            },
            errorMessage: '',
        }
    },

    methods:{
        async loginUser(){
                const res = await fetch('/login?include_auth_token',{
                    method:'POST',
                    headers:{
                        'Content-Type' :'application/json',
                    },
                    body: JSON.stringify(this.formData),
                })

                if (res.ok){
                    const data = await res.json()
                    // console.log(data.response.user.authentication_token)
                    const authToken = data.response.user.authentication_token;
                    localStorage.setItem('Auth-token',authToken)
                    console.log('Authentication token:', authToken);

                    
                    
                    //fetch users role
                    const roleResponse = await fetch('/api/get_user_role',{
                        headers:{
                            Authorization: `Bearer ${authToken}`
                        }
                    })
                    if (roleResponse.ok){
                        const roleData =await roleResponse.json();
                        const userRole = roleData.role;
                        console.log('User role ', userRole)

                        // Redirect based on the user's role
                        if (userRole === 'Admin') {
                            this.$router.replace({ path: "/adminDashboard", query: { userRole } });
                        }else if (userRole === 'Store Manager') {
                            this.$router.replace({ path: "/storemanagerDashboard", query: { userRole } });
                        }else {
                          this.$router.replace({ path: "/userDashboard", query: { userRole } });
                        }
                        
                    }
                    const userResponse = await fetch('/api/get_user_name', {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    });
            
                    if (userResponse.ok) {
                        const userData = await userResponse.json();
                        const username = userData.username;
                        const userId = userData.user_id;
            
                        console.log('Username:', username);
                        console.log('User ID:', userId);
            
                        // Redirect based on the user's role and ID
                        // ... your existing role-based redirection code
                    }
                }
                else{
                    console.log('Error Response:', res.status, res.statusText);
                    const errorData = await res.json();
                    console.log('Error Data:', errorData);
                    this.errorMessage = 'Invalid credentials. Please try again.';
                }  
        },
    },
};


export default login

