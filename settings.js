// settings.js
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Settings script loaded');
    const profileForm = document.querySelector('#profile-settings .settings-form');
    const emailInput = document.getElementById('email');
    // const nameInput = document.getElementById('name'); // Removed name input
    const passwordInput = document.getElementById('password');
    const saveProfileButton = profileForm?.querySelector('button[type="submit"]');
    const messageDiv = document.createElement('div');
    messageDiv.style.marginTop = '1rem';
    profileForm?.appendChild(messageDiv); // Add message area for feedback

    // --- Fetch and Populate User Data --- //
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error) {
            console.error('Error fetching user:', error);
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'Could not load user data.';
            return; // Stop if user data can't be loaded
        } 

        if (user) {
            console.log('User data loaded:', user);
            if (emailInput) {
                emailInput.value = user.email || '';
            }
            // Removed name population logic
            if(saveProfileButton) saveProfileButton.disabled = false; // Enable save button once data loads
            
        } else {
            console.log('No user logged in.');
             messageDiv.style.color = 'red';
            messageDiv.textContent = 'No user is currently logged in.';
             // Redirect to login if no user is found (auth guard should handle this, but as fallback)
            // window.location.replace('login.html');
        }

    } catch (err) {
        console.error('Unexpected error fetching user data:', err);
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'An error occurred loading your profile.';
    }

    // --- Handle Profile Form Submission (Password Update) --- //
    if (profileForm && saveProfileButton) {
        profileForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            messageDiv.textContent = '';
            const newPassword = passwordInput.value;

            // Only update if a new password is provided
            if (!newPassword) {
                messageDiv.style.color = 'blue';
                messageDiv.textContent = 'No password entered. Profile not updated.';
                return; 
            }

            if (newPassword.length < 8) {
                 messageDiv.style.color = 'red';
                 messageDiv.textContent = 'New password must be at least 8 characters long.';
                return;
            }

            saveProfileButton.disabled = true;
            saveProfileButton.textContent = 'Saving...';

            try {
                const { data, error } = await supabaseClient.auth.updateUser({ 
                    password: newPassword 
                    // Removed placeholder comments for updating name metadata
                });

                if (error) {
                    console.error('Error updating user:', error);
                    messageDiv.style.color = 'red';
                    messageDiv.textContent = `Error updating password: ${error.message}`;
                } else {
                    console.log('User updated successfully:', data);
                    messageDiv.style.color = 'green';
                    messageDiv.textContent = 'Password updated successfully!';
                    passwordInput.value = ''; // Clear password field
                }

            } catch (err) {
                 console.error('Unexpected error updating user:', err);
                 messageDiv.style.color = 'red';
                 messageDiv.textContent = 'An unexpected error occurred while updating.';
            } finally {
                saveProfileButton.disabled = false;
                saveProfileButton.textContent = 'Save Profile Changes';
            }
        });
    }
}); 