
const signUpForm = document.getElementById("sign-up-form");
const errorMsg = document.getElementById('error');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageElement = document.getElementById('message');

const clearForm = () => {
    usernameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";
    errorMsg.textContent = ''; 
};

signUpForm.addEventListener('submit', async(event) => {
    event.preventDefault();

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const response = await axios.post('http://localhost:3000/user/signup', { username, email, password });

        clearForm();
        if (response.status === 201) {
            messageElement.textContent = 'User registered successfully.';
        } else if (response.status === 409) {
            messageElement.textContent = 'User already exists.';
        } else {
            messageElement.textContent = 'An error occurred.';
        }

    } catch (error) {
        clearForm();
        if (error.response && error.response.data && error.response.data.message) {
            errorMsg.textContent = `Error: ${error.response.data.message}`;
        } else {
            console.log('Error adding user:', error);
        
        }
    }
});
