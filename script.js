const LANYARD_URL = 'http://localhost:16385/v1/users/852648614282002502';

async function loadDiscordAvatar() {
  try {
    const res  = await fetch(LANYARD_URL);
    const json = await res.json();
    const { id, avatar } = json.data.discord_user;

    if (!avatar) return;

    const ext      = avatar.startsWith('a_') ? 'gif' : 'png';
    const url      = `https://cdn.discordapp.com/avatars/${id}/${avatar}.${ext}?size=256`;
    const img      = document.getElementById('avatar');
    const fallback = document.getElementById('avatar-fallback');

    img.src = url;
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) favicon.href = url;
    img.style.display = 'block';
    if (fallback) fallback.style.display = 'none';
  } catch {
  }
}

loadDiscordAvatar();

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.classList.add('hidden');
  setTimeout(() => loader.remove(), 600);
});

const html      = document.documentElement;
const toggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeIcon.className = theme === 'dark'
    ? 'fa-solid fa-moon'
    : 'fa-solid fa-sun';
  localStorage.setItem('theme', theme);
}

function copyDiscord(e) {
  e.preventDefault();
  navigator.clipboard.writeText('infinitumcraft').then(() => {
    const toast = document.getElementById('discord-toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  });
}

// Load saved theme
applyTheme(localStorage.getItem('theme') || 'dark');

toggleBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
});

const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// Project filters
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    let visibleCount = 0;

    projectCards.forEach(card => {
      const show = filter === 'all' || card.dataset.type === filter;
      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    document.getElementById('projects-empty').style.display = visibleCount === 0 ? 'flex' : 'none';
  });
});

// Contact form
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');
const formStatus  = document.getElementById('form-status');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    formStatus.textContent = 'Please fill in all fields.';
    formStatus.className = 'show error';
    return;
  }

  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  formStatus.className = '';

  const FORMSPREE_URL = 'https://formspree.io/f/xnjlrzdo';

  try {
    const res = await fetch(FORMSPREE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    if (!res.ok) throw new Error();

    formStatus.textContent = 'Message sent! I\'ll get back to you soon ✨';
    formStatus.className = 'show success';
    contactForm.reset();
  } catch {
    formStatus.textContent = 'Something went wrong. Try again later.';
    formStatus.className = 'show error';
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});

// ── Navbar active link on scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${entry.target.id}`
          ? 'var(--text)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));