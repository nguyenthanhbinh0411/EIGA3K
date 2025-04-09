module.exports = {
  parser: "vue-eslint-parser", // Use the Vue ESLint parser
  parserOptions: {
    parser: "@babel/eslint-parser", // Use Babel parser for JavaScript
    requireConfigFile: false,
  },
  extends: ["plugin:vue/vue3-essential", "eslint:recommended"],
  env: {
    node: true,
  },
  rules: {
    // Add any custom rules here if needed
  },
};
