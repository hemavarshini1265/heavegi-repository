// API Base URL Configuration
// When served by Express, relative path '' allows seamless local & deployed routing
window.API_BASE = window.API_BASE || '';

const API = {
  base: window.API_BASE,

  url(path) {
    return `${this.base}${path}`;
  },

  async get(path) {
    const res = await fetch(this.url(path));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async post(path, body) {
    const res = await fetch(this.url(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
