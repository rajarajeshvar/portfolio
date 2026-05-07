// Smooth scroll to section
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}

// Animate skill bars on scroll
function animateSkillBars() {
  const skillBars = document.querySelectorAll('.skill-progress');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.style.width || '0%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  skillBars.forEach(bar => observer.observe(bar));
}

// Handle contact form submission
// Handle contact form submission
async function handleFormSubmit(event) {
  event.preventDefault(); // Stop the default form submission

  const form = event.target;
  const statusMessage = document.createElement('p');
  statusMessage.textContent = 'Sending...';
  statusMessage.style.textAlign = 'center';
  form.append(statusMessage);
  
  const formData = new FormData(form);
  
  try {
    const response = await fetch(form.action, { 
      method: form.method,
      body: formData,
      headers: {
        // This is crucial for JSON response/AJAX mode
        'Accept': 'application/json' 
      }
    });

    statusMessage.remove(); 
    
    if (response.ok) {
      // SUCCESS: The form data was sent.
      alert('Thank you for your message! I will get back to you soon.');
      form.reset();
    } else {
      // ERROR: Submission failed (e.g., failed validation, not activated).
      const data = await response.json();
      if (data.errors) {
        alert('Oops! There was an issue submitting your form. Please check the fields.');
      } else {
        alert('Oops! There was an issue submitting your form. Please try again. (Check FormSubmit activation)');
      }
    }
  } catch (error) {
    // FATAL ERROR: Network or connection issue.
    statusMessage.remove();
    console.error('Submission error:', error);
    alert('An unexpected error occurred. Please try again later.');
  }
}
// <-- The function MUST end here.

// Add scroll-based animations
function addScrollAnimations() {
  const animatedElements = document.querySelectorAll(
    '.hero-text, .about-image, .about-content, .project-card, .skill-category, .tool-card, .contact-info, .contact-form'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0) scale(1)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// Add active state to navigation on scroll
function updateActiveNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.pageYOffset;

  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 100;
    const sectionId = section.getAttribute('id');
    
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      // You can add active class to navigation items here if you have a navigation menu
      console.log('Active section:', sectionId);
    }
  });
}

// Parallax effect for hero section
function addParallaxEffect() {
  const heroSection = document.querySelector('.hero-section');
  if (!heroSection) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = heroSection.querySelectorAll('.hero-blur');
    
    parallaxElements.forEach((el, index) => {
      const speed = 0.5 + (index * 0.2);
      el.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
}

// Add hover effect to project cards
function addProjectCardEffects() {
  const projectCards = document.querySelectorAll('.project-card');
  
  projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Animate skill bars when they come into view
  animateSkillBars();
  
  // Add scroll-based animations
  addScrollAnimations();
  
  // Add parallax effect
  addParallaxEffect();
  
  // Add project card effects
  addProjectCardEffects();
  
  // Handle form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }
  
  // Update active navigation on scroll
  window.addEventListener('scroll', updateActiveNavigation);
  
  // Add smooth scroll behavior to all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      scrollToSection(targetId);
    });
  });
});

// Add resize handler for responsive adjustments
let resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function() {
    // Add any resize-specific logic here
    console.log('Window resized');
  }, 250);
});
