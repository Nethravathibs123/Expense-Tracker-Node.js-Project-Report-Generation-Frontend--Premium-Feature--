const loginForm = document.getElementById("login-form");
const errorMsg = document.getElementById('error');
let login = [];

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await axios.post(`http://localhost:3000/user/login`, { email, password });
        console.log(response);
        const token = response.data.token;
        localStorage.setItem('token', token);
        window.location.href="/expense.html"

        document.getElementById('email').value = "";
        document.getElementById('password').value = "";

        errorMsg.textContent = 'Login successful';
    } catch (error) {
       
        document.getElementById('email').value = "";
        document.getElementById('password').value = "";

        if (error.response) {
          
            const div = document.getElementById('mydiv');
            if (error.response.status === 404) {
                console.log(error.response.data.message);
                div.innerText = error.response.data.message; 
            } else if (error.response.status === 401) {
                console.log(error.response.data.message);
                div.innerText = error.response.data.message; 
            } else {
                console.log(error.response.data.message);
                div.innerText = 'An error occurred';
            }
        }
    }
});
