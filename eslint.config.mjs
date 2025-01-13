import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: ["services/files/front/js/socket.io.js"],
    },
    {
        files: ["**/*.js"],
        languageOptions: { sourceType: "commonjs" },
    },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    {
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "warn",
        },
    },
];
