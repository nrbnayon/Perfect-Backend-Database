module.exports = {
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:node/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "prettier", // Add "prettier" here to extend from Prettier configuration
  ],
  plugins: ["node", "import", "prettier"], // Add "prettier" here as a plugin
  rules: {
    // "prettier/prettier": "error",
  },
  parserOptions: {
    ecmaVersion: 12,
  },
};
