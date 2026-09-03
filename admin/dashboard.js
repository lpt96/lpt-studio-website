import { supabase } from '../js/supabase-client.js?v=2';
import { applyAccentMarkup } from '../js/cms.js?v=2';

// ---------- Auth guard ----------
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  window.location.href = 'login.html';
}

document.querySelector('#sign-out').addEventListener('click', async (e) => {
  e.preventDefault();
  await supabase.auth.signOut();
  window.location.href = 'login.html';
});

// ---------- Panel switching ----------
const navLinks = document.querySelectorAll('.admin-nav a[data-panel]');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`#panel-${link.dataset.panel}`).classList.add('active');
    if (link.dataset.panel === 'enquiries') loadEnquiries();
  });
});

// ---------- Home content editor ----------
async function loadHomeContent() {
  const { data, error } = await supabase
    .from('content_blocks')
    .select('section, key, value')
    .eq('page', 'home');
  if (error) { console.error(error); return; }
  data.forEach(row => {
    const field = document.querySelector(`[data-key="${row.section}.${row.key}"]`);
    if (field) field.value = row.value;
    updatePreview(`${row.section}.${row.key}`, row.value);
  });
}

// ---------- Live preview ----------
const previewMap = {
  'hero.eyebrow': { el: document.querySelector('#preview-eyebrow'), html: false },
  'hero.headline': { el: document.querySelector('#preview-headline'), html: true },
  'hero.subtext': { el: document.querySelector('#preview-subtext'), html: false },
  'hero.primary_cta_label': { el: document.querySelector('#preview-primary-cta'), html: false, suffix: ' →' },
  'hero.secondary_cta_label': { el: document.querySelector('#preview-secondary-cta'), html: false },
};

function updatePreview(key, value) {
  const target = previewMap[key];
  if (!target || !target.el) return;
  const text = value + (target.suffix || '');
  if (target.html) {
    target.el.innerHTML = applyAccentMarkup(text);
  } else {
    target.el.textContent = text;
  }
}

document.querySelectorAll('#panel-home [data-key]').forEach(field => {
  field.addEventListener('input', () => updatePreview(field.dataset.key, field.value));
});

document.querySelector('#save-home').addEventListener('click', async () => {
  const statusBox = document.querySelector('#panel-home .form-status');
  const fields = document.querySelectorAll('#panel-home [data-key]');
  const rows = Array.from(fields).map(field => {
    const [section, key] = field.dataset.key.split('.');
    return { page: 'home', section, key, value: field.value, updated_at: new Date().toISOString() };
  });

  const { error } = await supabase
    .from('content_blocks')
    .upsert(rows, { onConflict: 'page,section,key' });

  statusBox.className = 'form-status show ' + (error ? 'error' : 'success');
  statusBox.textContent = error ? 'Something went wrong saving that.' : 'Saved — the live homepage is updated.';
});

// ---------- Enquiries inbox ----------
async function loadEnquiries() {
  const list = document.querySelector('#enquiries-list');
  const { data, error } = await supabase
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { list.textContent = "Couldn't load enquiries."; return; }
  if (!data.length) { list.textContent = 'No enquiries yet.'; return; }

  list.innerHTML = data.map(row => `
    <div class="enquiry-card" data-id="${row.id}">
      <div style="display:flex; justify-content:space-between; align-items:start;">
        <div>
          <h4>${escapeHtml(row.name)} ${row.company ? '· ' + escapeHtml(row.company) : ''}</h4>
          <div class="enquiry-meta">${new Date(row.created_at).toLocaleString('en-GB')} · ${escapeHtml(row.email)}</div>
        </div>
        <span class="status-badge">${row.status}</span>
      </div>
      <p><strong>${escapeHtml(row.project_type)}</strong> — ${escapeHtml(row.details)}</p>
      <div class="enquiry-meta">Budget: ${row.budget ? escapeHtml(row.budget) : '—'} · Timeframe: ${row.timeframe ? escapeHtml(row.timeframe) : '—'}</div>
      <div class="enquiry-actions">
        <button data-action="read">Mark read</button>
        <button data-action="archived">Archive</button>
        <a href="mailto:${escapeHtml(row.email)}" class="btn btn-ghost" style="padding:7px 12px; font-size:0.8rem;">Reply</a>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('button[data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card = btn.closest('.enquiry-card');
      await supabase.from('enquiries').update({ status: btn.dataset.action }).eq('id', card.dataset.id);
      loadEnquiries();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadHomeContent();
