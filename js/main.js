/**
 * CARLOS GUERRERO (CHW1534) - PORTFOLIO INTERACTIVITY & FLUID ANIMATIONS
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initThemeToggle();
  initProjectFilters();
  initGitHubApi();
  initScrollReveal();
});

/* ==========================================================================
   NAVBAR & SMOOTH SCROLL TRACKING
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');

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
        if (mobileBtn) mobileBtn.innerHTML = '<i class="ri-menu-line"></i>';
      });
    });
  }

  // Smooth scroll offset adjustment for fixed navbar
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          const navHeight = 70;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Active section observer (Spanish Section IDs)
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = 'yo';
    const scrollPosition = window.scrollY + 180;

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
   PROJECT FILTERS WITH FADE ANIMATION
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
          card.classList.add('is-visible');
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
    const userRes = await fetch('https://api.github.com/users/CHW1534');
    if (userRes.ok) {
      const userData = await userRes.json();
      if (publicReposCount) {
        publicReposCount.textContent = userData.public_repos || '15';
      }
    }

    const reposRes = await fetch('https://api.github.com/users/CHW1534/repos?sort=updated&per_page=6');
    if (!reposRes.ok) throw new Error('Could not fetch GitHub repos');

    const repos = await reposRes.json();
    repoContainer.innerHTML = '';

    repos.forEach(repo => {
      if (repo.name === 'CHW1534' || repo.name === 'LACPCR.github.io') return;

      const card = document.createElement('div');
      card.className = 'card github-repo-card reveal-on-scroll is-visible';

      const updatedDate = new Date(repo.updated_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      card.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <i class="ri-git-repository-line" style="color: var(--accent-emerald); font-size: 1.3rem;"></i>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="btn-icon btn-sm" title="Ver en GitHub">
              <i class="ri-external-link-line"></i>
            </a>
          </div>
          <h3 class="project-title">${repo.name}</h3>
          <p class="project-desc">${repo.description || 'Proyecto disponible en el perfil de GitHub de Carlos Guerrero.'}</p>
        </div>
        <div class="github-meta">
          ${repo.language ? `<span><i class="ri-code-s-slash-line"></i> ${repo.language}</span>` : ''}
          <span><i class="ri-star-line"></i> ${repo.stargazers_count}</span>
          <span><i class="ri-time-line"></i> ${updatedDate}</span>
        </div>
      `;

      repoContainer.appendChild(card);
    });
  } catch (error) {
    console.warn('GitHub API fallback', error);
  }
}

/* ==========================================================================
   SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const observerOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
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
    background: var(--accent-emerald);
    color: #fff;
    padding: 0.65rem 1.25rem;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    box-shadow: var(--shadow-card);
    z-index: 9999;
    animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
