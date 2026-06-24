module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  extends: [
    '../.eslintrc.cjs',
    'airbnb',
    'plugin:react/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', 'prettier'],
  rules: {
    'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
    'react/react-in-jsx-scope': 'off',
    'prettier/prettier': ['error'],
  },
};
