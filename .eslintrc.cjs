module.exports = {
	root: true,
	extends: ['eslint:recommended', 'prettier', 'plugin:@typescript-eslint/recommended'],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	plugins: ['@typescript-eslint'],
	env: {
		browser: true,
		es2021: true
	}
};
