const LANYARD_URL = 'https://lanyard-self-production.up.railway.app/v1/users/852648614282002502';
history.scrollRestoration = 'manual';
let currentLang = localStorage.getItem('lang') || 'en';

const LANG_STATUS = {
  en: {
    online:  '● Online',
    idle:    '● Idle',
    dnd:     '● Do Not Disturb',
    offline: '● Offline',
  },
  fr: {
    online:  '● En ligne',
    idle:    '● Inactif',
    dnd:     '● Ne pas déranger',
    offline: '● Hors ligne',
  }
};

const LANG_FORM_MESSAGES = {
  en: {
    success: "Message sent! I'll get back to you soon ✨",
    error: 'Something went wrong. Try again later.',
    empty: 'Please fill in all fields.',
  },
  fr: {
    success: 'Message envoyé ! Je te répondrai bientôt ✨',
    error: 'Une erreur est survenue. Réessaie plus tard.',
    empty: 'Merci de remplir tous les champs.',
  }
};

const STATUS_CONFIG = {
  online:  { label: '● Online',         class: 'status-online' },
  idle:    { label: '● Idle',           class: 'status-idle' },
  dnd:     { label: '● Do Not Disturb', class: 'status-dnd' },
  offline: { label: '● Offline',        class: 'status-offline' },
};

function updateStatus(status) {
  const config  = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
  const dot     = document.getElementById('status-dot');
  const badge   = document.getElementById('status-badge');
  const text    = document.getElementById('status-text');

  dot.className   = `status-dot ${config.class}`;
  badge.className = `status-badge ${config.class}`;
  text.textContent = LANG_STATUS[currentLang][status] || LANG_STATUS[currentLang].offline;
}

const ACTIVITY_TYPES = {
  0: { en: '🎮 Playing', fr: '🎮 Joue à' },
  1: { en: '📡 Streaming', fr: '📡 Stream' },
  2: { en: '🎵 Listening to', fr: '🎵 Écoute' },
  3: { en: '📺 Watching', fr: '📺 Regarde' },
  4: { en: '💬 Custom Status', fr: '💬 Statut personnalisé' },
  5: { en: '🏆 Competing in', fr: '🏆 Compétition' },
};

function updateActivity(activities) {
  const card = document.getElementById('activity-card');


  const activity = activities?.find(a => a.type !== 4);

  if (!activity) {
    card.style.display = 'none';
    return;
  }

  const typeLabel = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES[0];
  document.getElementById('activity-type').textContent = typeLabel[currentLang] || typeLabel.en;
  document.getElementById('activity-name').textContent = activity.name || '';
  document.getElementById('activity-detail').textContent = activity.details || '';
  document.getElementById('activity-state').textContent = activity.state || '';


  const imgEl      = document.getElementById('activity-img');
  const imgSmallEl = document.getElementById('activity-img-small');

  if (activity.assets?.large_image) {
    let imgUrl = activity.assets.large_image;
    if (imgUrl.startsWith('mp:external/')) {
      imgUrl = 'https://media.discordapp.net/external/' + imgUrl.replace('mp:external/', '');
    } else {
      imgUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${imgUrl}.png`;
    }
    imgEl.src = imgUrl;
    imgEl.style.display = 'block';
  } else {
    imgEl.style.display = 'none';
  }

  if (activity.assets?.small_image) {
    let smallUrl = activity.assets.small_image;
    if (smallUrl.startsWith('mp:external/')) {
      smallUrl = 'https://media.discordapp.net/external/' + smallUrl.replace('mp:external/', '');
    } else {
      smallUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${smallUrl}.png`;
    }
    imgSmallEl.src = smallUrl;
    imgSmallEl.style.display = 'block';
  } else {
    imgSmallEl.style.display = 'none';
  }

  card.style.display = 'flex';
}

async function loadDiscordAvatar() {
  try {
    const res  = await fetch(LANYARD_URL);
    const json = await res.json();
    const { id, avatar } = json.data.discord_user;
    const status     = json.data.discord_status;
    const activities = json.data.activities;

    if (avatar) {
      const ext      = avatar.startsWith('a_') ? 'gif' : 'png';
      const url      = `https://cdn.discordapp.com/avatars/${id}/${avatar}.${ext}?size=256`;
      const img      = document.getElementById('avatar');
      const fallback = document.getElementById('avatar-fallback');

      img.src = url;
      const favicon = document.querySelector("link[rel='icon']");
      if (favicon) favicon.href = url;
      img.style.display = 'block';
      if (fallback) fallback.style.display = 'none';
    }

    updateStatus(status);
    updateActivity(activities);
  } catch {
    updateStatus('offline');
    document.getElementById('activity-card').style.display = 'none';
  }
}

loadDiscordAvatar();

setInterval(loadDiscordAvatar, 30000);

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

const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const PROJECTS_PER_PAGE = 6;
let showAll = false;

function updateShowMoreText() {
  const text = document.getElementById('show-more-text');
  const icon = document.querySelector('#show-more-btn i');
  if (!text) return;
  text.textContent = showAll
    ? (currentLang === 'en' ? 'Show less' : 'Voir moins')
    : (currentLang === 'en' ? 'Show more' : 'Voir plus');
  if (icon) icon.className = showAll ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
}

function applyFilter(filter) {
  showAll = false;
  const filtered = [...projectCards].filter(card =>
    filter === 'all' || card.dataset.type === filter
  );

  projectCards.forEach(card => card.style.display = 'none');
  filtered.forEach((card, i) => {
    card.style.display = i < PROJECTS_PER_PAGE ? '' : 'none';
  });

  document.getElementById('projects-empty').style.display = filtered.length === 0 ? 'flex' : 'none';

  const wrap = document.getElementById('show-more-wrap');
  if (filtered.length > PROJECTS_PER_PAGE) {
    wrap.style.display = 'flex';
    updateShowMoreText();
  } else {
    wrap.style.display = 'none';
  }
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

document.getElementById('show-more-btn').addEventListener('click', () => {
  const filter = document.querySelector('.filter-btn.active').dataset.filter;
  const filtered = [...projectCards].filter(card =>
    filter === 'all' || card.dataset.type === filter
  );
  showAll = !showAll;
  filtered.forEach((card, i) => {
    card.style.display = (!showAll && i >= PROJECTS_PER_PAGE) ? 'none' : '';
  });
  updateShowMoreText();
});

applyFilter('all');

const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');
const formStatus  = document.getElementById('form-status');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name    = document.getElementById('name').value.trim();
  const email   = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    formStatus.textContent = LANG_FORM_MESSAGES[currentLang].empty;
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

    formStatus.textContent = LANG_FORM_MESSAGES[currentLang].success;
    formStatus.className = 'show success';
    contactForm.reset();
  } catch {
    formStatus.textContent = LANG_FORM_MESSAGES[currentLang].error;
    formStatus.className = 'show error';
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.getElementById('lang-current').textContent = lang.toUpperCase();
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = lang === 'en' ? el.dataset.en : el.dataset.fr;
  });
  const statusText = document.getElementById('status-text');
  if (statusText) {
    const currentStatus = document.getElementById('status-dot').className.replace('status-dot ', '').replace('status-', '');
    statusText.textContent = LANG_STATUS[lang][currentStatus] || LANG_STATUS[lang].offline;
  }
  const activityType = document.getElementById('activity-type');
  if (activityType && activityType.textContent) {
    const match = Object.values(ACTIVITY_TYPES).find(t => t.en === activityType.dataset.type || t.fr === activityType.dataset.type);
    if (match) activityType.textContent = match[lang];
  }
  updateShowMoreText();
}

const langDropdown = document.getElementById('lang-dropdown');
document.getElementById('lang-toggle').addEventListener('click', (e) => {
  e.stopPropagation();
  langDropdown.classList.toggle('open');
});

document.querySelectorAll('.lang-menu button').forEach(btn => {
  btn.addEventListener('click', () => {
    applyLang(btn.dataset.lang);
    langDropdown.classList.remove('open');
  });
});

document.addEventListener('click', () => langDropdown.classList.remove('open'));

applyLang(currentLang);

const hamburger    = document.getElementById('hamburger');
const mobileMenu   = document.getElementById('mobile-menu');
const mobileOverlay = document.getElementById('mobile-overlay');

function toggleMenu(open) {
  hamburger.classList.toggle('open', open);
  mobileMenu.classList.toggle('open', open);
  mobileOverlay.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

hamburger.addEventListener('click', () => toggleMenu(!mobileMenu.classList.contains('open')));
mobileOverlay.addEventListener('click', () => toggleMenu(false));

document.querySelectorAll('.mobile-nav a').forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

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

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));