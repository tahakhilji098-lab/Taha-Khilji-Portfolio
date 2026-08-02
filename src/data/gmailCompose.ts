export const CONTACT_EMAIL = 'tahakhilji83@gmail.com';

const PROJECT_SUBJECT = 'Project Inquiry — Design Collaboration';

const PROJECT_BODY = `Hi Taha,

I'd like to discuss a potential design project with you.

Name:
Company / Brand:
Project type:
Timeline:
Estimated budget:
Project details:

Thank you.`;

export const GMAIL_COMPOSE_URL =
  `https://mail.google.com/mail/?view=cm&fs=1` +
  `&to=${encodeURIComponent(CONTACT_EMAIL)}` +
  `&su=${encodeURIComponent(PROJECT_SUBJECT)}` +
  `&body=${encodeURIComponent(PROJECT_BODY)}`;
