const signup = {
    template: `
        <div>
            <div class="container" style=" display: flex; flex-direction: column; align-items: center; justify-content: center; max-width: 300px; margin: 0 auto; padding: 40px;">
                <h1 style="font-size: 20px; color: black;text-align: center;margin-right:30px;">Sign Up</h1>
                <form>
                    <div class="form-group" style="margin-top:5px;">
                        <label for="username">Username</label>
                        <input type="text" name="username" id="username" placeholder="Enter username" v-model="formData.username" style="border-radius: 5px;"/>
                    </div>
                    <div class="form-group" style="margin-top:5px;">
                        <label for="email">Email</label>
                        <input type="email" name="email" id="email" placeholder="Enter email" v-model="formData.email" style="border-radius: 5px;" />
                    </div>
                    <div class="form-group" style="margin-top:5px;">
                        <label for="password">Password</label>
                        <input type="password" name="password" placeholder="Enter Password" v-model="formData.password" style="border-radius: 5px;"/>
                    </div>
                    <div class="form-group" style="margin-top:5px;">
                        <label for="role">Select Role</label>
                        <div>
                            <input type="radio" name="role" value="User" v-model="formData.role"> User
                        </div>
                        <div>
                            <input type="radio" name="role" value="Store Manager" v-model="formData.role"> Store Manager
                        </div>
                    </div>
                    <div>
                        <button @click.prevent="signupUser" class="btn btn-outline-success" style="margin-top:5px;">Sign Up</button>
                    </div>
                </form>
            </div>
        </div>
    `,
    data() {
        return {
            formData: {
                username: '',
                email: '',
                password: '',
                role: ''
            },
        };
    },
    methods: {
        signupUser() {
            const userData = {
                username: this.formData.username,
                email: this.formData.email,
                password: this.formData.password,
                role: this.formData.role
            };

            fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })

            .then(response => response.json())
            .then(data => {
                this.$router.push("/")
                console.log(data);
                // Handle successful signup, e.g., show success message or redirect to login page
            })

            .catch(error => {
                console.error(error);
                // Handle signup error, e.g., show error message
            });

        },
    },
};

export default signup;
