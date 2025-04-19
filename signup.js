// signup.js
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const signupButton = signupForm?.querySelector('button[type="submit"]');
    const errorMessageDiv = document.createElement('div'); // Element to display errors
    errorMessageDiv.style.color = 'red';
    errorMessageDiv.style.marginTop = '1rem';
    signupForm?.parentNode.insertBefore(errorMessageDiv, signupForm.nextSibling);

    if (signupForm && signupButton) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission
            errorMessageDiv.textContent = ''; // Clear previous errors
            signupButton.disabled = true;
            signupButton.textContent = 'Signing Up...';

            const emailInput = signupForm.querySelector('#email');
            const passwordInput = signupForm.querySelector('#password');
            const confirmPasswordInput = signupForm.querySelector('#confirm-password');
            const termsCheckbox = signupForm.querySelector('input[name="terms"]');

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Basic Frontend Validation
            if (!email || !password || !confirmPassword) {
                errorMessageDiv.textContent = 'Please fill in all fields.';
                signupButton.disabled = false;
                signupButton.textContent = 'Sign Up & Start Free Trial';
                return;
            }
            if (password.length < 8) {
                 errorMessageDiv.textContent = 'Password must be at least 8 characters long.';
                 signupButton.disabled = false;
                 signupButton.textContent = 'Sign Up & Start Free Trial';
                return;
            }
             if (password !== confirmPassword) {
                 errorMessageDiv.textContent = 'Passwords do not match.';
                 signupButton.disabled = false;
                 signupButton.textContent = 'Sign Up & Start Free Trial';
                return;
            }
            if (!termsCheckbox.checked) {
                 errorMessageDiv.textContent = 'You must agree to the Terms and Privacy Policy.';
                 signupButton.disabled = false;
                 signupButton.textContent = 'Sign Up & Start Free Trial';
                return;
            }

            try {
                console.log(`Attempting signup for: ${email}`);
                const { data, error } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                });

                if (error) {
                    console.error('Supabase signup error:', error.message);
                    errorMessageDiv.textContent = `Signup failed: ${error.message}`;
                    signupButton.disabled = false;
                    signupButton.textContent = 'Sign Up & Start Free Trial';
                } else {
                    console.log('Supabase signup success:', data);
                    // IMPORTANT: Supabase sends a confirmation email by default.
                    // Inform the user to check their email.
                    signupForm.reset(); // Clear the form
                    errorMessageDiv.style.color = 'green';
                    errorMessageDiv.textContent = 'Signup successful! Please check your email for a confirmation link.';
                    // Optionally redirect after a delay or keep the message
                    // setTimeout(() => { window.location.href = 'login.html'; }, 5000);
                }
            } catch (err) {
                console.error('Unexpected error during signup:', err);
                errorMessageDiv.textContent = 'An unexpected error occurred. Please try again.';
                signupButton.disabled = false;
                 signupButton.textContent = 'Sign Up & Start Free Trial';
            }
        });
    }
}); 