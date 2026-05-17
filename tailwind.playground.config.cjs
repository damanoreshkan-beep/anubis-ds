// Tailwind config for the live playground at examples/.
// Extends the design system preset so every utility class resolves
// to the exact same tokens that consumers will see.
const preset = require('./dist/tailwind-preset.cjs')

module.exports = {
    presets: [preset],
    content: [
        './examples/**/*.{html,tsx,ts}',
        './src/**/*.{tsx,ts}',
    ],
}
