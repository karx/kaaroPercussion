---
name: web-seo
description: Add or audit comprehensive SEO, Open Graph, Twitter Cards, JSON-LD structured data, PWA manifest, favicons, OG images, robots.txt, and sitemap for any web project. Generic skill — works across all web-based projects.
---

# Web SEO — Full-Stack Web Presence Optimization

Apply this skill when the user asks to add, audit, or improve SEO, meta tags, OG images, social sharing, structured data, or web presence for any web project.

## Checklist — What to Implement

Work through each section. Skip items that already exist and are correct. Ask the user for any project-specific values you can't infer (site URL, project name, description).

---

### 1. Primary Meta Tags

Place these in `<head>` in this order:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>{Project} — {Tagline}</title>
<meta name="title" content="{same as title}">
<meta name="description" content="{150-160 chars, action-oriented, include key features}">
<meta name="keywords" content="{10-15 relevant terms, comma-separated}">
<meta name="author" content="{project or org name}">
<meta name="robots" content="index, follow">
<meta name="googlebot" content="index, follow">
<meta name="language" content="English">
<meta name="revisit-after" content="7 days">
<meta name="rating" content="General">
<link rel="canonical" href="{full canonical URL with trailing slash}">
```

**Rules:**
- Title: under 60 characters. Format: `{Name} — {Value Proposition}`
- Description: 150-160 chars. Lead with what the user gets, not what the project is.
- Keywords: domain-relevant terms a user would search for. No stuffing.
- Canonical URL: always absolute, always trailing slash, always HTTPS.

---

### 2. Theme & Mobile App Meta

```html
<meta name="theme-color" content="{primary bg hex}">
<meta name="color-scheme" content="dark"> <!-- or "light" or "dark light" -->
<meta name="msapplication-TileColor" content="{primary bg hex}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="{short name}">
```

---

### 3. Open Graph Tags

```html
<meta property="og:type" content="website"> <!-- or "game", "article" -->
<meta property="og:url" content="{canonical URL}">
<meta property="og:title" content="{title, can differ from page title — optimize for social}">
<meta property="og:description" content="{social-optimized, can use emoji, 2-3 sentences max}">
<meta property="og:image" content="{absolute URL to OG image}">
<meta property="og:image:secure_url" content="{same, https}">
<meta property="og:image:type" content="image/png"> <!-- prefer PNG for social; SVG has limited support -->
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{descriptive alt text}">
<meta property="og:site_name" content="{project name}">
<meta property="og:locale" content="en_US">
```

**OG Image Rules:**
- Dimensions: **1200 x 630 px** (1.91:1 ratio) — this is non-negotiable.
- Safe zone: keep critical content within center **1000 x 500 px** (platforms crop edges).
- File size: under **300 KB** for PNG. Under 8 KB for SVG.
- **PNG is the ONLY reliable format** — Facebook, LinkedIn, WhatsApp, Discord, Slack, and Telegram all reject SVG. Always point `og:image` and `twitter:image` at a **PNG file**. Design in SVG if you like, but convert to PNG before deploying.
- **SVG-to-PNG workflow** (no build tools): Create a `generate-og-png.html` helper page that loads the SVG into a `<canvas>` via `Image()` + `createObjectURL`, then exports via `canvas.toDataURL('image/png')`. Open locally, click render, download the PNG, commit it. Delete the helper or keep it for future updates.
- Include: project name/logo, tagline, 1-2 visual elements that convey the product. No walls of text.

**For games**, add:
```html
<meta property="game:points_system" content="{XP/score system name}">
```

---

### 4. Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:url" content="{canonical URL}">
<meta name="twitter:title" content="{title, under 70 chars}">
<meta name="twitter:description" content="{under 200 chars, can use &amp; for &}">
<meta name="twitter:image" content="{absolute URL to image — PNG preferred}">
<meta name="twitter:image:alt" content="{alt text}">
```

Optional (if project has a Twitter/X account):
```html
<meta name="twitter:site" content="@{handle}">
<meta name="twitter:creator" content="@{handle}">
```

**Rules:**
- Twitter description: keep under 200 chars. HTML entities allowed (`&amp;` for &).
- Image: same 1200x630 image works. Twitter also accepts 2:1 (1200x600).

---

### 5. JSON-LD Structured Data

Add one or more `<script type="application/ld+json">` blocks. Choose schema types based on the project:

| Project Type | Schema `@type` | Key Properties |
|---|---|---|
| Web app / tool | `WebApplication` | applicationCategory, operatingSystem, offers, featureList |
| Game | `Game` | genre, numberOfPlayers, potentialAction, interactionStatistic |
| Course / tutorial | `Course` | provider, educationalLevel, hasCourseInstance, syllabusSections |
| Blog / article | `Article` | author, datePublished, headline, image |
| Organization | `Organization` | name, url, logo, sameAs (social links) |

**Common pattern — WebApplication:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "{name}",
  "url": "{canonical URL}",
  "description": "{full description}",
  "applicationCategory": "{e.g. EducationalApplication, GameApplication}",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "{org name}"
  },
  "image": "{OG image URL}",
  "featureList": ["{feature 1}", "{feature 2}"],
  "inLanguage": "en",
  "isAccessibleForFree": true,
  "potentialAction": [
    {
      "@type": "PlayAction",
      "name": "{primary CTA}",
      "target": "{URL}"
    }
  ]
}
```

**Rules:**
- You can include **multiple** JSON-LD blocks (e.g., WebApplication + Course).
- `potentialAction` — define 2-3 key user actions with target URLs.
- `interactionStatistic` — quantify engagement (exercise count, level count, etc.).
- `offers.price: "0"` — always include for free projects (helps rich snippets).
- Validate output at https://validator.schema.org/ or Google Rich Results Test.

---

### 6. Favicons

**Minimum set:**
```html
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png"> <!-- 180x180 -->
```

**Best practice:**
- SVG favicon as primary (scalable, supports dark mode via `prefers-color-scheme`).
- PNG fallbacks for older browsers (32x32, 16x16).
- Apple touch icon at 180x180 PNG.
- No need for favicon.ico unless targeting very old browsers.

**SVG favicon template:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{color1}"/>
      <stop offset="100%" style="stop-color:{color2}"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="7" fill="url(#g)"/>
  <text x="16" y="23" font-family="Arial,sans-serif" font-size="20" fill="#fff"
        text-anchor="middle" font-weight="bold">{symbol}</text>
</svg>
```

---

### 7. PWA Web Manifest (`site.webmanifest`)

```json
{
  "name": "{Full Name — Tagline}",
  "short_name": "{ShortName}",
  "description": "{1-2 sentences}",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "{hex}",
  "background_color": "{hex}",
  "icons": [
    { "src": "favicon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "favicon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "favicon.svg", "sizes": "any", "type": "image/svg+xml" }
  ],
  "screenshots": [
    {
      "src": "og-image.png",
      "sizes": "1200x630",
      "type": "image/png",
      "form_factor": "wide",
      "label": "{descriptive label}"
    }
  ],
  "shortcuts": [
    {
      "name": "{Primary Action}",
      "short_name": "{Short}",
      "description": "{what it does}",
      "url": "/{path}"
    }
  ],
  "categories": ["{cat1}", "{cat2}"],
  "lang": "en",
  "dir": "ltr"
}
```

**Rules:**
- `short_name`: under 12 characters (shown on home screen).
- Icons: must include 192x192 and 512x512 at minimum.
- `screenshots`: enables richer install prompts. Include both `wide` and `narrow` form factors if possible.
- `shortcuts`: 2-4 deep links to key features.
- Link from HTML: `<link rel="manifest" href="site.webmanifest">`

---

### 8. OG Image Creation (SVG)

When creating an SVG OG image:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
```

**SVG-specific rules (critical):**
- **No HTML entities** — `&bull;` is invalid XML. Use `&#x2022;` or Unicode directly.
- **No emoji HTML entities** — `&#127925;` won't render in SVG image contexts. Use simple Unicode symbols (`&#x266B;`, `&#x25B6;`, `&#x2191;`) or plain text instead.
- **No `rgba()` fills** — unreliable in some SVG renderers. Use solid hex colors or opacity attribute.
- **Font stacks** — always include fallbacks: `font-family="Inter, Arial, sans-serif"`. Custom fonts won't load in static SVG contexts (OG scrapers).
- **Content hierarchy**: logo/icon top-left, title large, tagline below, feature list or pills in middle, footer bar with URL.

**Template structure:**
```
┌─────────────────────────────────────┐
│ ▀▀▀▀▀▀▀▀▀▀ accent bar ▀▀▀▀▀▀▀▀▀▀▀ │
│                                     │
│  [icon] ProjectName                 │
│  Tagline / value proposition        │
│  ────                               │
│  [pill] [pill] [pill] [pill]        │
│  [pill] [pill] [pill] [pill]        │
│                        ◎ visual     │
│  ▶ Feature one           element   │
│  ♫ Feature two                      │
│  ↑ Feature three                    │
│▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄│
│ footer text           site.url.com  │
│ ▀▀▀▀▀▀▀▀▀▀ accent bar ▀▀▀▀▀▀▀▀▀▀▀ │
└─────────────────────────────────────┘
```

---

### 9. Preconnect & Performance Hints

Add after favicons, before stylesheets:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

Add preconnects for any external domains the page loads from on first paint:
- Google Fonts
- YouTube (if embedding): `https://www.youtube-nocookie.com`
- CDNs
- Analytics endpoints

---

### 10. robots.txt

Create at project root:
```
User-agent: *
Allow: /

Sitemap: {canonical URL}sitemap.xml
```

For pages that should NOT be indexed (admin dashboards, debug pages), use per-page meta:
```html
<meta name="robots" content="noindex, nofollow">
```

---

### 11. sitemap.xml (optional for SPAs)

For multi-page sites, create at project root:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{canonical URL}</loc>
    <lastmod>{YYYY-MM-DD}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

For single-page apps with hash routing, a sitemap with just the root URL is still valuable for explicitly declaring the canonical entry point.

---

### 12. HTML Tag Attributes

```html
<html lang="en" prefix="og: https://ogp.me/ns#">
```

- `lang="en"` — required for accessibility and SEO.
- `prefix="og:..."` — technically required by OG spec, often omitted but best to include.

---

## Audit Mode

When auditing an existing project, check for:

1. **Missing tags** — run through sections 1-12 above.
2. **URL consistency** — all canonical, og:url, twitter:url, JSON-LD url, and manifest start_url must point to the same base URL.
3. **Image availability** — verify og:image URL is accessible and returns correct content-type.
4. **Character limits** — title < 60, description 150-160, twitter description < 200.
5. **JSON-LD validity** — valid JSON, correct @type for the project.
6. **SVG validity** — if using SVG for OG/favicon, check for HTML-only entities and emoji issues.
7. **HTTPS everywhere** — no http:// URLs in any meta tag.
8. **Missing fallbacks** — PNG fallback for SVG favicon, PNG OG image if SVG is primary.

## Testing & Validation

After implementation, recommend the user test with:
- **Google Rich Results Test** — validates JSON-LD
- **Facebook Sharing Debugger** — validates OG tags (requires Facebook login)
- **Twitter Card Validator** — validates Twitter card rendering
- **LinkedIn Post Inspector** — validates LinkedIn preview
- **Lighthouse SEO audit** — Chrome DevTools > Lighthouse > SEO category
- **Open og:image URL directly** — verify it renders correctly in a browser tab
