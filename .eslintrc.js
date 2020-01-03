module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: [
    'standard',
    'standard-react',
    'react-app',
    'plugin:jsx-a11y/recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['react', 'jsx-a11y'],
  rules: {
    'react/no-did-update-set-state': 'off'
  }
}
