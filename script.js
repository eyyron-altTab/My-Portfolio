/**
 * AARON PORTFOLIO — MODERN FRONT-END ENGINE
 * Features:
 * 1. Particle Canvas Simulation (interactive floating dots & constellation lines)
 * 2. Dynamic Skills Loader from localStorage ('portfolioSkills') with robust defaults
 * 3. Animated Progress Bars with glowing trail & IntersectionObserver
 * 4. Butter-smooth Lerp Cursor Glow
 * 5. Parallax & 3D tilt effects
 * 6. Scroll Spy & Section Nav highlight
 * 7. Mobile Navigation & Scroll-to-top
 */

// ─── DEFAULT SKILLS DATA ───
const DEFAULT_SKILLS = [
  { name: 'HTML', icon: 'fab fa-html5', percent: 95 },
  { name: 'CSS', icon: 'fab fa-css3-alt', percent: 90 },
  { name: 'JavaScript', icon: 'fab fa-js', percent: 80 },
  { name: 'React', icon: 'fab fa-react', percent: 70 },
  { name: 'Python', icon: 'fab fa-python', percent: 75 },
  { name: 'Figma', icon: 'fab fa-figma', percent: 85 },
  { name: 'Git', icon: 'fab fa-git-alt', percent: 80 },
  { name: 'MySQL', icon: 'fas fa-database', percent: 65 }
];

document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initSkills();
  initProjects();
  initParticleNetwork();
  initCursorGlow();
  initParallaxAndTilt();
  initScrollReveal();
  initScrollSpy();
  initMobileNav();
  initScrollTop();
  initContactForm();
});

/* ══════════════════════════════════════════════════════════
   DARK MODE TOGGLE
   ══════════════════════════════════════════════════════════ */
function initDarkMode() {
  const toggle = document.getElementById('darkModeToggle');
  const icon = document.getElementById('darkModeIcon');
  if (!toggle || !icon) return;

  // Load saved preference
  const isDark = localStorage.getItem('portfolioDarkMode') === 'true';
  if (isDark) {
    document.body.classList.add('dark-mode');
    icon.classList.replace('fa-moon', 'fa-sun');
  }

  toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const nowDark = document.body.classList.contains('dark-mode');
    
    if (nowDark) {
      icon.classList.replace('fa-moon', 'fa-sun');
    } else {
      icon.classList.replace('fa-sun', 'fa-moon');
    }
    
    localStorage.setItem('portfolioDarkMode', nowDark.toString());
  });
}

/* ══════════════════════════════════════════════════════════
   1. SKILLS RENDERER & OBSERVER
   ══════════════════════════════════════════════════════════ */
function getSkillsData() {
  try {
    const stored = localStorage.getItem('portfolioSkills');
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading portfolioSkills from localStorage, falling back to defaults.', err);
  }
  return DEFAULT_SKILLS;
}

function initSkills() {
  const container = document.getElementById('skillsGrid');
  if (!container) return;

  const skills = getSkillsData();
  container.innerHTML = '';

  if (skills.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-muted, #718096);">
        <i class="fas fa-layer-group" style="font-size: 2.2rem; margin-bottom: 12px; opacity: 0.5; display: block;"></i>
        <p style="font-size: 1.05rem; font-weight: 600; margin-bottom: 6px;">No Skills Configured Yet</p>
        <p style="font-size: 0.88rem;">Add your skills in the <a href="admin.html" style="color: var(--primary-color, #2563eb); text-decoration: underline;">Admin Portal</a>.</p>
      </div>
    `;
    return;
  }

  skills.forEach(skill => {
    const card = document.createElement('div');
    card.className = 'skill-card scroll-reveal';
    card.innerHTML = `
      <div class="skill-top">
        <div class="skill-icon-wrap">
          <i class="${escapeHtml(skill.icon || 'fas fa-code')}"></i>
        </div>
        <span class="skill-percent-badge">${Number(skill.percent) || 0}%</span>
      </div>
      <h4>${escapeHtml(skill.name || 'Skill')}</h4>
      <div class="progress-bar">
        <div class="progress-fill" data-percent="${Number(skill.percent) || 0}"></div>
      </div>
    `;
    container.appendChild(card);
  });

  observeProgressBars();
}

function observeProgressBars() {
  const fills = document.querySelectorAll('.progress-fill');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const targetPercent = fill.getAttribute('data-percent') || '0';
        // Trigger smooth width fill
        setTimeout(() => {
          fill.style.width = targetPercent + '%';
        }, 150);
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.35 });

  fills.forEach(bar => observer.observe(bar));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ══════════════════════════════════════════════════════════
   1B. DYNAMIC PROJECTS RENDERER
   ══════════════════════════════════════════════════════════ */
const DEFAULT_PROJECTS = [
  {
    title: 'E-Commerce Store',
    description: 'A full-featured online shop with dynamic cart management, smooth checkout, and responsive payment integration.',
    tags: 'HTML5, CSS3, JavaScript',
    icon: 'fas fa-shopping-cart',
    bgClass: 'bg-shop',
    tagOverlay: 'Featured Project',
    liveLink: '#contact',
    sourceLink: 'https://github.com',
    image: ''
  },
  {
    title: 'Task Manager App',
    description: 'A streamlined productivity tool to organize, prioritize, and track daily team tasks with real-time updates.',
    tags: 'React, CSS Grid, Firebase',
    icon: 'fas fa-tasks',
    bgClass: 'bg-task',
    tagOverlay: 'Productivity',
    liveLink: '#contact',
    sourceLink: 'https://github.com',
    image: ''
  },
  {
    title: 'Weather Dashboard',
    description: 'Real-time meteorological data with interactive forecast charts, geolocation detection, and atmospheric trends.',
    tags: 'JavaScript, Weather API, CSS3',
    icon: 'fas fa-cloud-sun',
    bgClass: 'bg-weather',
    tagOverlay: 'API / Data',
    liveLink: '#contact',
    sourceLink: 'https://github.com',
    image: ''
  },
  {
    title: 'Photography Portfolio',
    description: 'A sleek, high-resolution media gallery featuring an animated lightbox, lazy-loading performance, and category filtering.',
    tags: 'HTML5, CSS Flexbox, JavaScript',
    icon: 'fas fa-camera-retro',
    bgClass: 'bg-photo',
    tagOverlay: 'Creative Media',
    liveLink: '#contact',
    sourceLink: 'https://github.com',
    image: ''
  }
];

function getProjectsData() {
  try {
    const stored = localStorage.getItem('portfolioProjects');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading portfolioProjects from localStorage, falling back to defaults.', err);
  }
  return DEFAULT_PROJECTS;
}

function initProjects() {
  const container = document.querySelector('.projects-grid');
  if (!container) return;

  const projects = getProjectsData();
  container.innerHTML = '';

  const bgClasses = ['bg-shop', 'bg-task', 'bg-weather', 'bg-photo'];

  projects.forEach((project, index) => {
    const article = document.createElement('article');
    article.className = 'project-card scroll-reveal';

    const bgClass = project.bgClass || bgClasses[index % bgClasses.length];
    const tagsHtml = project.tags.split(',').map(t => `<span>${escapeHtml(t.trim())}</span>`).join('');

    // If project has a custom image, show it; otherwise show icon with gradient bg
    const hasImage = project.image && project.image.length > 0;
    const imgWrapperContent = hasImage
      ? `<img src="${project.image}" alt="${escapeHtml(project.title)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />
         <div class="project-tag-overlay">${escapeHtml(project.tagOverlay)}</div>`
      : `<div class="project-img-bg ${escapeHtml(bgClass)}"></div>
         <div class="project-img-icon">
           <i class="${escapeHtml(project.icon)}"></i>
         </div>
         <div class="project-tag-overlay">${escapeHtml(project.tagOverlay)}</div>`;

    article.innerHTML = `
      <div class="project-img-wrapper">
        ${imgWrapperContent}
      </div>
      <div class="project-body">
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.description)}</p>
        <div class="project-tags">
          ${tagsHtml}
        </div>
        <div class="project-btns">
          <a href="${escapeHtml(project.liveLink)}" class="btn btn-primary btn-sm">
            <i class="fas fa-external-link-alt"></i> Live Demo
          </a>
          <a href="${escapeHtml(project.sourceLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
            <i class="fab fa-github"></i> Source
          </a>
        </div>
      </div>
    `;

    container.appendChild(article);
  });
}

/* ══════════════════════════════════════════════════════════
   2. HERO PARTICLE SIMULATION (Canvas)
   ══════════════════════════════════════════════════════════ */
function initParticleNetwork() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.parentElement.offsetWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight);

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 14000), 75);
  const maxDistance = 120;

  const mouse = {
    x: null,
    y: null,
    radius: 120
  };

  window.addEventListener('resize', () => {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  });

  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const colors = [
    'rgba(37, 99, 235, 0.7)',   // Blue
    'rgba(124, 58, 237, 0.7)',  // Violet
    'rgba(6, 182, 212, 0.7)',   // Cyan
    'rgba(255, 255, 255, 0.6)'  // White
  ];

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.9;
      this.vy = (Math.random() - 0.5) * 0.9;
      this.radius = Math.random() * 2.2 + 1.2;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.baseAlpha = Math.random() * 0.5 + 0.3;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse repulsion/interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 3;
          this.y -= Math.sin(angle) * force * 3;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Connect particles
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.hypot(dx, dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.22;
          ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }

    // Update & draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(render);
  }

  render();
}

/* ══════════════════════════════════════════════════════════
   3. CURSOR GLOW EFFECT (Smooth Lerp)
   ══════════════════════════════════════════════════════════ */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      glow.style.opacity = '1';
      isMoving = true;
    }
  });

  window.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
    isMoving = false;
  });

  function animateCursor() {
    // Linear interpolation for silky smoothness
    currentX += (mouseX - currentX) * 0.14;
    currentY += (mouseY - currentY) * 0.14;

    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

/* ══════════════════════════════════════════════════════════
   4. PARALLAX & HERO 3D TILT
   ══════════════════════════════════════════════════════════ */
function initParallaxAndTilt() {
  const heroAvatar = document.querySelector('.hero-avatar');
  const heroWrapper = document.querySelector('.hero-wrapper');

  if (heroAvatar && heroWrapper) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          if (scrollY < 1200) {
            const moveY = scrollY * 0.28;
            heroAvatar.style.transform = `translate3d(0, ${moveY}px, 0)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Subtle 3D mouse tilt on hero cards
    const cards = document.querySelectorAll('.hero-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        card.style.transform = `perspective(800px) rotateY(${x * 0.03}deg) rotateX(${-y * 0.03}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)';
      });
    });
  }
}

/* ══════════════════════════════════════════════════════════
   5. SCROLL REVEAL (IntersectionObserver Stagger)
   ══════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.scroll-reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const parent = el.parentElement;
        if (parent) {
          const siblings = Array.from(parent.querySelectorAll('.scroll-reveal'));
          const index = siblings.indexOf(el);
          setTimeout(() => {
            el.classList.add('revealed');
          }, Math.min(index * 90, 400));
        } else {
          el.classList.add('revealed');
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════════════════════
   6. SCROLL SPY & SECTION NAV
   ══════════════════════════════════════════════════════════ */
function initScrollSpy() {
  const nav = document.getElementById('sectionNav');
  const navItems = document.querySelectorAll('.section-nav-item');
  const sections = ['about', 'skills', 'projects'];

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;

    // Add shadow when sticky
    if (nav) {
      nav.classList.toggle('scrolled-shadow', scrollPos > 400);
    }

    const triggerPoint = scrollPos + 220;

    sections.forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;

      const top = section.offsetTop;
      const height = section.offsetHeight;
      const item = document.querySelector(`.section-nav-item[data-section="${id}"]`);

      if (item) {
        if (triggerPoint >= top && triggerPoint < top + height) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      }
    });
  }, { passive: true });
}

/* ══════════════════════════════════════════════════════════
   7. MOBILE NAVIGATION
   ══════════════════════════════════════════════════════════ */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
  });

  // Close on nav link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
    }
  });
}

/* ══════════════════════════════════════════════════════════
   8. SCROLL-TO-TOP BUTTON
   ══════════════════════════════════════════════════════════ */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 480);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ══════════════════════════════════════════════════════════
   9. CONTACT FORM INTERACTION
   ══════════════════════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  const submitBtn = document.getElementById('contactSubmitBtn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }

    setTimeout(() => {
      form.reset();
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      }
      if (status) {
        status.className = 'form-status success';
        status.textContent = 'Thank you! Your message has been sent successfully.';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }
        if (status) {
          status.textContent = '';
        }
      }, 4000);
    }, 900);
  });
}
