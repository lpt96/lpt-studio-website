// ============================================================
// CMS helpers — fetch content from Supabase and hydrate the page.
// Every function fails silently (falls back to the static HTML
// already in the page) so a database hiccup never breaks the site.
// ============================================================

import { supabase } from './supabase-client.js?v=2';

// Converts the [[...]] accent-markup convention used in content_blocks
// into <em> tags, matching the site's existing headline styling.
export function applyAccentMarkup(text) {
  return text.replace(/\[\[(.+?)\]\]/g, '<em>$1</em>');
}

// Fetches all content_blocks rows for a page as { "section.key": value }
export async function fetchContent(page) {
  const map = {};
  try {
    const { data, error } = await supabase
      .from('content_blocks')
      .select('section, key, value')
      .eq('page', page);
    if (error) throw error;
    data.forEach(row => { map[`${row.section}.${row.key}`] = row.value; });
  } catch (err) {
    console.warn(`CMS: couldn't load content for "${page}", using static fallback.`, err);
  }
  return map;
}

// Applies fetched text to any element with data-cms="section.key" in the page.
// Elements with data-cms-html use innerHTML (for the [[..]] accent markup);
// everything else uses textContent for safety.
export function hydrateContent(map) {
  document.querySelectorAll('[data-cms]').forEach(el => {
    const value = map[el.dataset.cms];
    if (value === undefined) return; // keep the static fallback already in the HTML
    if (el.hasAttribute('data-cms-html')) {
      el.innerHTML = applyAccentMarkup(value);
    } else {
      el.textContent = value;
    }
  });
}

// Submits the contact form directly into the enquiries table.
export async function submitEnquiry(data) {
  const { error } = await supabase.from('enquiries').insert({
    name: data.name,
    company: data.company || null,
    email: data.email,
    project_type: data.projectType,
    details: data.details,
    budget: data.budget || null,
    timeframe: data.timeframe || null,
  });
  if (error) throw error;
}
