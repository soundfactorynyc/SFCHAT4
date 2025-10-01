# Sound Factory — SMS Popup Embed Pack

This folder contains a single, self‑contained popup you can drop into any site.

## Two simple ways to use it

1) Copy/paste into your page
- Open `index.html`
- Copy everything from `<!-- BEGIN POPUP -->` to `<!-- END POPUP -->` (styles, markup, and logic sections)
- Paste near the end of your page (before `</body>`)
- Keep the script tag that loads from your SMS site. If you're hosting this popup on the SMS site, you can use a relative path:
  `/public/sf-sms-login.js`
  
  Or, if you need an absolute URL, use the renamed site:
  `https://sf-sms-service.netlify.app/public/sf-sms-login.js`

2) Iframe the whole thing
- Upload this `embed-pack/` folder to your site
- Embed it where you want the popup to initialize (it will still open on load):
  `<iframe src="/embed-pack/index.html" style="width:0;height:0;border:0;position:absolute;left:-9999px;" aria-hidden="true"></iframe>`

## Notes
- On success, the widget sets a cookie `sf_token` (1 hour) and dispatches `sf:auth` with `{ token, phone }`.
- Ensure your SMS server allows your site in ALLOWED_ORIGINS (Netlify env var).
- Replace the inline SVG logo with your real logo if you want.
- Phone format must be E.164 (e.g., `+15551234567`).
