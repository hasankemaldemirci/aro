import chalk from "chalk";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: Centralized branding and constants.
 */

export const Branding = {
  cyan: chalk.hex("#00f2ff"),
  magenta: chalk.hex("#ff00ff"),
  success: chalk.hex("#00ff88"),
  warning: chalk.hex("#ffbb00"),
  error: chalk.hex("#ff0044"),
  gray: chalk.hex("#666666"),
  white: chalk.hex("#ffffff"),
  border: (text: string) => chalk.hex("#333333")("─".repeat(text.length || 40)),
};

export const DEFAULT_IGNORES = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "temp_repos",
  ".agent_context_pro.json",
];

export const CONFIG_FILES = [
  "tsconfig.json",
  "next.config.ts",
  ".env.example",
  "package.json",
  "eslint.config.mjs",
];

export const TECH_KEYWORDS = [
  "typescript",
  "tailwind",
  "prisma",
  "mongoose",
  "jest",
  "vitest",
  "express",
  "fastify",
  "redux",
  "axios",
  "firebase",
  "supabase",
  "react",
  "next",
  "vue",
];
