/**
 * FAST - Faculté des Sciences et Techniques
 * Portail Universitaire - JavaScript
 */

// ============================================
// INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initHeader();
    initMobileMenu();
    initAnimations();
    initTabs();
    initResourceFilter();
    initQCM();
    initContactForm();
    initSmoothScroll();
});

// ============================================
// HEADER SCROLL EFFECT
// ============================================
function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

// ============================================
// MENU MOBILE
// ============================================
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (!menuToggle || !nav) return;
    
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Animation des barres du hamburger
        const spans = menuToggle.querySelectorAll('span');
        if (menuToggle.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    // Fermer le menu au clic sur un lien
    const navLinks = nav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

// ============================================
// ANIMATIONS AU SCROLL
// ============================================
function initAnimations() {
    const animatedElements = document.querySelectorAll('.card, .section-title, .quick-access-card, .department-card, .formation-card, .resource-card, .news-card, .team-card');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

// ============================================
// ONGLETS (TABS)
// ============================================
function initTabs() {
    const tabContainers = document.querySelectorAll('.formations-tabs, .tabs-container');
    
    tabContainers.forEach(container => {
        const tabBtns = container.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = this.dataset.tab;
                
                // Désactiver tous les onglets
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Activer l'onglet cliqué
                this.classList.add('active');
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    });
}

// ============================================
// FILTRAGE DES RESSOURCES
// ============================================
function initResourceFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const resourceCards = document.querySelectorAll('.resource-card');
    
    if (filterBtns.length === 0 || resourceCards.length === 0) return;
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            // Mettre à jour les boutons actifs
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrer les cartes
            resourceCards.forEach(card => {
                const category = card.dataset.category;
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.classList.add('fade-in');
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ============================================
// QCM INTERACTIF
// ============================================
function initQCM() {
    const qcmContainers = document.querySelectorAll('.qcm-container');
    
    qcmContainers.forEach(container => {
        const questions = container.querySelectorAll('.qcm-question');
        const submitBtn = container.querySelector('.qcm-submit');
        const resultContainer = container.querySelector('.qcm-result');
        
        if (!submitBtn) return;
        
        submitBtn.addEventListener('click', function() {
            let score = 0;
            let totalQuestions = questions.length;
            let answeredQuestions = 0;
            
            questions.forEach(question => {
                const options = question.querySelectorAll('.qcm-option');
                const selectedOption = question.querySelector('input[type="radio"]:checked');
                const correctOption = question.querySelector('[data-correct="true"]');
                
                // Réinitialiser les styles
                options.forEach(opt => {
                    opt.classList.remove('correct', 'incorrect');
                });
                
                if (selectedOption) {
                    answeredQuestions++;
                    const selectedLabel = selectedOption.closest('.qcm-option');
                    
                    if (selectedOption.dataset.correct === 'true') {
                        score++;
                        selectedLabel.classList.add('correct');
                    } else {
                        selectedLabel.classList.add('incorrect');
                        if (correctOption) {
                            correctOption.closest('.qcm-option').classList.add('correct');
                        }
                    }
                }
            });
            
            // Afficher le résultat
            if (resultContainer) {
                const scoreElement = resultContainer.querySelector('.qcm-score');
                const messageElement = resultContainer.querySelector('.qcm-message');
                
                if (scoreElement) {
                    scoreElement.textContent = `${score}/${totalQuestions}`;
                }
                
                if (messageElement) {
                    const percentage = (score / totalQuestions) * 100;
                    let message = '';
                    
                    if (percentage >= 80) {
                        message = 'Excellent ! 🎉';
                    } else if (percentage >= 60) {
                        message = 'Bien joué ! 👍';
                    } else if (percentage >= 40) {
                        message = 'Peut mieux faire 😊';
                    } else {
                        message = 'Continuez à réviser 📚';
                    }
                    
                    messageElement.textContent = message;
                }
                
                resultContainer.style.display = 'block';
                resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            
            // Message si toutes les questions ne sont pas répondues
            if (answeredQuestions < totalQuestions) {
                showNotification(`Vous avez répondu à ${answeredQuestions} question(s) sur ${totalQuestions}`, 'warning');
            }
        });
    });
}

// ============================================
// FORMULAIRE DE CONTACT
// ============================================
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Validation
        if (!name || !email || !message) {
            showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }
        
        // Simuler l'envoi
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Envoi en cours...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            showNotification('Message envoyé avec succès !', 'success');
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
}

// ============================================
// VALIDATION EMAIL
// ============================================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    `;
    
    // Couleurs selon le type
    const colors = {
        success: { bg: '#dcfce7', border: '#22c55e', color: '#166534' },
        error: { bg: '#fee2e2', border: '#ef4444', color: '#991b1b' },
        warning: { bg: '#fef3c7', border: '#f59e0b', color: '#92400e' },
        info: { bg: '#dbeafe', border: '#3b82f6', color: '#1e40af' }
    };
    
    const color = colors[type] || colors.info;
    notification.style.backgroundColor = color.bg;
    notification.style.borderLeft = `4px solid ${color.border}`;
    notification.style.color = color.color;
    
    // Bouton fermer
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: inherit;
        opacity: 0.6;
    `;
    closeBtn.addEventListener('click', () => notification.remove());
    
    document.body.appendChild(notification);
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// COMPTEURS ANIMÉS
// ============================================
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// Initialiser les compteurs
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

// ============================================
// CHARGEMENT LAZY DES IMAGES
// ============================================
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ============================================
// RECHERCHE DE RESSOURCES
// ============================================
function initResourceSearch() {
    const searchInput = document.getElementById('resource-search');
    const resourceCards = document.querySelectorAll('.resource-card');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        resourceCards.forEach(card => {
            const title = card.querySelector('.resource-card-title').textContent.toLowerCase();
            const description = card.querySelector('.resource-card-text').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// ============================================
// MODAL
// ============================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Fermer le modal au clic en dehors
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = '';
    }
});

// ============================================
// DROPDOWN MENU
// ============================================
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            });
            
            // Fermer au clic en dehors
            document.addEventListener('click', function(e) {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }
    });
}

// ============================================
// ACCORDÉON
// ============================================
function initAccordion() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        
        if (header && content) {
            header.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Fermer tous les items
                accordionItems.forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.accordion-content').style.maxHeight = null;
                });
                
                // Ouvrir l'item cliqué s'il n'était pas actif
                if (!isActive) {
                    item.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        }
    });
}

// ============================================
// CAROUSEL SIMPLE
// ============================================
function initCarousel() {
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const dots = carousel.querySelectorAll('.carousel-dot');
        
        let currentSlide = 0;
        
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.style.display = i === index ? 'block' : 'none';
            });
            
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            currentSlide = index;
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const newIndex = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
                showSlide(newIndex);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const newIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
                showSlide(newIndex);
            });
        }
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });
        
        // Auto-play
        setInterval(() => {
            const newIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
            showSlide(newIndex);
        }, 5000);
        
        showSlide(0);
    });
}

// ============================================
// BACK TO TOP
// ============================================
function initBackToTop() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-blue);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        z-index: 999;
    `;
    
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    backToTopBtn.addEventListener('mouseenter', () => {
        backToTopBtn.style.transform = 'translateY(-5px)';
        backToTopBtn.style.background = 'var(--primary-blue-dark)';
    });
    
    backToTopBtn.addEventListener('mouseleave', () => {
        backToTopBtn.style.transform = 'translateY(0)';
        backToTopBtn.style.background = 'var(--primary-blue)';
    });
}

// Initialiser le bouton back-to-top
initBackToTop();

// ============================================
// EFFET DE TYPING
// ============================================
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ============================================
// GESTION DES ERREURS
// ============================================
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.message);
});

// ============================================
// PERFORMANCE: DEBOUNCE
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// PERFORMANCE: THROTTLE
// ============================================
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// SYSTÈME D'AUTHENTIFICATION - CAMPUS UNIVERSITAIRE DE NATITINGOU
// ============================================

// Clé localStorage pour stocker les utilisateurs
const USERS_KEY = 'FAST_USERS';
const CURRENT_USER_KEY = 'currentUser';

// Utilisateur de démonstration (créé automatiquement si aucun utilisateur)
const DEMO_USER = {
    id: 'demo-001',
    nom: 'Étudiant Démo',
    email: 'demo@fast-nati.edu',
    password: 'password',
    etablissement: 'FAST',
    niveau: 'L2',
    specialite: 'informatique',
    dateInscription: new Date().toISOString()
};

// Initialiser les utilisateurs avec le compte démo si vide
function initUsers() {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.length === 0) {
        localStorage.setItem(USERS_KEY, JSON.stringify([DEMO_USER]));
    }
}

// Appeler l'initialisation au chargement
initUsers();

// Fonction d'authentification
function authenticateUser(email, password) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Ne pas retourner le mot de passe
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
}

// Créer un nouveau compte utilisateur
function createUser(userData) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Vérifier si l'email existe déjà
    if (users.some(u => u.email === userData.email)) {
        return { success: false, message: 'Cet email est déjà utilisé.' };
    }
    
    // Créer le nouvel utilisateur
    const newUser = {
        id: 'user-' + Date.now(),
        ...userData,
        dateInscription: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return { success: true, user: newUser };
}

// Vérifier si l'utilisateur est connecté
function isUserLoggedIn() {
    return sessionStorage.getItem(CURRENT_USER_KEY) !== null;
}

// Récupérer l'utilisateur connecté
function getCurrentUser() {
    const user = sessionStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
}

// Sauvegarder l'utilisateur connecté
function setCurrentUser(user) {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

// Déconnexion
function logoutUser() {
    sessionStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem('selectedSpecialite');
    showNotification('Déconnexion réussie', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Protection des routes (à appeler sur les pages protégées)
function requireAuth() {
    if (!isUserLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Récupérer tous les utilisateurs (pour admin)
function getAllUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

// ============================================
// EXPORT DES FONCTIONS
// ============================================
window.FAST = {
    showNotification,
    openModal,
    closeModal,
    animateCounter,
    typeWriter,
    debounce,
    throttle,
    authenticateUser,
    isUserLoggedIn,
    getCurrentUser,
    logoutUser,
    requireAuth
};
