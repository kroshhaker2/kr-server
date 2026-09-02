import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["dist/", "node_modules/", "src/generated/", "coverage/"],
    },

    eslint.configs.recommended,

    ...tseslint.configs.recommendedTypeChecked,

    {
        files: ["**/*.ts"],

        languageOptions: {
            globals: {
                ...globals.node,
            },

            parserOptions: {
                projectService: true,
            },
        },

        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
        },
    },
);
