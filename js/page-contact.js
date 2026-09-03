import { submitEnquiry } from './cms.js?v=2';

const form = document.querySelector('#project-form');
if (form) {
  const statusBox = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  const showStatus = (type, message) => {
    statusBox.textContent = message;
    statusBox.className = 'form-status show ' + type;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.email || !data.projectType || !data.details) {
      showStatus('error', 'Please fill in your name, email, project type, and a short description.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      await submitEnquiry(data);
      form.reset();
      showStatus('success', "Thanks — that's landed with me. I'll reply within a couple of days.");
    } catch (err) {
      console.error(err);
      showStatus('error', "Something went wrong sending that. Mind emailing liam@lpt-studio.co.uk directly?");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send project details';
    }
  });
}
