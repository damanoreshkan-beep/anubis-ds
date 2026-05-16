# anubis-ds

Design system for **Anubis World** — Minecraft launcher, widgets, and partner
site. Tokens (`tokens.json`) compile to a Tailwind preset, CSS variables,
theme classes, and keyframe animations. Zero runtime dependencies.

## Source of truth

`tokens.json` in this repo. Anything you can change there — colors, spacing,
radius, typography, gradients, keyframes. `scripts/build.js` regenerates
every consumer artifact in `dist/`:

| File | Purpose |
|---|---|
| `dist/tokens.json` | Verbatim copy for programmatic consumers |
| `dist/variables.css` | `:root { --color-brand-600: #7c3aed; ... }` + `[data-theme="light"]` overrides |
| `dist/theme.css` | `.glass` · `.btn-glow` · `.gold-text` · `.card-hover` |
| `dist/animations.css` | `@keyframes float / glow / twinkle / auraPulse / borderPulse / particleFloat` + matching `.anim-*` utility classes |
| `dist/fonts.css` | `@import` Inter from Google Fonts |
| `dist/index.css` | One-line roll-up that `@import`s the four above |
| `dist/tailwind-preset.cjs` | Tailwind preset for widget `tailwind.config.js` |
| `dist/index.html` | Pages-served swatch reference |

## Consume

### Static page (partner site, any HTML)

```html
<link rel="stylesheet" href="https://damanoreshkan-beep.github.io/anubis-ds/index.css">
```

### Tailwind project (widgets, launcher)

```bash
npm install github:damanoreshkan-beep/anubis-ds
```

```js
// tailwind.config.js
const preset = require('@anubis/ds/dist/tailwind-preset.cjs');
module.exports = {
    presets: [preset],
    content: ['./src/**/*.{ts,tsx,html}'],
    important: '.aw-cabinet-scope',
    corePlugins: { preflight: false },
};
```

```css
/* widget.css */
@import '@anubis/ds/dist/variables.css';
@import '@anubis/ds/dist/theme.css';
@import '@anubis/ds/dist/animations.css';
```

## Token format

```jsonc
{
    "color": {
        "primitive": { "brand": { "600": "#7c3aed" }, ... },
        "semantic": {
            "default": { "bg-page": "{color.primitive.surface.950}", ... },
            "light":   { "bg-page": "{color.primitive.neutral.white}", ... }
        },
        "alpha": {
            "glass-bg": { "ref": "{color.primitive.brand.500}", "alpha": 0.06 }
        }
    },
    "spacing": { "md": 12, ... },
    "radius":  { "2xl": 24, ... },
    "font":    { "size": { ... }, "weight": { ... }, "lineHeight": { ... } },
    "shadow":  { "glow-brand": "0 8px 32px {color.alpha.glow-brand-soft}" },
    "gradient":{ "gold-text": "linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #22d3ee 100%)" },
    "animation": { "float": { "duration": "6s", "easing": "ease-in-out", "iteration": "infinite", "keyframes": { ... } } }
}
```

References `{path.to.token}` resolve at build time.

## Build locally

```bash
node scripts/build.js
```

Emits `dist/` (gitignored). CI runs the same command on every push to `main`
and publishes the result to GitHub Pages.

## Why no Figma sync

Figma Variables REST API requires a paid plan. Rather than gate the design
system behind that, **`tokens.json` is the canonical source** and the Figma
file (if kept) is a downstream visualization for designers — not an upstream
input.
