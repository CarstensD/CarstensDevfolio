import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default defineConfig([
  globalIgnores([".next/**", "out/**", "node_modules/**", "next-env.d.ts"]),
  { files: ["src/**/*.{ts,tsx}"], extends: [js.configs.recommended, tseslint.configs.recommended,
    reactHooks.configs.flat.recommended, jsxA11y.flatConfigs.recommended] },
]);
