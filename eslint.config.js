import globals from "globals";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
  { files: ["**/*.json"], plugins: { json }, language: "json/json" },
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/commonmark" },
  { files: ["**/*.css"], plugins: { css }, language: "css/css" },
]);
