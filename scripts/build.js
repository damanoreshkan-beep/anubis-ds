// Build `dist/` from `tokens.json`.
//
// Reads the canonical tokens file and emits every consumer-facing artifact:
//   dist/tokens.json            — copy of the source (no transformations)
//   dist/tailwind-preset.cjs    — Tailwind preset for widget configs
//   dist/variables.css          — `:root { --color-brand-600: #7c3aed; ... }`
//   dist/theme.css              — `.glass`, `.btn-glow`, `.gold-text`, `.card-hover`
//   dist/animations.css         — every keyframe + animation utility class
//   dist/fonts.css              — Google Fonts @import for Inter
//   dist/index.css              — single roll-up that @imports the four above
//   dist/index.html             — minimal landing page so GitHub Pages is browsable
//
// Zero npm dependencies — only node:fs, node:path. Keeps the repo and CI fast.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')

fs.rmSync(DIST, { recursive: true, force: true })
fs.mkdirSync(DIST, { recursive: true })

const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens.json'), 'utf8'))

/* ───── helpers ──────────────────────────────────────────────────── */

// Walk dotted-path references like "{color.primitive.brand.500}".
function resolve(refOrValue) {
    if (typeof refOrValue !== 'string' || !refOrValue.startsWith('{')) return refOrValue
    const dottedPath = refOrValue.replace(/^\{|\}$/g, '')
    return dottedPath.split('.').reduce((acc, k) => acc?.[k], tokens)
}

function hexToRgb(hex) {
    const h = hex.replace('#', '')
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
    }
}

// `#7c3aed` + 0.18 → `rgba(124, 58, 237, 0.18)`
function alphaHex(hex, alpha) {
    const { r, g, b } = hexToRgb(hex)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function alphaToken(v) {
    return alphaHex(resolve(v.ref), v.alpha)
}

/* ───── 1. dist/tokens.json (verbatim copy) ──────────────────────── */

fs.writeFileSync(path.join(DIST, 'tokens.json'), JSON.stringify(tokens, null, 4) + '\n')

/* ───── 2. dist/variables.css ────────────────────────────────────── */

const lines = []
lines.push('/* Generated from tokens.json — do not edit. */')
lines.push(':root {')

// Primitive colors.
for (const [palette, shades] of Object.entries(tokens.color.primitive)) {
    for (const [shade, hex] of Object.entries(shades)) {
        lines.push(`    --color-${palette}-${shade}: ${hex};`)
    }
}
// Alpha (rgba) tokens.
for (const [name, value] of Object.entries(tokens.color.alpha)) {
    lines.push(`    --color-${name}: ${alphaToken(value)};`)
}
// Semantic — default mode lives on :root, Light mode below in `[data-theme="light"]`.
for (const [name, ref] of Object.entries(tokens.color.semantic.default)) {
    lines.push(`    --color-${name}: ${resolve(ref)};`)
}
// Spacing.
for (const [k, v] of Object.entries(tokens.spacing)) lines.push(`    --spacing-${k}: ${v}px;`)
// Radius.
for (const [k, v] of Object.entries(tokens.radius)) lines.push(`    --radius-${k}: ${v}px;`)
// Typography.
for (const [k, v] of Object.entries(tokens.font.size))   lines.push(`    --font-size-${k}: ${v}px;`)
for (const [k, v] of Object.entries(tokens.font.lineHeight)) lines.push(`    --line-height-${k}: ${v};`)
for (const [k, v] of Object.entries(tokens.font.weight)) lines.push(`    --font-weight-${k}: ${v};`)
// Shadow strings — already resolved by alphaToken via {...} references.
for (const [k, v] of Object.entries(tokens.shadow)) {
    const resolved = v.replace(/\{[^}]+\}/g, ref => {
        const dotted = ref.slice(1, -1)
        const node = dotted.split('.').reduce((acc, key) => acc?.[key], tokens)
        return node?.ref ? alphaToken(node) : resolve(ref)
    })
    lines.push(`    --shadow-${k}: ${resolved};`)
}
// Gradient strings (no resolution needed — they are literal CSS already).
for (const [k, v] of Object.entries(tokens.gradient)) lines.push(`    --gradient-${k}: ${v};`)

lines.push('}')
lines.push('')
lines.push('[data-theme="light"] {')
for (const [name, ref] of Object.entries(tokens.color.semantic.light)) {
    lines.push(`    --color-${name}: ${resolve(ref)};`)
}
lines.push('}')

fs.writeFileSync(path.join(DIST, 'variables.css'), lines.join('\n') + '\n')

/* ───── 3. dist/theme.css — custom classes referencing CSS vars ──── */

const themeCss = `/* Generated from tokens.json — do not edit. */
/* Custom classes that compose the canonical CSS variables. */

.glass {
    background: var(--color-glass-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--color-glass-border);
}

.btn-glow {
    position: relative;
    overflow: hidden;
}
.btn-glow::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.18), transparent);
    transform: translateX(-100%);
    transition: transform 0.5s;
    pointer-events: none;
}
.btn-glow:hover::after { transform: translateX(100%); }

.gold-text {
    color: transparent;
    background: var(--gradient-gold-text);
    -webkit-background-clip: text;
    background-clip: text;
}

.card-hover {
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.card-hover:hover {
    transform: translateY(-4px);
    border-color: var(--color-glass-border-hover);
    box-shadow: var(--shadow-glow-brand);
}
`
fs.writeFileSync(path.join(DIST, 'theme.css'), themeCss)

/* ───── 4. dist/animations.css ───────────────────────────────────── */

function keyframeBlock(name, frames) {
    const body = Object.entries(frames).map(([key, props]) => {
        const decls = Object.entries(props).map(([p, v]) => {
            const cssProp = p.replace(/[A-Z]/g, c => '-' + c.toLowerCase())
            return `        ${cssProp}: ${v};`
        }).join('\n')
        return `    ${key} {\n${decls}\n    }`
    }).join('\n')
    return `@keyframes ${name} {\n${body}\n}`
}

const animCss = ['/* Generated from tokens.json — do not edit. */']
for (const [name, spec] of Object.entries(tokens.animation)) {
    animCss.push(keyframeBlock(name, spec.keyframes))
    const direction = spec.direction ? ` ${spec.direction}` : ''
    animCss.push(`.anim-${name} { animation: ${name} ${spec.duration} ${spec.easing} ${spec.iteration}${direction}; }`)
    animCss.push('')
}
fs.writeFileSync(path.join(DIST, 'animations.css'), animCss.join('\n'))

/* ───── 5. dist/fonts.css ────────────────────────────────────────── */

const fontsCss = `/* Generated from tokens.json — do not edit. */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
`
fs.writeFileSync(path.join(DIST, 'fonts.css'), fontsCss)

/* ───── 6. dist/index.css — single roll-up ───────────────────────── */

fs.writeFileSync(path.join(DIST, 'index.css'),
    `@import './fonts.css';\n@import './variables.css';\n@import './theme.css';\n@import './animations.css';\n`,
)

/* ───── 7. dist/tailwind-preset.cjs ──────────────────────────────── */

// Builds a Tailwind preset that mirrors the same color/spacing/radius/typography
// values that drive the CSS variables. Widgets use this so utility classes
// (`bg-brand-600`, `rounded-2xl`, `text-xs`) resolve to identical hex values.
const presetBody = `// Generated from tokens.json — do not edit.
// Usage in a widget's tailwind.config.js:
//   const preset = require('@anubis/ds/dist/tailwind-preset.cjs');
//   module.exports = { presets: [preset], content: [...], theme: { extend: { ... } } };

module.exports = {
    theme: {
        extend: {
            colors: ${JSON.stringify(tokens.color.primitive, null, 16).replace(/\n/g, '\n            ')},
            spacing: ${JSON.stringify(
        Object.fromEntries(Object.entries(tokens.spacing).map(([k, v]) => [k, `${v}px`])),
        null, 16,
    ).replace(/\n/g, '\n            ')},
            borderRadius: ${JSON.stringify(
        Object.fromEntries(Object.entries(tokens.radius).map(([k, v]) =>
            [k, k === 'full' ? '9999px' : `${v}px`],
        )),
        null, 16,
    ).replace(/\n/g, '\n            ')},
            fontFamily: ${JSON.stringify(tokens.font.family, null, 16).replace(/\n/g, '\n            ')},
            fontSize: ${JSON.stringify(
        Object.fromEntries(Object.entries(tokens.font.size).map(([k, v]) => [k, `${v}px`])),
        null, 16,
    ).replace(/\n/g, '\n            ')},
            fontWeight: ${JSON.stringify(tokens.font.weight, null, 16).replace(/\n/g, '\n            ')},
            lineHeight: ${JSON.stringify(tokens.font.lineHeight, null, 16).replace(/\n/g, '\n            ')},
            keyframes: ${JSON.stringify(
        Object.fromEntries(Object.entries(tokens.animation).map(([n, spec]) => [n, spec.keyframes])),
        null, 16,
    ).replace(/\n/g, '\n            ')},
            animation: ${JSON.stringify(
        Object.fromEntries(Object.entries(tokens.animation).map(([n, spec]) =>
            [n, `${n} ${spec.duration} ${spec.easing} ${spec.iteration}${spec.direction ? ' ' + spec.direction : ''}`],
        )),
        null, 16,
    ).replace(/\n/g, '\n            ')},
        },
    },
};
`
fs.writeFileSync(path.join(DIST, 'tailwind-preset.cjs'), presetBody)

/* ───── 8. dist/index.html — Pages landing ───────────────────────── */

const swatches = Object.entries(tokens.color.primitive).map(([palette, shades]) => {
    const cells = Object.entries(shades).map(([shade, hex]) =>
        `<div class="sw"><span class="dot" style="background:${hex}"></span><code>${palette}/${shade}</code><code class="hex">${hex}</code></div>`,
    ).join('')
    return `<h3>${palette}</h3><div class="row">${cells}</div>`
}).join('')

const indexHtml = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Anubis Design System</title>
    <link rel="stylesheet" href="./fonts.css" />
    <link rel="stylesheet" href="./variables.css" />
    <link rel="stylesheet" href="./theme.css" />
    <link rel="stylesheet" href="./animations.css" />
    <style>
        body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 32px;
               background: var(--color-bg-page); color: var(--color-text-primary); }
        h1 { font-size: 36px; margin: 0 0 8px; }
        h1 span { background: var(--gradient-gold-text); -webkit-background-clip: text; color: transparent; }
        h2 { margin: 32px 0 12px; }
        h3 { margin: 16px 0 6px; font-size: 13px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: .08em; }
        .row { display: flex; flex-wrap: wrap; gap: 8px; }
        .sw { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 10px;
              background: var(--color-glass-bg); border: 1px solid var(--color-glass-border); }
        .dot { width: 16px; height: 16px; border-radius: 4px; }
        code { font-family: ui-monospace, monospace; font-size: 12px; }
        .hex { color: var(--color-text-muted); }
        .card { padding: 16px 20px; margin-top: 12px; border-radius: 16px;
                background: var(--color-glass-bg); border: 1px solid var(--color-glass-border); }
        .btn { display: inline-block; padding: 10px 20px; border-radius: 12px;
               background: var(--gradient-button-primary); color: white; font-weight: 600;
               text-decoration: none; cursor: pointer; }
        footer { margin-top: 48px; color: var(--color-text-muted); font-size: 12px; }
        a { color: var(--color-text-accent); }
    </style>
</head>
<body>
    <h1>Anubis <span>Design System</span></h1>
    <p>Tokens, CSS, and Tailwind preset for every Anubis World widget, launcher, and partner-site embed.</p>

    <h2>Consume</h2>
    <div class="card">
        <p>Single roll-up <code>&lt;link&gt;</code>:</p>
        <code>&lt;link rel="stylesheet" href="https://damanoreshkan-beep.github.io/anubis-ds/index.css"&gt;</code>
    </div>

    <h2>Primitives</h2>
    ${swatches}

    <h2>Patterns</h2>
    <div class="card card-hover">.glass + .card-hover</div>
    <p><a class="btn btn-glow" href="#">.btn-glow primary</a></p>

    <footer>Generated from <a href="https://github.com/damanoreshkan-beep/anubis-ds/blob/main/tokens.json">tokens.json</a> · v${tokens.$meta.version}</footer>
</body>
</html>
`
fs.writeFileSync(path.join(DIST, 'index.html'), indexHtml)

/* ───── summary ──────────────────────────────────────────────────── */

const out = fs.readdirSync(DIST).map(f => {
    const size = fs.statSync(path.join(DIST, f)).size
    return `  ${f.padEnd(28)} ${size.toString().padStart(7)} B`
}).join('\n')

console.log('built ' + DIST + ':\n' + out)
