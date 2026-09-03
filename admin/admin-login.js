import { supabase } from '../js/supabase-client.js?v=2';

const form = document.querySelector('#login-form');
const statusBox = form.querySelector('.form-status');

const showStatus = (type, message) => {
  statusBox.textContent = message;
  statusBox.className = 'form-status show ' + type;
};

// If already signed in, skip straight to the dashboard.
supabase.auth.getSession().then(({ data }) => {
  if (data.session) window.location.href = 'dashboard.html';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = form.email.value.trim();
  const password = form.password.value;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    showStatus('error', 'Wrong email or password.');
    return;
  }
  window.location.href = 'dashboard.html';
});
