-- ============================================================
-- Seed data — run this AFTER schema.sql.
-- Fills in the content that's currently hard-coded in index.html,
-- so the admin dashboard has something to edit right away.
-- ============================================================

insert into content_blocks (page, section, key, value) values
  ('home', 'hero', 'eyebrow', 'Independent developer · UK-based'),
  ('home', 'hero', 'headline', 'Websites, apps & digital tools built [[around your business.]]'),
  ('home', 'hero', 'subtext', 'Modern, practical digital solutions for small businesses and individuals — without the cost and complexity of a traditional agency. You deal directly with the person building it.'),
  ('home', 'hero', 'primary_cta_label', 'Start a Project'),
  ('home', 'hero', 'secondary_cta_label', 'View My Work')
on conflict (page, section, key) do nothing;
