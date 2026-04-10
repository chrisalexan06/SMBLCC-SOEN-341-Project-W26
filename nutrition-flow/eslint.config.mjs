import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    basePath: "app",
    rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "no-undef": "off",
    "no-useless-assignment": "off",
    "@typescript-eslint/no-this-alias": "off",
  }
}
);
