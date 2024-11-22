
document.getElementById('form').addEventListener('submit', handleSubmit);

console.log("in new pass");

function handleSubmit(e) {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    e.preventDefault();

    const p1 = document.getElementById('p1').value;
    const p2 = document.getElementById('p2').value;

    // Check if passwords match
    if (p1 !== p2) {
        document.getElementById("mydiv").innerText = "Passwords do not match!";
        return;
    }

    // Proceed with password reset if passwords match
    axios.post(`http://localhost:5000/password/resetpassword/${token}`, { password: p1 })
        .then(response => {
            if (response.status === 200) {
                alert('Password reset successful');
                window.location.href = 'http://localhost:5000/login.html';
            } else {
                document.getElementById("mydiv").innerText = response.data.message || 'An unexpected error occurred';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById("mydiv").innerText = 'An error occurred while resetting the password';
        });
}
