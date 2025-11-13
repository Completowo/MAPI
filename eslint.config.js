// Simplified ESLint config for Expo + Prettier
// See: https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');

module.exports = defineConfig({
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error'
  },
  ignorePatterns: ['dist/*']
});
