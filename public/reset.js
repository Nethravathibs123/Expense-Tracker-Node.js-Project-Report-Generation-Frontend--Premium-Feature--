
const forgetPasswordForm = document.getElementById("forget-password-form");
const errorMsg = document.getElementById('error');

const port = 3000;
forgetPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;

    try {
        const response = await axios.post(`http://localhost:${port}/password/forgotpassword`, { email });

        // Redirect to login page on successful request
        window.location.href = "http://localhost:3000/login.html";
    }  catch(error){
        console.log('Error adding user: ',error);
    }

});
