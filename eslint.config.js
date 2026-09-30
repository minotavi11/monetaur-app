// https://docs.expo.dev/guides/using-eslint/
const prettierConfig = require("eslint-config-prettier");
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ["dist/*"],
  },
]);
