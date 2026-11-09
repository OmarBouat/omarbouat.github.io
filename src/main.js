const email = 'omar.bouattour.03@gmail.com';
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  navLinks.classList.remove('is-open');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  navLinks.classList.toggle('is-open', open);
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.navigation')) closeMenu(); });

const themeToggle = document.querySelector('.theme-toggle');
function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.setAttribute('aria-label', 'Switch to ' + (dark ? 'light' : 'dark') + ' theme');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor.setAttribute('content', dark ? '#14151b' : '#fafafc');
}
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('omar-portfolio-theme', next); } catch {}
  updateThemeButton();
});
updateThemeButton();

const cards = [...document.querySelectorAll('.project-card')];
document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    let count = 0;
    cards.forEach(card => {
      const show = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
      card.hidden = !show;
      if (show) count++;
    });
    document.querySelector('.project-count').textContent = count + ' projects';
  });
});

const items = {
  llm: {
    category: 'AI INFRASTRUCTURE · APR — MAY 2026',
    title: 'LLM Serving Platform',
    description: 'A production-oriented LLM serving platform built around a centralized GPU inference backend on Kubernetes.',
    details: [
      'Served Qwen2.5-3B-Instruct with vLLM through an OpenAI-compatible API.',
      'Integrated chat, an API gateway, a SQL agent, multimodal components, and monitoring around one inference backend.',
      'Used Prometheus and Grafana to observe latency, time to first token, throughput, KV-cache usage, and request behavior.',
      'Compared prefix caching, tensor parallelism, pipeline parallelism, and Multi-LoRA serving under concurrent workloads.'
    ],
    tags: ['vLLM', 'LiteLLM', 'LangChain', 'Kubernetes', 'Prometheus', 'Grafana']
  },
  kubernetes: {
    category: 'CLOUD & DEVOPS · INFRASTRUCTURE AS CODE',
    title: 'Kubernetes Platform with End-to-End CI/CD',
    description: 'A self-hosted platform that connects reproducible provisioning with automated application delivery.',
    details: [
      'Provisioned a four-node infrastructure environment using Vagrant and Ansible, with containerd as the Kubernetes runtime.',
      'Connected Gitea, image builds, Nexus, and Kubernetes into a pipeline from commit to cluster rollout.',
      'Kept infrastructure definitions in code to support repeatable environments and deployments.'
    ],
    tags: ['Kubernetes', 'Vagrant', 'Ansible', 'containerd', 'Gitea', 'Nexus'],
    repository: 'https://github.com/OmarBouat/K8S_IaC'
  },
  vision: {
    category: 'DEEP LEARNING · COMPUTER VISION',
    title: 'Vegetable Image Classification',
    description: 'An image classification study comparing pretrained networks with a custom convolutional neural network.',
    details: [
      'Trained and evaluated MobileNetV2, ResNet50, and a custom CNN across 36 fruit and vegetable categories.',
      'Achieved 97% classification accuracy.',
      'Analyzed trade-offs between classification accuracy, inference speed, and model size.'
    ],
    tags: ['TensorFlow', 'Keras', 'MobileNetV2', 'ResNet50', 'CNN']
  },
  crop: {
    category: 'MACHINE LEARNING · AGRICULTURE',
    title: 'Crop Recommendation System',
    description: 'An end-to-end machine learning pipeline that uses soil and climate features to recommend crops.',
    details: [
      'Built a recommendation pipeline using soil and climate data.',
      'Compared Logistic Regression, Random Forest, SVM, and Gradient Boosting using cross-validation.',
      'Deployed the selected approach through a Flask prediction application.'
    ],
    tags: ['Python', 'Scikit-learn', 'Flask', 'Cross-validation']
  },
...{"technova":{"story":true,"category":"HACKATHON · 1ST PLACE","title":"Technova 1.0","description":"A first-place finish at Technova 1.0, part of my journey of building and problem solving through hackathons.","details":["Awarded 1st place at Technova 1.0."],"tags":["Hackathon","1st place"]},"fit-tech":{"story":true,"category":"HACKATHON · 1ST PLACE","title":"Fit-Tech 1.0","description":"A first-place finish at Fit-Tech 1.0. One of the hackathon experiences that shaped my approach to working with a team.","details":["Awarded 1st place at Fit-Tech 1.0."],"tags":["Hackathon","1st place"]},"masterfaster":{"story":true,"category":"HACKATHON · 2ND PLACE","title":"MasterFaster 2.0","description":"A second-place finish at MasterFaster 2.0, alongside other challenges and competitions throughout my studies.","details":["Awarded 2nd place at MasterFaster 2.0.","Other hackathon results include 3rd place at I2I 1.0 and TRC 2.0."],"tags":["Hackathon","2nd place"]},"cpc":{"story":true,"category":"CPC FSS · COMMUNITY & LEADERSHIP","title":"Growing with CPC FSS","description":"Learning is better when it is shared. My time with the Competitive Programming Club at FSS has grown from coordination to leadership and mentoring.","details":["Mentor, 2025–present: helping students with algorithms, data structures, and competitive programming.","Club lead, 2024–2025: coordinated training sessions, contests, and club initiatives.","HR manager, 2023–2024: managed onboarding, communication, and member coordination."],"tags":["Mentoring","Leadership","Algorithms","Community"]}}
};

const dialog = document.querySelector('#project-dialog');
const gallery = document.querySelector('.dialog-gallery');
const galleryImage = document.querySelector('#gallery-image');
const galleryError = document.querySelector('#gallery-error');
const thumbnails = document.querySelector('.gallery-thumbnails');
let media = { albums: {} };
let activePhotos = [];
let activeId = null;
let dialogTrigger = null;
let photoIndex = 0;

function renderPhoto(index) {
  if (!activePhotos.length) return;
  photoIndex = (index + activePhotos.length) % activePhotos.length;
  const photo = activePhotos[photoIndex];
  galleryImage.hidden = false;
  galleryError.hidden = true;
  galleryImage.alt = photo.alt;
  galleryImage.src = photo.src;
  document.querySelector('#gallery-caption').textContent = photo.caption || '';
  document.querySelector('#gallery-counter').textContent = (photoIndex + 1) + ' / ' + activePhotos.length;
  document.querySelectorAll('.gallery-thumbnail').forEach((button, i) => button.setAttribute('aria-pressed', String(i === photoIndex)));
}
function populateGallery() {
  activePhotos = media.albums[activeId] || [];
  gallery.hidden = activePhotos.length === 0;
  dialog.classList.toggle('no-photos', activePhotos.length === 0);
  thumbnails.replaceChildren();
  thumbnails.hidden = activePhotos.length < 2;
  document.querySelector('.gallery-prev').disabled = activePhotos.length < 2;
  document.querySelector('.gallery-next').disabled = activePhotos.length < 2;
  activePhotos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-thumbnail';
    button.setAttribute('aria-label', 'Show photo ' + (index + 1));
    button.setAttribute('aria-pressed', String(index === 0));
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = '';
    image.loading = 'lazy';
    button.append(image);
    button.addEventListener('click', () => renderPhoto(index));
    thumbnails.append(button);
  });
  if (activePhotos.length) renderPhoto(0);
  else { galleryImage.removeAttribute('src'); galleryImage.alt = ''; }
}
galleryImage.addEventListener('error', () => { galleryImage.hidden = true; galleryError.hidden = false; });
galleryImage.addEventListener('load', () => { galleryError.hidden = true; galleryImage.hidden = false; });
document.querySelector('.gallery-prev').addEventListener('click', () => renderPhoto(photoIndex - 1));
document.querySelector('.gallery-next').addEventListener('click', () => renderPhoto(photoIndex + 1));
dialog.addEventListener('keydown', event => {
  if (!activePhotos.length || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
  event.preventDefault();
  renderPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1));
});

function openItem(id, trigger) {
  const item = items[id];
  if (!item) return;
  activeId = id;
  dialogTrigger = trigger;
  document.querySelector('#dialog-category').textContent = item.category;
  document.querySelector('#dialog-title').textContent = item.title;
  document.querySelector('#dialog-description').textContent = item.description;
  document.querySelector('#dialog-details-heading').textContent = item.story ? 'The highlights' : 'What I built';
  document.querySelector('#dialog-details').replaceChildren(...item.details.map(text => {
    const node = document.createElement('li'); node.textContent = text; return node;
  }));
  document.querySelector('#dialog-tags').replaceChildren(...item.tags.map(text => {
    const node = document.createElement('span'); node.textContent = text; return node;
  }));
  const links = document.querySelector('#dialog-links');
  links.replaceChildren();
  if (item.repository) {
    const source = document.createElement('a');
    source.href = item.repository; source.target = '_blank'; source.rel = 'noopener noreferrer';
    source.className = 'button button-primary'; source.textContent = 'View on GitHub ↗';
    links.append(source);
  }
  const discuss = document.createElement('a');
  discuss.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Let’s talk about ' + item.title);
  discuss.className = 'text-link';
  discuss.textContent = item.story ? 'Let’s connect ↗' : 'Discuss this project ↗';
  links.append(discuss);
  populateGallery();
  dialog.showModal();
  document.body.classList.add('dialog-open');
}
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openItem(button.dataset.open, button)));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  activeId = null;
  dialogTrigger?.focus();
});

function validPhoto(photo) {
  return photo && typeof photo.src === 'string' && photo.src.startsWith('/images/') && typeof photo.alt === 'string';
}
fetch('/media.json').then(response => {
  if (!response.ok) throw new Error('Photo manifest unavailable');
  return response.json();
}).then(result => {
  media.albums = {};
  for (const id of Object.keys(items)) {
    media.albums[id] = Array.isArray(result.albums?.[id]) ? result.albums[id].filter(validPhoto) : [];
  }
  if (validPhoto(result.portrait)) {
    const portrait = document.querySelector('.portrait');
    portrait.addEventListener('error', () => {
      if (portrait.getAttribute('src') !== '/images/profile/omar.jpg') portrait.src = '/images/profile/omar.jpg';
    });
    portrait.src = result.portrait.src;
    portrait.alt = result.portrait.alt;
  }
  document.querySelectorAll('[data-album-card]').forEach(card => {
    const photos = media.albums[card.dataset.albumCard] || [];
    if (!photos.length) return;
    const image = card.querySelector('[data-cover-image]');
    const fallback = card.querySelector('[data-cover-fallback]');
    const badge = card.querySelector('[data-photo-count]');
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => { image.hidden = true; fallback.hidden = false; });
    image.src = photos[0].src;
    image.alt = photos[0].alt;
    image.hidden = false;
    fallback.hidden = true;
    badge.textContent = photos.length + (photos.length === 1 ? ' photo' : ' photos');
    badge.hidden = false;
  });
  if (activeId) populateGallery();
}).catch(() => {
  // The CV content, portrait, details, and illustrated covers still work offline.
});

let copyResetTimer;
document.querySelector('.copy-email').addEventListener('click', async () => {
  const label = document.querySelector('.copy-email span');
  const status = document.querySelector('#copy-status');
  clearTimeout(copyResetTimer);
  try {
    await navigator.clipboard.writeText(email);
    label.textContent = 'Email copied';
    status.textContent = 'Email address copied to clipboard.';
  } catch {
    label.textContent = 'Use the email link';
    status.textContent = 'Copy unavailable. Select the email address or use the email link.';
  }
  copyResetTimer = setTimeout(() => { label.textContent = 'Copy email address'; status.textContent = ''; }, 4000);
});
document.querySelector('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window) {
  const observer = new window.IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -55% 0px' });
  document.querySelectorAll('main > section[id]').forEach(section => observer.observe(section));
}
