const email = 'omar.bouattour.03@gmail.com';
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const closeMenu = () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  navLinks.classList.remove('is-open');
};
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  navLinks.classList.toggle('is-open', open);
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.navigation')) closeMenu(); });

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
    document.querySelector('.project-count').textContent = String(count).padStart(2, '0') + ' PROJECTS';
  });
});

const projects = {
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
      'Achieved 97% classification accuracy, as reported in my CV.',
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
  }
};
const dialog = document.querySelector('#project-dialog');
let dialogTrigger;
document.querySelectorAll('[data-project]').forEach(button => {
  button.addEventListener('click', () => {
    const project = projects[button.dataset.project];
    dialogTrigger = button;
    document.querySelector('#dialog-category').textContent = project.category;
    document.querySelector('#dialog-title').textContent = project.title;
    document.querySelector('#dialog-description').textContent = project.description;
    const details = document.querySelector('#dialog-details');
    details.replaceChildren(...project.details.map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
    document.querySelector('#dialog-tags').replaceChildren(...project.tags.map(text => {
      const tag = document.createElement('span');
      tag.textContent = text;
      return tag;
    }));
    const links = document.querySelector('#dialog-links');
    links.replaceChildren();
    if (project.repository) {
      const repository = document.createElement('a');
      repository.href = project.repository;
      repository.target = '_blank';
      repository.rel = 'noopener noreferrer';
      repository.className = 'button button-dark';
      repository.textContent = 'View source on GitHub ↗';
      links.append(repository);
    }
    const contact = document.createElement('a');
    contact.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Let’s talk about your ' + project.title);
    contact.className = 'text-link';
    contact.textContent = 'Discuss this project ↗';
    links.append(contact);
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  dialogTrigger?.focus();
});

const copyButton = document.querySelector('.copy-email');
let copyResetTimer;
copyButton.addEventListener('click', async () => {
  const label = copyButton.querySelector('span');
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
  copyResetTimer = setTimeout(() => { label.textContent = 'Copy email'; status.textContent = ''; }, 4000);
});
document.querySelector('#year').textContent = new Date().getFullYear();

if ('IntersectionObserver' in window) {
  const observed = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.nav-links a').forEach(link => {
        const active = link.hash === '#' + entry.target.id;
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -50% 0px' });
  document.querySelectorAll('main > section[id]').forEach(section => observed.observe(section));
}
