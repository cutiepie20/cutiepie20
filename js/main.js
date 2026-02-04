/**
 * Portfolio Website - Main JavaScript
 * Renders content from JSON data files and handles all interactions
 */

// ============================================
// DATA LOADING
// ============================================

async function loadJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${path}:`, error);
        return null;
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Load all data
    const [profile, skills, experience, projects, achievements] = await Promise.all([
        loadJSON('./data/profile.json'),
        loadJSON('./data/skills.json'),
        loadJSON('./data/experience.json'),
        loadJSON('./data/projects.json'),
        loadJSON('./data/achievements.json')
    ]);

    // Render sections
    if (profile) renderProfile(profile);
    if (skills) renderSkills(skills);
    if (experience) renderExperience(experience);
    if (projects) renderProjects(projects);
    if (achievements) renderAchievements(achievements);

    // Initialize interactions
    initNavigation();
    initScrollEffects();
    initModal();
    initFilters(projects);

    // Set current year
    document.getElementById('current-year').textContent = new Date().getFullYear();
});

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderProfile(data) {
    // Hero section
    document.getElementById('hero-name').textContent = data.name;
    document.getElementById('hero-tagline').textContent = data.tagline;

    // Roles
    const rolesContainer = document.getElementById('hero-roles');
    rolesContainer.innerHTML = data.roles.map((role, index) => `
        <span class="role-tag">${role}</span>
        ${index < data.roles.length - 1 ? '<span class="role-separator">•</span>' : ''}
    `).join('');

    // Avatar
    const avatar = document.getElementById('hero-avatar');
    avatar.src = data.avatar;
    avatar.alt = data.name;

    // About section
    document.getElementById('about-summary').textContent = data.about.summary;
    document.getElementById('about-description').textContent = data.about.description;
    document.getElementById('about-cta').textContent = data.about.cta;

    // Stats
    const statsContainer = document.getElementById('about-stats');
    statsContainer.innerHTML = data.stats.map(stat => `
        <div class="stat-card reveal">
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');

    // CV download button
    const cvBtn = document.getElementById('nav-cv-btn');
    cvBtn.href = data.cv;
    cvBtn.download = 'CV_Atilla_Pramudya_Nugroho.pdf';

    // Contact buttons
    renderContactButtons(data.social, data.cv);

    // Footer social links
    renderFooterSocial(data.social);
}

function renderContactButtons(social, cvPath) {
    const container = document.getElementById('contact-buttons');

    const buttons = [];

    if (social.email) {
        buttons.push(`
            <a href="mailto:${social.email}?subject=Portfolio Inquiry" class="contact-btn email">
                <i class="fas fa-envelope"></i>
                <span>Email Me</span>
            </a>
        `);
    }

    if (social.whatsapp) {
        const message = encodeURIComponent("Hi Atilla, I saw your portfolio and I'd like to connect!");
        buttons.push(`
            <a href="https://wa.me/${social.whatsapp}?text=${message}" target="_blank" class="contact-btn whatsapp">
                <i class="fab fa-whatsapp"></i>
                <span>WhatsApp</span>
            </a>
        `);
    }

    if (social.linkedin) {
        buttons.push(`
            <a href="${social.linkedin}" target="_blank" class="contact-btn linkedin">
                <i class="fab fa-linkedin-in"></i>
                <span>LinkedIn</span>
            </a>
        `);
    }

    if (social.github) {
        buttons.push(`
            <a href="${social.github}" target="_blank" class="contact-btn github">
                <i class="fab fa-github"></i>
                <span>GitHub</span>
            </a>
        `);
    }

    container.innerHTML = buttons.join('');
}

function renderFooterSocial(social) {
    const container = document.getElementById('footer-social');

    const links = [];

    if (social.email) {
        links.push(`<a href="mailto:${social.email}" aria-label="Email"><i class="fas fa-envelope"></i></a>`);
    }
    if (social.linkedin) {
        links.push(`<a href="${social.linkedin}" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>`);
    }
    if (social.github) {
        links.push(`<a href="${social.github}" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>`);
    }
    if (social.instagram) {
        links.push(`<a href="${social.instagram}" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>`);
    }

    container.innerHTML = links.join('');
}

function renderSkills(data) {
    const container = document.getElementById('skills-grid');

    container.innerHTML = data.categories.map(category => `
        <div class="skill-category reveal">
            <div class="skill-category-header">
                <div class="skill-category-icon">
                    <i class="fas fa-${category.icon}"></i>
                </div>
                <h3 class="skill-category-name">${category.name}</h3>
            </div>
            <div class="skill-list">
                ${category.skills.map(skill => `
                    <div class="skill-item">
                        <div class="skill-info">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-level">${skill.level}%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" data-progress="${skill.level}" style="width: 0%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function renderExperience(data) {
    const container = document.getElementById('experience-timeline');

    container.innerHTML = data.experiences.map(exp => `
        <div class="timeline-item reveal">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <span class="timeline-period">${exp.period}</span>
                <h3 class="timeline-role">${exp.role}</h3>
                <p class="timeline-company">${exp.company}</p>
                <p class="timeline-description">${exp.description}</p>
                <ul class="timeline-highlights">
                    ${exp.highlights.map(h => `<li class="timeline-highlight">${h}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

function renderProjects(data) {
    const container = document.getElementById('projects-grid');
    const filterContainer = document.getElementById('projects-filter');

    // Get unique categories
    const categories = [...new Set(data.projects.map(p => p.category))];

    // Render filter buttons
    filterContainer.innerHTML = `
        <button class="filter-btn active" data-filter="all">All</button>
        ${categories.map(cat => `
            <button class="filter-btn" data-filter="${cat}">${cat}</button>
        `).join('')}
    `;

    // Render project cards
    container.innerHTML = data.projects.map(project => `
        <div class="project-card reveal" data-category="${project.category}" data-id="${project.id}">
            <div class="project-image">
                <img src="${project.thumbnail}" alt="${project.title}" onerror="this.src='https://via.placeholder.com/400x200/1E3A5F/00D4FF?text=${encodeURIComponent(project.title)}'">
                <div class="project-overlay">
                    <span class="project-view-btn">View Details</span>
                </div>
            </div>
            <div class="project-info">
                <span class="project-category">${project.category}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.shortDescription}</p>
                <div class="project-tech">
                    ${project.techStack.slice(0, 4).map(tech => `
                        <span class="tech-tag">${tech}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function renderAchievements(data) {
    const container = document.getElementById('achievements-grid');

    const allItems = [...data.achievements, ...data.certifications];

    if (allItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Achievements coming soon...</p>';
        return;
    }

    container.innerHTML = allItems.map(item => `
        <div class="achievement-card reveal">
            <div class="achievement-icon">
                <i class="fas fa-${item.icon || 'trophy'}"></i>
            </div>
            <div class="achievement-content">
                <h3 class="achievement-title">${item.title}</h3>
                <p class="achievement-org">${item.organization}</p>
                <p class="achievement-description">${item.description}</p>
                <span class="achievement-year">${item.year}</span>
            </div>
        </div>
    `).join('');
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Scroll spy for active nav links
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        const scrollY = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Navbar background on scroll
    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', () => {
        updateActiveNav();
        updateNavbar();
    });
}

// ============================================
// SCROLL EFFECTS
// ============================================

function initScrollEffects() {
    const backToTop = document.getElementById('back-to-top');

    // Back to top visibility
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    // Reveal animations with Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate skill bars when visible
                const skillBars = entry.target.querySelectorAll('.skill-progress');
                skillBars.forEach(bar => {
                    const progress = bar.dataset.progress;
                    setTimeout(() => {
                        bar.style.width = `${progress}%`;
                    }, 200);
                });
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Re-observe after dynamic content loads
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => {
            if (!el.classList.contains('visible')) {
                revealObserver.observe(el);
            }
        });
    }, 500);
}

// ============================================
// PROJECT FILTERS
// ============================================

function initFilters(projectsData) {
    const filterContainer = document.getElementById('projects-filter');

    filterContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            // Update active button
            filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');

            // Filter projects
            const filter = e.target.dataset.filter;
            const projectCards = document.querySelectorAll('.project-card');

            projectCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        }
    });
}

// ============================================
// PROJECT MODAL
// ============================================

let projectsData = null;

function initModal() {
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = modal.querySelector('.modal-overlay');
    const projectsGrid = document.getElementById('projects-grid');

    // Load projects data for modal
    loadJSON('./data/projects.json').then(data => {
        projectsData = data;
    });

    // Open modal on project card click
    projectsGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.project-card');
        if (card && projectsData) {
            const projectId = card.dataset.id;
            const project = projectsData.projects.find(p => p.id === projectId);
            if (project) {
                openModal(project);
            }
        }
    });

    // Close modal
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function openModal(project) {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <img src="${project.images[0] || project.thumbnail}" alt="${project.title}" class="modal-image" onerror="this.src='https://via.placeholder.com/800x300/1E3A5F/00D4FF?text=${encodeURIComponent(project.title)}'">
        <div class="modal-info">
            <span class="modal-category">${project.category} • ${project.year}</span>
            <h2 class="modal-title">${project.title}</h2>
            <p class="modal-description">${project.description}</p>
            
            <div class="modal-highlights">
                <h4>Key Highlights</h4>
                <ul>
                    ${project.highlights.map(h => `<li>${h}</li>`).join('')}
                </ul>
            </div>
            
            <div class="modal-tech">
                <h4>Tech Stack</h4>
                <div class="modal-tech-list">
                    ${project.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
            </div>
            
            ${Object.values(project.links).some(link => link) ? `
                <div class="modal-links">
                    ${project.links.github ? `
                        <a href="${project.links.github}" target="_blank" class="modal-link">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                    ` : ''}
                    ${project.links.demo ? `
                        <a href="${project.links.demo}" target="_blank" class="modal-link">
                            <i class="fas fa-external-link-alt"></i> Live Demo
                        </a>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// SMOOTH SCROLL POLYFILL (for older browsers)
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
