/**
 * AARON PORTFOLIO — ADMIN MANAGEMENT ENGINE
 * Handles:
 * 1. Hardcoded Password Authentication ('admin123') with Session Persistence
 * 2. Real-Time Skill Percentage Editing via Sliders & Steppers
 * 3. Instant Visual Progress Bar Previews
 * 4. LocalStorage Synchronization with 'portfolioSkills'
 * 5. Animated Toast Notification System
 * 6. Dynamic Metrics Calculation (Total, Average, Top Skill)
 */

const HARDCODED_PASSWORD = 'admin123';
const STORAGE_KEY = 'portfolioSkills';
const SESSION_KEY = 'portfolioAdminSession';

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

// Current working state of skills in dashboard
let currentSkills = [];
let hasUnsavedChanges = false;

const PROJECTS_STORAGE_KEY = 'portfolioProjects';

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

let currentProjects = [];
let hasUnsavedProjectChanges = false;

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initPasswordToggle();
  initDashboardEvents();
});

/* ══════════════════════════════════════════════════════════
   1. AUTHENTICATION CONTROLLER
   ══════════════════════════════════════════════════════════ */
function initAuth() {
  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');
  const loginForm = document.getElementById('loginForm');
  const passwordInput = document.getElementById('adminPassword');
  const errorMsg = document.getElementById('loginErrorMsg');
  const logoutBtn = document.getElementById('logoutBtn');

  // Check if session exists
  const isAuthenticated = sessionStorage.getItem(SESSION_KEY) === 'active';
  if (isAuthenticated) {
    showDashboard();
  } else {
    showLogin();
  }

  // Handle Login Submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const enteredPassword = passwordInput.value.trim();

    if (enteredPassword === HARDCODED_PASSWORD) {
      errorMsg.textContent = '';
      sessionStorage.setItem(SESSION_KEY, 'active');
      passwordInput.value = '';
      showDashboard();
      showToast('Welcome Back, Aaron!', 'Access granted to Admin Panel.', 'success');
    } else {
      errorMsg.textContent = 'Invalid credentials. Please try again.';
      const card = document.querySelector('.login-glass-card');
      if (card) {
        card.classList.remove('shake-card');
        void card.offsetWidth; // Trigger reflow
        card.classList.add('shake-card');
      }
      passwordInput.select();
    }
  });

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(SESSION_KEY);
      showLogin();
      showToast('Logged Out', 'You have been securely signed out.', 'info');
    });
  }

  function showDashboard() {
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    loadSkills();
  }

  function showLogin() {
    dashboardView.classList.add('hidden');
    loginView.classList.remove('hidden');
    if (passwordInput) passwordInput.focus();
  }
}

function initPasswordToggle() {
  const toggleBtn = document.getElementById('togglePasswordBtn');
  const passwordInput = document.getElementById('adminPassword');
  const icon = document.getElementById('togglePasswordIcon');

  if (toggleBtn && passwordInput && icon) {
    toggleBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });
  }
}

/* ══════════════════════════════════════════════════════════
   2. DATA LOADER & EDITOR
   ══════════════════════════════════════════════════════════ */
function loadSkills() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with defaults to ensure icons/names stay preserved
        currentSkills = DEFAULT_SKILLS.map(def => {
          const found = parsed.find(p => p.name.toLowerCase() === def.name.toLowerCase());
          return {
            name: def.name,
            icon: def.icon,
            percent: found ? Math.min(100, Math.max(0, Number(found.percent) || 0)) : def.percent
          };
        });
      } else {
        currentSkills = JSON.parse(JSON.stringify(DEFAULT_SKILLS));
      }
    } else {
      currentSkills = JSON.parse(JSON.stringify(DEFAULT_SKILLS));
    }
  } catch (err) {
    console.error('Failed reading skills from storage, using defaults:', err);
    currentSkills = JSON.parse(JSON.stringify(DEFAULT_SKILLS));
  }

  hasUnsavedChanges = false;
  updateUnsavedIndicator();
  renderSkillsEditor();
  updateMetrics();
  loadProjects();
}

function renderSkillsEditor() {
  const grid = document.getElementById('skillsEditorGrid');
  if (!grid) return;

  grid.innerHTML = '';

  currentSkills.forEach((skill, index) => {
    const card = document.createElement('div');
    card.className = 'skill-edit-card';
    card.dataset.index = index;

    card.innerHTML = `
      <div class="skill-edit-card-top">
        <div class="skill-meta">
          <div class="skill-meta-icon"><i class="${escapeHtml(skill.icon)}"></i></div>
          <span class="skill-meta-title">${escapeHtml(skill.name)}</span>
        </div>
        <span class="skill-value-badge" id="valBadge-${index}">${skill.percent}%</span>
      </div>

      <div class="slider-container">
        <div class="slider-controls-row">
          <button type="button" class="step-btn" data-action="decrement" data-index="${index}" title="Decrease by 5%">-5</button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value="${skill.percent}" 
            class="skill-range-slider" 
            id="slider-${index}" 
            data-index="${index}"
          />
          <button type="button" class="step-btn" data-action="increment" data-index="${index}" title="Increase by 5%">+5</button>
        </div>
      </div>

      <div class="preview-bar-wrapper">
        <div class="preview-bar-label">
          <span>Live Visual Preview</span>
          <span id="previewPercentText-${index}">${skill.percent}%</span>
        </div>
        <div class="preview-track">
          <div class="preview-fill" id="previewFill-${index}" style="width: ${skill.percent}%;"></div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  attachSliderListeners();
}

function attachSliderListeners() {
  const sliders = document.querySelectorAll('.skill-range-slider');
  sliders.forEach(slider => {
    slider.addEventListener('input', (e) => {
      const idx = Number(e.target.dataset.index);
      const val = Number(e.target.value);
      updateSkillValue(idx, val);
    });
  });

  const stepBtns = document.querySelectorAll('.step-btn');
  stepBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = Number(btn.dataset.index);
      const action = btn.dataset.action;
      const current = currentSkills[idx].percent;
      const delta = action === 'increment' ? 5 : -5;
      const nextVal = Math.min(100, Math.max(0, current + delta));
      
      const slider = document.getElementById(`slider-${idx}`);
      if (slider) slider.value = nextVal;
      updateSkillValue(idx, nextVal);
    });
  });
}

function updateSkillValue(index, val) {
  currentSkills[index].percent = val;

  // Real-time badge update
  const badge = document.getElementById(`valBadge-${index}`);
  if (badge) badge.textContent = `${val}%`;

  // Real-time text preview
  const previewText = document.getElementById(`previewPercentText-${index}`);
  if (previewText) previewText.textContent = `${val}%`;

  // Real-time preview bar fill
  const previewFill = document.getElementById(`previewFill-${index}`);
  if (previewFill) previewFill.style.width = `${val}%`;

  // Mark unsaved
  hasUnsavedChanges = true;
  updateUnsavedIndicator();
  updateMetrics();
}

function updateMetrics() {
  const totalEl = document.getElementById('metricTotalSkills');
  const avgEl = document.getElementById('metricAvgProficiency');
  const topEl = document.getElementById('metricTopSkill');

  if (currentSkills.length === 0) return;

  if (totalEl) totalEl.textContent = currentSkills.length;

  const sum = currentSkills.reduce((acc, s) => acc + Number(s.percent), 0);
  const avg = Math.round(sum / currentSkills.length);
  if (avgEl) avgEl.textContent = `${avg}%`;

  let topSkill = currentSkills[0];
  currentSkills.forEach(s => {
    if (Number(s.percent) > Number(topSkill.percent)) {
      topSkill = s;
    }
  });
  if (topEl) topEl.textContent = `${topSkill.name} (${topSkill.percent}%)`;

  const projectsEl = document.getElementById('metricTotalProjects');
  if (projectsEl) projectsEl.textContent = currentProjects.length;
}

function updateUnsavedIndicator() {
  const indicator = document.getElementById('unsavedIndicator');
  if (indicator) {
    if (hasUnsavedChanges) {
      indicator.classList.remove('hidden');
    } else {
      indicator.classList.add('hidden');
    }
  }
}

/* ══════════════════════════════════════════════════════════
   3. SAVE & RESET CONTROLLER
   ══════════════════════════════════════════════════════════ */
function initDashboardEvents() {
  const saveBtn = document.getElementById('saveSkillsBtn');
  const stickySaveBtn = document.getElementById('stickySaveBtn');
  const resetBtn = document.getElementById('resetDefaultsBtn');

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSkills));
      hasUnsavedChanges = false;
      updateUnsavedIndicator();
      showToast('Changes Saved!', 'Skill percentages updated successfully and synced to your live portfolio.', 'success');
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
      showToast('Save Error', 'Unable to persist changes to browser storage.', 'error');
    }
  };

  if (saveBtn) saveBtn.addEventListener('click', handleSave);
  if (stickySaveBtn) stickySaveBtn.addEventListener('click', handleSave);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all skills back to their default percentages?')) {
        currentSkills = JSON.parse(JSON.stringify(DEFAULT_SKILLS));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSkills));
        hasUnsavedChanges = false;
        updateUnsavedIndicator();
        renderSkillsEditor();
        updateMetrics();
        showToast('Reset Complete', 'All skills have been restored to their default baseline.', 'info');
      }
    });
  }

  // Project save/reset/add handlers
  const saveProjectsBtn = document.getElementById('saveProjectsBtn');
  const resetProjectsBtn = document.getElementById('resetProjectsBtn');
  const addProjectBtn = document.getElementById('addProjectBtn');

  if (saveProjectsBtn) {
    saveProjectsBtn.addEventListener('click', () => {
      try {
        syncProjectFieldsToState();
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(currentProjects));
        hasUnsavedProjectChanges = false;
        updateProjectUnsavedIndicator();
        showToast('Projects Saved!', 'Featured projects updated and synced to your live portfolio.', 'success');
      } catch (err) {
        console.error('Failed to save projects:', err);
        showToast('Save Error', 'Unable to persist project changes.', 'error');
      }
    });
  }

  if (resetProjectsBtn) {
    resetProjectsBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all projects to their defaults?')) {
        currentProjects = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(currentProjects));
        hasUnsavedProjectChanges = false;
        updateProjectUnsavedIndicator();
        renderProjectsEditor();
        updateMetrics();
        showToast('Projects Reset', 'All projects have been restored to defaults.', 'info');
      }
    });
  }

  // Add New Project (CREATE)
  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
      syncProjectFieldsToState();
      const bgOptions = ['bg-shop', 'bg-task', 'bg-weather', 'bg-photo'];
      const newProject = {
        title: 'New Project',
        description: 'Describe your new project here...',
        tags: 'HTML5, CSS3, JavaScript',
        icon: 'fas fa-code',
        bgClass: bgOptions[currentProjects.length % bgOptions.length],
        tagOverlay: 'New',
        liveLink: '#',
        sourceLink: 'https://github.com',
        image: ''
      };
      currentProjects.push(newProject);
      hasUnsavedProjectChanges = true;
      updateProjectUnsavedIndicator();
      renderProjectsEditor();
      updateMetrics();
      showToast('Project Added', 'A new project card has been created. Fill in the details and save.', 'success');

      // Scroll to the new card
      setTimeout(() => {
        const grid = document.getElementById('projectsEditorGrid');
        const lastCard = grid ? grid.lastElementChild : null;
        if (lastCard) lastCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    });
  }

  // Warn if leaving with unsaved changes
  window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges || hasUnsavedProjectChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

/* ══════════════════════════════════════════════════════════
   3B. PROJECTS EDITOR
   ══════════════════════════════════════════════════════════ */
function loadProjects() {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentProjects = parsed;
      } else {
        currentProjects = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
      }
    } else {
      currentProjects = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
    }
  } catch (err) {
    console.error('Failed reading projects from storage:', err);
    currentProjects = JSON.parse(JSON.stringify(DEFAULT_PROJECTS));
  }

  hasUnsavedProjectChanges = false;
  updateProjectUnsavedIndicator();
  renderProjectsEditor();
}

function renderProjectsEditor() {
  const grid = document.getElementById('projectsEditorGrid');
  if (!grid) return;

  grid.innerHTML = '';

  currentProjects.forEach((project, index) => {
    const card = document.createElement('div');
    card.className = 'project-edit-card';
    card.dataset.index = index;

    const hasImage = project.image && project.image.length > 0;
    const imagePreviewHTML = hasImage
      ? `<img src="${project.image}" class="project-image-preview" alt="Project preview" />
         <div class="project-image-actions">
           <button type="button" class="remove-image-btn" data-index="${index}"><i class="fas fa-trash-alt"></i> Remove</button>
         </div>`
      : `<div class="upload-placeholder">
           <i class="fas fa-cloud-upload-alt"></i>
           <span>Click to upload project image</span>
           <small>JPG, PNG, WebP (stored as Base64)</small>
         </div>`;

    card.innerHTML = `
      <div class="project-edit-card-header">
        <div class="project-edit-number">
          <div class="project-num-badge">${index + 1}</div>
          <span class="project-edit-label">${escapeHtml(project.title)}</span>
        </div>
        <div class="project-header-actions">
          <div class="project-icon-preview">
            <i class="${escapeHtml(project.icon)}"></i>
          </div>
          <button type="button" class="delete-project-btn" data-index="${index}" title="Delete this project">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>

      <div class="project-edit-fields">
        <div class="project-field">
          <label>Project Title</label>
          <input type="text" value="${escapeHtml(project.title)}" data-index="${index}" data-field="title" class="project-input" placeholder="Project name..." />
        </div>
        <div class="project-field">
          <label>Icon Class (Font Awesome)</label>
          <input type="text" value="${escapeHtml(project.icon)}" data-index="${index}" data-field="icon" class="project-input" placeholder="e.g. fas fa-shopping-cart" />
        </div>
        <div class="project-field full-width">
          <label>Description</label>
          <textarea data-index="${index}" data-field="description" class="project-input" placeholder="Brief project description...">${escapeHtml(project.description)}</textarea>
        </div>
        <div class="project-field full-width">
          <label>Project Image</label>
          <div class="project-image-upload-area ${hasImage ? 'has-image' : ''}" data-index="${index}">
            ${imagePreviewHTML}
            <input type="file" class="project-image-file-input" data-index="${index}" accept="image/*" />
          </div>
        </div>
        <div class="project-field">
          <label>Tags <span class="project-tag-hint">(comma-separated)</span></label>
          <input type="text" value="${escapeHtml(project.tags)}" data-index="${index}" data-field="tags" class="project-input" placeholder="HTML5, CSS3, JavaScript" />
        </div>
        <div class="project-field">
          <label>Tag Overlay Label</label>
          <input type="text" value="${escapeHtml(project.tagOverlay)}" data-index="${index}" data-field="tagOverlay" class="project-input" placeholder="e.g. Featured Project" />
        </div>
        <div class="project-field">
          <label>Live Demo Link</label>
          <input type="text" value="${escapeHtml(project.liveLink)}" data-index="${index}" data-field="liveLink" class="project-input" placeholder="https://..." />
        </div>
        <div class="project-field">
          <label>Source Code Link</label>
          <input type="text" value="${escapeHtml(project.sourceLink)}" data-index="${index}" data-field="sourceLink" class="project-input" placeholder="https://github.com/..." />
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Attach text input change listeners
  document.querySelectorAll('.project-input').forEach(input => {
    input.addEventListener('input', () => {
      hasUnsavedProjectChanges = true;
      updateProjectUnsavedIndicator();

      const idx = Number(input.dataset.index);
      const field = input.dataset.field;
      if (field === 'title') {
        const label = input.closest('.project-edit-card').querySelector('.project-edit-label');
        if (label) label.textContent = input.value || 'Untitled';
      }
      if (field === 'icon') {
        const preview = input.closest('.project-edit-card').querySelector('.project-icon-preview i');
        if (preview) preview.className = input.value;
      }
    });
  });

  // Attach image upload listeners
  document.querySelectorAll('.project-image-upload-area').forEach(area => {
    const fileInput = area.querySelector('.project-image-file-input');
    const idx = Number(area.dataset.index);

    area.addEventListener('click', (e) => {
      if (e.target.closest('.remove-image-btn') || e.target.closest('.project-image-actions')) return;
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        currentProjects[idx].image = ev.target.result;
        hasUnsavedProjectChanges = true;
        updateProjectUnsavedIndicator();
        renderProjectsEditor();
      };
      reader.readAsDataURL(file);
    });
  });

  // Attach remove image button listeners
  document.querySelectorAll('.remove-image-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.index);
      currentProjects[idx].image = '';
      hasUnsavedProjectChanges = true;
      updateProjectUnsavedIndicator();
      renderProjectsEditor();
    });
  });

  // Attach delete project button listeners (DELETE)
  document.querySelectorAll('.delete-project-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = Number(btn.dataset.index);
      const projectName = currentProjects[idx] ? currentProjects[idx].title : 'this project';
      if (confirm(`Are you sure you want to delete "${projectName}"? This cannot be undone until you save.`)) {
        currentProjects.splice(idx, 1);
        hasUnsavedProjectChanges = true;
        updateProjectUnsavedIndicator();
        renderProjectsEditor();
        updateMetrics();
        showToast('Project Deleted', `"${projectName}" has been removed. Save to persist.`, 'info');
      }
    });
  });
}

function syncProjectFieldsToState() {
  document.querySelectorAll('.project-input').forEach(input => {
    const idx = Number(input.dataset.index);
    const field = input.dataset.field;
    if (currentProjects[idx]) {
      currentProjects[idx][field] = input.value;
    }
  });
}

function updateProjectUnsavedIndicator() {
  const indicator = document.getElementById('unsavedProjectsIndicator');
  if (indicator) {
    if (hasUnsavedProjectChanges) {
      indicator.classList.remove('hidden');
    } else {
      indicator.classList.add('hidden');
    }
  }
}

/* ══════════════════════════════════════════════════════════
   4. TOAST NOTIFICATION ENGINE
   ══════════════════════════════════════════════════════════ */
function showToast(title, message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconClass = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle');

  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas ${iconClass}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-dismiss" aria-label="Close notification">
      <i class="fas fa-times"></i>
    </button>
    <div class="toast-progress"></div>
  `;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  const dismiss = () => {
    toast.classList.remove('toast-show');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 350);
  };

  toast.querySelector('.toast-dismiss').addEventListener('click', dismiss);

  // Auto dismiss after 3.8s
  setTimeout(dismiss, 3800);
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
