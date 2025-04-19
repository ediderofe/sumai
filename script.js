document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Optional: Change hamburger icon to 'X' when menu is open
            if (navLinks.classList.contains('active')) {
                menuToggle.textContent = '✕'; // Or use an icon
                menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                menuToggle.textContent = '☰'; // Or use an icon
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu if a link is clicked (optional, good for single-page apps)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.textContent = '☰';
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // --- Optional: Intersection Observer for Scroll Animations ---
    // Example: Fade in elements as they enter the viewport
    const animatedElements = document.querySelectorAll('.feature-item, .pricing-plan');

    if ('IntersectionObserver' in window) {
        // Remove the default CSS animation if using Intersection Observer
        // to avoid conflicts and control timing better.
        // You might comment out the `animation: fadeIn...` rule in CSS
        // for `.feature-item` and `.pricing-plan` if you enable this.

        /*
        animatedElements.forEach(el => el.style.opacity = 0); // Start hidden

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                    // Optional: Unobserve after animation
                    // observer.unobserve(entry.target);
                } else {
                    // Optional: Reset animation if element scrolls out of view
                    // entry.target.style.opacity = 0;
                    // entry.target.style.transform = 'translateY(20px)';
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% visible

        animatedElements.forEach(element => {
            element.style.transform = 'translateY(20px)'; // Initial offset for animation
            observer.observe(element);
        });
        */
    } else {
        // Fallback for browsers without IntersectionObserver (CSS animations already handle this)
        console.log('Intersection Observer not supported, relying on CSS animations.');
    }
}); 