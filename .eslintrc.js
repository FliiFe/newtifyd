module.exports = {
    parser: 'babel-eslint',
    env: {node: true, jquery: true, es6: true, browser: true},
    extends: 'eslint:recommended',
    parserOptions: {sourceType: 'module', ecmaVersion: 8, ecmaFeatures: {jsx: true}},
    rules: {
        'no-unused-vars': 'warn',
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'no-console': 'off'
    }
}
