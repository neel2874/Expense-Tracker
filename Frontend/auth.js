// Structural execution validation setup on load
document.addEventListener('DOMContentLoaded', () => {
    initValidationCheck();
});

// Checks configuration criteria for signup inputs and redirects on success
function initValidationCheck() {
    const registerForm = document.getElementById('submitRegisterForm');
    const loginForm = document.getElementById('submitLoginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Intercept default submission to backend
            const name = registerForm.querySelector('input[placeholder="Full name"]').value;
            const email = registerForm.querySelector('input[placeholder="Email address"]').value;
            const pass = document.getElementById('registerPasswordInput').value;
            const confirmPass = document.getElementById('confirmPasswordInput').value;

            if (pass !== confirmPass) {
                alert("Passwords do not match! Please verify your password entry.");
                return;
            }

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password: pass, name: name })
                });
                const resData = await response.json();
                if (response.ok) {
                    window.location.href = 'dashboard.html';
                } else {
                    alert(resData.message || "Registration failed!");
                }
            } catch (error) {
                console.error("Registration error:", error);
                alert("An error occurred during registration. Please try again.");
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Intercept default submission
            const email = loginForm.querySelector('input[placeholder="Email address"]').value;
            const pass = document.getElementById('loginPasswordInput').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password: pass })
                });
                const resData = await response.json();
                if (response.ok) {
                    window.location.href = 'dashboard.html';
                } else {
                    alert(resData.message || "Login failed!");
                }
            } catch (error) {
                console.error("Login error:", error);
                alert("An error occurred during login. Please try again.");
            }
        });
    }
}

// Global reveal wrapper function for tracking eye icons clicks securely
function togglePasswordVisibility(targetId) {
    const field = document.getElementById(targetId);
    const triggerIcon = window.event.target; // Ensure we use window.event or the passed event context safely

    if (field && field.type === 'password') {
        field.type = 'text';
        triggerIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else if (field) {
        field.type = 'password';
        triggerIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}