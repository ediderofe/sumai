// login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginButton = loginForm?.querySelector('button[type="submit"]');
    const errorMessageDiv = document.createElement('div'); // Element to display errors
    errorMessageDiv.style.color = 'red';
    errorMessageDiv.style.marginTop = '1rem';
    loginForm?.parentNode.insertBefore(errorMessageDiv, loginForm.nextSibling);

    if (loginForm && loginButton) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission
            errorMessageDiv.textContent = ''; // Clear previous errors
            loginButton.disabled = true;
            loginButton.textContent = 'Logging In...';

            const emailInput = loginForm.querySelector('#email');
            const passwordInput = loginForm.querySelector('#password');
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Basic Frontend Validation
            if (!email || !password) {
                errorMessageDiv.textContent = 'Please enter both email and password.';
                loginButton.disabled = false;
                loginButton.textContent = 'Log In';
                return;
            }

            try {
                console.log(`Attempting login for: ${email}`);
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (error) {
                    console.error('Supabase login error:', error.message);
                    errorMessageDiv.textContent = `Login failed: ${error.message}`;
                     // Common errors: "Invalid login credentials", "Email not confirmed"
                     if (error.message.includes('Email not confirmed')) {
                         errorMessageDiv.textContent += ' Please check your email inbox (and spam folder) for the confirmation link.';
                     }
                    loginButton.disabled = false;
                    loginButton.textContent = 'Log In';
                } else if (data.user) {
                    console.log('Supabase login success:', data.user);
                    // Redirect to the dashboard upon successful login
                    window.location.href = 'dashboard.html'; 
                } else {
                    // Should not happen if there's no error and no user, but handle defensively
                    console.error('Supabase login issue: No error but no user data.');
                    errorMessageDiv.textContent = 'Login failed. Please try again.';
                    loginButton.disabled = false;
                    loginButton.textContent = 'Log In';
                }
            } catch (err) {
                console.error('Unexpected error during login:', err);
                errorMessageDiv.textContent = 'An unexpected error occurred. Please try again.';
                loginButton.disabled = false;
                 loginButton.textContent = 'Log In';
            }
        });
    }
}); 