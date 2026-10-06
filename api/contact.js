// Contact form handler (Vercel serverless function).
//
// Sends the enquiry to CONTACT_TO via Resend (https://resend.com).
// Until RESEND_API_KEY is set it answers 503 and the page falls back to a
// prefilled mailto: link, so nothing is lost while the mailbox is being set up.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY   required — API key from Resend
//   CONTACT_FROM     optional — verified sender, default "Make It Live <noreply@makeitlive.agency>"
//   CONTACT_TO       optional — inbox that receives enquiries, default "hello@makeitlive.agency"

const EVENT_TYPES = ['Corporate', 'Wedding', 'Festival', 'Private party', 'Other'];
const SERVICES = ['DJ', 'Live musician', 'Live band', 'Performers', 'Photo & video', 'Full event support'];

const clean = (v, max) => String(v == null ? '' : v).replace(/\r/g, '').trim().slice(0, max);
const oneLine = (v, max) => clean(v, max).replace(/\s+/g, ' ');
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  // Honeypot: real visitors never fill this in. Pretend success so bots move on.
  if (body.website) return res.status(200).json({ ok: true });

  const name = oneLine(body.name, 100);
  const email = oneLine(body.email, 200);
  const type = EVENT_TYPES.includes(body.type) ? body.type : '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date || '') ? body.date : '';
  const message = clean(body.message, 3000);
  const services = (Array.isArray(body.services) ? body.services : [])
    .filter((s) => SERVICES.includes(s));

  if (!name || !type || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'invalid' });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ error: 'not_configured' });

  const rows = [
    ['Name', name],
    ['Email', email],
    ['Event type', type],
    ['Date', date || '—'],
    ['Looking for', services.join(', ') || '—']
  ];
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n') + '\n\n' + (message || '(no message)');
  const html =
    '<table cellpadding="6" style="font-family:Arial,sans-serif;font-size:15px">' +
    rows.map(([k, v]) => `<tr><td style="color:#777">${k}</td><td>${esc(v)}</td></tr>`).join('') +
    '</table><p style="font-family:Arial,sans-serif;font-size:15px;white-space:pre-wrap">' +
    esc(message || '(no message)') + '</p>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || 'Make It Live <noreply@makeitlive.agency>',
        to: [process.env.CONTACT_TO || 'hello@makeitlive.agency'],
        reply_to: email,
        subject: `Website — ${type} — ${name}`,
        text,
        html
      })
    });
    if (!r.ok) return res.status(502).json({ error: 'upstream' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: 'upstream' });
  }
};
