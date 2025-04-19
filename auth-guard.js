// auth-guard.js

(async () => {
    // This script should run early, right after Supabase client is initialized in auth-config.js
    console.log('Auth Guard: Checking session...');

    const { data: { session }, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error('Auth Guard: Error getting session:', error);
        // Decide how to handle this - maybe allow access or redirect to an error page?
        // For now, we'll cautiously block access to protected routes if session check fails.
    }

    const isLoggedIn = !!session;
    const currentPage = window.location.pathname; // e.g., /login.html, /dashboard.html

    console.log(`Auth Guard: Logged In: ${isLoggedIn}, Current Page: ${currentPage}`);

    // Define protected routes (require login)
    const protectedRoutes = ['/dashboard.html', '/settings.html'];
    // Define auth routes (require NO login)
    const authRoutes = ['/login.html', '/signup.html'];

    // If user is NOT logged in and tries to access a protected route
    if (!isLoggedIn && protectedRoutes.some(route => currentPage.endsWith(route))) {
        console.log('Auth Guard: User not logged in, redirecting from protected route to login.');
        window.location.replace('login.html'); // Use replace to avoid back button issues
        return; // Stop script execution after redirect
    }

    // If user IS logged in and tries to access login/signup pages
    if (isLoggedIn && authRoutes.some(route => currentPage.endsWith(route))) {
        console.log('Auth Guard: User already logged in, redirecting from auth route to dashboard.');
        window.location.replace('dashboard.html'); // Redirect to dashboard
        return; // Stop script execution after redirect
    }

    console.log('Auth Guard: Access check complete, no redirect needed.');

})(); // Immediately invoke the async function 