/**
 * CARLOS GUERRERO (CHW1534) - PORTFOLIO INTERACTIVITY & GITHUB INTEGRATION
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initThemeToggle();
  initProjectFilters();
  initGitHubApi();
  initScrollAnimations();
});

/* ==========================================================================
   NAVBAR & MOBILE MENU
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');

  // Shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
      navbar.style.background = 'rgba(15, 23, 42, 0.9)';
    } else {
      navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
      navbar.style.background = 'rgba(15, 23, 42, 0.75)';
    }
  });

  // Mobile menu toggle
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
      const isOpen = navLinks.classList.contains('mobile-open');
      mobileBtn.innerHTML = isOpen ? '<i class="ri-close-line"></i>' : '<i class="ri-menu-line"></i>';
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        mobileBtn.innerHTML = '<i class="ri-menu-line"></i>';
      });
    });
  }

  // Active section observer
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   THEME TOGGLE (DARK / LIGHT)
   ========================================================================== */
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  const currentTheme = localStorage.getItem('theme') || 'dark';

  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(themeBtn, currentTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateThemeIcon(themeBtn, theme);
    });
  }
}

function updateThemeIcon(btn, theme) {
  if (!btn) return;
  btn.innerHTML = theme === 'dark' ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-line"></i>';
  btn.setAttribute('title', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
}

/* ==========================================================================
   PROJECT FILTERS
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const tags = card.getAttribute('data-tags') || '';
        if (category === 'all' || tags.includes(category)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   DYNAMIC GITHUB API INTEGRATION
   ========================================================================== */
async function initGitHubApi() {
  const repoContainer = document.getElementById('github-repos-container');
  const publicReposCount = document.getElementById('stat-public-repos');

  if (!repoContainer) return;

  try {
    // 1. Fetch User Data
    const userRes = await fetch('https://api.github.com/users/CHW1534');
    if (userRes.ok) {
      const userData = await userRes.json();
      if (publicReposCount) {
        publicReposCount.textContent = userData.public_repos || '15';
      }
    }

    // 2. Fetch User Repositories
    const reposRes = await fetch('https://api.github.com/users/CHW1534/repos?sort=updated&per_page=6');
    if (!reposRes.ok) throw new Error('Could not fetch GitHub repos');

    const repos = await reposRes.json();
    repoContainer.innerHTML = ''; // Clear skeleton loader

    repos.forEach(repo => {
      if (repo.name === 'CHW1534' || repo.name === 'LACPCR.github.io') return;

      const card = document.createElement('div');
      card.className = 'card github-repo-card';

      const langColor = getLangColor(repo.language);
      const updatedDate = new Date(repo.updated_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      card.innerHTML = `
        <div class="project-top">
          <div class="project-header">
            <i class="ri-git-repository-line project-folder-icon"></i>
            <div class="project-links">
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="btn-icon btn-sm" title="Ver en GitHub">
                <i class="ri-github-line"></i>
              </a>
            </div>
          </div>
          <h3 class="project-title">${repo.name}</h3>
          <p class="project-desc">${repo.description || 'Proyecto disponible en el perfil de GitHub de Carlos Guerrero.'}</p>
        </div>
        <div class="github-repo-meta">
          ${repo.language ? `
            <span class="lang-indicator">
              <span class="lang-dot" style="background-color: ${langColor};"></span>
              ${repo.language}
            </span>
          ` : ''}
          <span><i class="ri-star-line"></i> ${repo.stargazers_count}</span>
          <span><i class="ri-time-line"></i> ${updatedDate}</span>
        </div>
      `;

      repoContainer.appendChild(card);
    });
  } catch (error) {
    console.warn('GitHub API rate limited or offline, showing fallback structure', error);
  }
}

function getLangColor(lang) {
  const colors = {
    'Python': '#3572A5',
    'TypeScript': '#3178c6',
    'JavaScript': '#f1e05a',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Lua': '#000080',
    'C#': '#178600',
    'Ruby': '#701516'
  };
  return colors[lang] || '#06b6d4';
}

/* ==========================================================================
   HELPERS & ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.card, .timeline-item, .section-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// Global helper: Print CV
function printCV() {
  window.print();
}

// Global helper: Copy Contact Email
function copyEmail() {
  const email = 'carlosguerrerodiaz15@gmail.com';
  navigator.clipboard.writeText(email).then(() => {
    showToast('¡Correo copiado al portapapeles!');
  }).catch(() => {
    showToast('Correo: carlosguerrerodiaz15@gmail.com');
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerText = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #06b6d4;
    color: #fff;
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    font-weight: 600;
    box-shadow: 0 10px 25px rgba(6, 182, 212, 0.4);
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
