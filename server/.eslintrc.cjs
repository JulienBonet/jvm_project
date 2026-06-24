module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: ['../.eslintrc.cjs', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
  rules: {
    'consistent-return': 'off',
    'no-return-await': 'off',
    'handle-callback-err': 'warn',
    'global-require': 'off',
    'prettier/prettier': ['error'],
  },
};
