# Gungun Gupta — Portfolio

Personal portfolio website. Plain HTML, CSS, and JavaScript — no build step, no
framework, no dependencies. Designed to be hosted on GitHub Pages.

Content is taken from `cv/gungun-cv.pdf`.

## Quick start

Open `index.html` in a browser and it works. That's the whole setup.

To preview it the way it will actually behave (the theme toggle and the
fetch-based form both need `http://` rather than `file://`):

```bash
cd gungun-gupta-portfolio
python3 -m http.server 8000
# then open http://localhost:8000
```

## Project layout

```
.
├── index.html              Main single-page site
├── 404.html                Not-found page (absolute paths — see note below)
├── blog/
│   ├── index.html          Writing archive
│   └── posts/*.html        One file per post
├── projects/
│   ├── index.html          Project index with category filter
│   └── *.html              One case study per project
├── assets/
│   ├── css/style.css       All styles. Design tokens at the top.
│   ├── js/main.js          All behaviour. Vanilla, no dependencies.
│   └── img/                Favicon, OG image, your photo
├── cv/gungun-cv.pdf        Downloadable CV — keep this exact filename
├── feed.xml                RSS feed for the blog
├── sitemap.xml             Search engine sitemap
├── manifest.webmanifest    PWA metadata
└── .nojekyll               Stops GitHub Pages running Jekyll
```

## ⚠️ Before you publish — do these first

Search the files for `YOURUSERNAME` and `TODO`. Every occurrence needs
replacing.

| What | Where | Why it matters |
|---|---|---|
| `YOURUSERNAME` | `index.html`, `404.html`, `blog/index.html`, `projects/index.html`, all 3 case studies, all 3 posts, `feed.xml`, `sitemap.xml`, `robots.txt`, `assets/img/og-image.svg` | Social previews and canonical URLs will point at a domain that isn't yours. This is the one thing you must not miss. |
| GitHub URL | `index.html` contact section, 3 case studies | Currently guesses. Your resume hyperlinks to GitHub and LinkedIn but the URLs aren't recoverable from the PDF text — **send me the real ones.** |
| LinkedIn URL | `index.html` contact section | Same. |
| `TODO: your city` | `index.html` hero + contact | You never listed a location. "India" is currently in both places. |
| Photo | `assets/img/portrait.jpg` | Square crop, ~800px wide. The hero currently shows a "G" placeholder. |
| Repository links | 3 case studies | Point at `github.com/YOURUSERNAME/<slug>`. Add a live demo link for ScraperAgent if it's still up — that's the strongest single thing on the site. |
| Certificate links | `index.html` certifications | Linking each cert to a verifiable page beats asserting it. |

## Content checklist

Everything below is already filled in from your resume, so this is about
improving it rather than writing it:

- [ ] Read the hero paragraph and make it sound like you
- [ ] Add a photo
- [ ] Send your real GitHub and LinkedIn URLs
- [ ] Add your city
- [ ] Link the three case studies to real repositories
- [ ] Link your certifications, if you have the URLs
- [ ] Consider a live demo URL for ScraperAgent
- [ ] Re-read the three case studies and delete anything you didn't actually do

**Verify the three blog posts.** They're written from the projects on your
resume, so the substance is grounded in your work — but I don't know your
implementation details. Check the technical specifics and cut anything you
can't defend in an interview. A post that overstates something is worse than no
post.

## What's built in

| Feature | Where it lives |
|---|---|
| Dark/light theme toggle, remembered across visits | `style.css` tokens + `main.js` §1 |
| Sticky header with scroll-reactive border | `main.js` §3 |
| Mobile navigation drawer | `main.js` §2 |
| Scroll-reveal animations | `main.js` §4 |
| Animated stat counters | `main.js` §6 |
| Reading progress bar on long posts | `main.js` §7 |
| Copy-email button | `main.js` §8 |
| Contact form validation | `main.js` §9 |
| Project category filter | `main.js` §10 |
| SEO + Open Graph + Twitter Card meta | every `<head>` |
| RSS feed for the blog | `feed.xml` |
| 404 page | `404.html` |

Everything degrades gracefully. With JavaScript disabled the site is still
readable, the theme is still applied, and the contact form falls back to
opening the visitor's email client.

## Contact form

Out of the box the form validates input and then opens the visitor's own email
client with the message pre-filled. Nothing to configure, no third-party
service, no spam.

If you'd rather have submissions land in your inbox automatically, create a
free form endpoint and paste it into the `action` attribute in `index.html`:

```html
<form class="form" data-contact-form action="https://formspree.io/f/YOUR_ID" ...>
```

Formspree, Basin, and Web3Forms all work with no backend. The form posts via
`fetch` and falls back to `mailto:` if the request fails, so it degrades safely
either way.

## Deploying to GitHub Pages

```bash
cd gungun-gupta-portfolio
git init
git add .
git commit -m "Portfolio"
git branch -M main
git remote add origin git@github.com:YOURUSERNAME/gungun.github.io.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source → Deploy from a branch →
`main` / `root`**. It goes live in about a minute.

Using a repo named `gungun.github.io` is the cleanest option, because it means
your site lives at the domain root. See the note on absolute paths below.

### If you use a different repo name

`404.html` has to use absolute paths (`/assets/...`) because it's served for any
URL, which means it only works when your site is at the domain root. If you
publish to `yoursite.github.io/portfolio/`, either add a `CNAME` custom domain,
or accept that a visitor landing on a bad URL sees unstyled HTML. Everything
else uses relative paths and works either way.

## Customising the look

All colours, spacing, and type are CSS custom properties in the `:root` block at
the top of `assets/css/style.css`. To change the accent colour, edit three
lines:

```css
--accent: #38bdf8;                              /* the accent itself */
--accent-soft: rgba(56, 189, 248, 0.12);        /* tinted backgrounds */
--accent-line: rgba(56, 189, 248, 0.35);        /* borders and glows */
```

There's a matching `[data-theme="light"]` block further down — change the
accents there too, or the light theme will look wrong.

## Accessibility notes

- Skip-to-content link on every page
- Visible focus rings, never removed
- Landmarks and headings in a sensible order
- `aria-current` on the active nav item
- Form errors announced via `role="alert"`, status via `role="status"`
- `prefers-reduced-motion` disables all animation
- Both themes meet contrast requirements for body text
- Fully keyboard navigable

## Browser support

Current Chrome, Edge, Firefox, and Safari. Uses `color-mix()`, `aspect-ratio`,
`:focus-visible`, CSS custom properties, and `IntersectionObserver`. IE is not
supported, deliberately.
