const home ={
    template :`<div> 
        <div style="text-align: center ;margin-top:20px;" >
            <h1 style="font-size: 26px; color: black;">The best online grocerystore</h1>
                <div class="row align-items-start" style="display: flex; flex-direction: column; align-items: center; justify-content: center; ">
                    <p>
                    <div class="row">
                    <router-link to="/login">
                        <a class="btn btn-outline-dark"  style="color: white; width:250px;">Login</a>
                    </router-link>
                    </div>
                    </p>
                    <p>
                    <div class="row">
                    <router-link to="/signup">
                        <a class="btn btn-outline-dark" style="color: white; width:250px;">Signup</a>
                    </router-link>       
                    </div>
                    </p>
                </div>
        </div>
        
    </div>`
};

export default home;