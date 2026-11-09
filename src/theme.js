try {
  const saved = localStorage.getItem('omar-portfolio-theme');
  document.documentElement.dataset.theme = saved === 'dark' ? 'dark' : 'light';
} catch { document.documentElement.dataset.theme = 'light'; }
