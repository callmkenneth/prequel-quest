# prequel.quest

Static homepage for Prequel Quest, built from `~/Desktop/PrequelQuest.pen`:

| Breakpoint | Viewport | Pen frame |
|---|---|---|
| Mobile | < 768px | `01C · Mobile — 390` (+ `Mobile — Menu open`) |
| Tablet | 768–1199px | `01C · Tablet — 768` |
| Desktop | ≥ 1200px | `01C · Home — NEW Version (clean, accessible)` 1440 |

No build step: `index.html`, `assets/styles.css`, `assets/main.js`, `assets/img/`.

## Preview locally

    python3 -m http.server 4747 --directory ~/prequel-quest-site

## Before launch

1. **Email sign-up:** set `SIGNUP_ENDPOINT` at the top of `assets/main.js` to your list provider's
   form URL (Buttondown, ConvertKit, Mailchimp, Formspree…). Until then the form validates but
   tells visitors sign-ups open soon.
2. **Footer links:** Contact / Privacy / Terms point at `#contact`, `#privacy`, `#terms` placeholders.
3. **Flannel photo** in "For truth seekers" is hot-linked from Unsplash (photo-1644333611952).

## Deploy + domain

Any static host works (Netlify, Vercel, Cloudflare Pages, GitHub Pages). Upload the folder as-is,
then add `prequel.quest` as a custom domain in the host and point DNS at it. `CNAME` is included
for GitHub Pages; other hosts ignore it.
