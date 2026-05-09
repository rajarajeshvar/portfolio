import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZ1d4Y1Vev6BWfCcdeDgdETSFha8BdrGU",
  authDomain: "portfolio-c387b.firebaseapp.com",
  projectId: "portfolio-c387b",
  storageBucket: "portfolio-c387b.firebasestorage.app",
  messagingSenderId: "87374592053",
  appId: "1:87374592053:web:600d6a7dfa4194bbc0997c",
  measurementId: "G-4JWCS5EHC5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const projectsCol = collection(db, 'projects');

let projects = [];

// Real-time synchronization with Firestore
onSnapshot(projectsCol, (snapshot) => {
    projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
    renderProjects();
    renderAdminList();
});

// Render Projects to the main grid
function renderProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = '<p class="section-subtitle">No projects found. Use the admin panel to add some!</p>';
        return;
    }

    container.innerHTML = projects.map(project => `
        <div class="project-card" data-id="${project.id}">
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
                <div class="project-overlay">
                    <a href="${project.link}" target="_blank" class="project-btn">View Project</a>
                </div>
            </div>
            <div class="project-content">
                <div class="project-tags">
                    ${project.tags ? project.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-desc">${project.description}</p>
            </div>
        </div>
    `).join('');
    
    // Re-initialize animations for new elements
    addScrollAnimations();
    addProjectCardEffects();
}

// Render Admin Project List
function renderAdminList() {
    const listContainer = document.getElementById('admin-project-list');
    if (!listContainer) return;

    listContainer.innerHTML = projects.map(project => `
        <div class="admin-project-item">
            <div class="admin-project-info">
                <h4>${project.title}</h4>
                <p>${project.tags ? project.tags.join(', ') : ''}</p>
            </div>
            <div class="admin-item-actions">
                <button class="btn-sm edit-btn-trigger" data-id="${project.id}" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="btn-sm btn-delete delete-btn-trigger" data-id="${project.id}" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn-trigger').forEach(btn => {
        btn.onclick = () => editProject(btn.getAttribute('data-id'));
    });
    document.querySelectorAll('.delete-btn-trigger').forEach(btn => {
        btn.onclick = () => deleteProject(btn.getAttribute('data-id'));
    });
}

// Admin actions
async function editProject(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    document.getElementById('project-id').value = project.id;
    document.getElementById('project-title-input').value = project.title;
    document.getElementById('project-desc-input').value = project.description;
    document.getElementById('project-image-input').value = project.image;
    document.getElementById('project-link-input').value = project.link;
    document.getElementById('project-tags-input').value = project.tags ? project.tags.join(', ') : '';
    
    document.getElementById('save-project-btn').textContent = 'Update Project';
}

async function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            await deleteDoc(doc(db, 'projects', id));
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Error deleting project. Check your Firestore rules.");
        }
    }
}

// Initialize Admin Panel
function initAdminPanel() {
    const modal = document.getElementById('admin-modal');
    const loginBtn = document.getElementById('admin-login-btn');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-edit-btn');
    const form = document.getElementById('project-form');

    if (!modal || !loginBtn) return;

    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const password = prompt('Please enter the admin password:');
        if (password === 'raja2006') {
            modal.style.display = 'block';
            renderAdminList();
        } else if (password !== null) {
            alert('Incorrect password!');
        }
    });

    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
        document.getElementById('project-id').value = '';
        document.getElementById('save-project-btn').textContent = 'Save Project';
    };

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    window.onclick = (event) => {
        if (event.target == modal) closeModal();
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('project-id').value;
        const projectData = {
            title: document.getElementById('project-title-input').value,
            description: document.getElementById('project-desc-input').value,
            image: document.getElementById('project-image-input').value,
            link: document.getElementById('project-link-input').value,
            tags: document.getElementById('project-tags-input').value.split(',').map(t => t.trim())
        };

        try {
            if (id) {
                await updateDoc(doc(db, 'projects', id), projectData);
            } else {
                await addDoc(projectsCol, projectData);
            }
            closeModal();
        } catch (error) {
            console.error("Error saving project:", error);
            alert("Error saving project. Check your Firestore rules.");
        }
    };
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAdminPanel();
    
    // Existing initializations
    animateSkillBars();
    addScrollAnimations();
    addParallaxEffect();
    addProjectCardEffects();
    
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

// Original functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

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

function addScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.hero-text, .about-image, .about-content, .project-card, .skill-category, .tool-card'
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

function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            // console.log('Active section:', sectionId);
        }
    });
}

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