// Project Data
const projects = [
    {
        id: 1,
        title: 'E-Commerce Platform',
        category: 'web',
        description: 'A full-featured e-commerce platform with product catalog, shopping cart, and payment integration.',
        tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        icon: '🛒'
    },
    {
        id: 2,
        title: 'Social Media Dashboard',
        category: 'web',
        description: 'Analytics dashboard for managing multiple social media accounts and tracking metrics.',
        tags: ['React', 'Chart.js', 'Firebase', 'Tailwind'],
        icon: '📊'
    },
    {
        id: 3,
        title: 'Mobile Fitness App',
        category: 'mobile',
        description: 'Cross-platform fitness tracking app with workout plans and progress monitoring.',
        tags: ['React Native', 'Firebase', 'Redux'],
        icon: '💪'
    },
    {
        id: 4,
        title: 'UI Design System',
        category: 'design',
        description: 'Comprehensive design system with reusable components and design guidelines.',
        tags: ['Figma', 'Component Library', 'Documentation'],
        icon: '🎨'
    },
    {
        id: 5,
        title: 'AI Chat Application',
        category: 'web',
        description: 'Real-time chat application powered by AI for intelligent conversation assistance.',
        tags: ['Vue.js', 'WebSocket', 'OpenAI API', 'Express'],
        icon: '🤖'
    },
    {
        id: 6,
        title: 'Weather Forecast App',
        category: 'mobile',
        description: 'Beautiful weather application with detailed forecasts and location-based features.',
        tags: ['Flutter', 'Weather API', 'Geolocation'],
        icon: '🌤️'
    },
    {
        id: 7,
        title: 'Project Management Tool',
        category: 'web',
        description: 'Collaborative project management platform with real-time updates and team features.',
        tags: ['Next.js', 'PostgreSQL', 'Real-time DB', 'Tailwind'],
        icon: '📋'
    },
    {
        id: 8,
        title: 'Brand Identity Design',
        category: 'design',
        description: 'Complete brand identity design including logo, color palette, and brand guidelines.',
        tags: ['Branding', 'Logo Design', 'Adobe Suite'],
        icon: '✨'
    },
    {
        id: 9,
        title: 'Content Management System',
        category: 'web',
        description: 'Headless CMS with rich content editing and multi-language support.',
        tags: ['Next.js', 'Strapi', 'PostgreSQL', 'GraphQL'],
        icon: '📝'
    }
];

// DOM Elements
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectsGrid = document.getElementById('projectsGrid');
const contactForm = document.getElementById('contactForm');
const navLinksArray = document.querySelectorAll('.nav-link');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProjects('all');
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Hamburger Menu
    hamburger.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when nav link is clicked
    navLinksArray.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Filter Projects
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            renderProjects(e.target.dataset.filter);
        });
    });

    // Contact Form
    contactForm.addEventListener('submit', handleFormSubmit);
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    navLinks.classList.toggle('active');
    
    // Animate hamburger
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = navLinks.classList.contains('active') ? 'rotate(45deg) translate(8px, 8px)' : 'none';
    spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
    spans[2].style.transform = navLinks.classList.contains('active') ? 'rotate(-45deg) translate(7px, -7px)' : 'none';
}

// Render Projects
function renderProjects(filter) {
    const filtered = filter === 'all' 
        ? projects 
        : projects.filter(project => project.category === filter);

    projectsGrid.innerHTML = filtered.map((project, index) => `
        <div class="project-card" style="animation-delay: ${index * 0.1}s">
            <div class="project-image">${project.icon}</div>
            <div class="project-content">
                <div class="project-category">${project.category}</div>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Handle Form Submission
function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Validate form
    if (!name || !email || !subject || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Simulate sending the form (in a real app, this would send to a backend)
    console.log('Form Data:', {
        name,
        email,
        subject,
        message
    });

    // Show success message
    showNotification('Message sent successfully! I will get back to you soon.', 'success');

    // Reset form
    contactForm.reset();
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show Notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles dynamically
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s ease-out;
        z-index: 2000;
        max-width: 300px;
        word-wrap: break-word;
    `;

    document.body.appendChild(notification);

    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll offset for fixed navbar
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const navbar = document.querySelector('.navbar');
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = target.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Scroll animations for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animation
document.querySelectorAll('.stat, .about-text, .skill-tag').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});
