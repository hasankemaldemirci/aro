import { AROMetrics } from "./types";

/**
 * @aro-context-marker
 * AI READABILITY NOTE: Metrics & Scoring Module.
 * Contains purely mathematical business logic for score calculation.
 */

/**
 * Scores README content quality for AI-agent readability (0-100).
 * Checks for structural elements agents rely on, not just file size.
 */
export function scoreReadmeContent(content: string): number {
  let score = 0;

  // 1. Has a top-level title (# Title)
  if (/^#\s.+/m.test(content)) score += 15;

  // 2. Has installation instructions
  if (/install|setup|getting started|kurulum/i.test(content)) score += 20;

  // 3. Has at least one code block (commands/examples)
  if (/```/.test(content)) score += 20;

  // 4. Has usage / example section
  if (/usage|example|kullanım|örnek/i.test(content)) score += 20;

  // 5. Has multiple sections (## headings indicate depth)
  const sections = (content.match(/^##\s/gm) || []).length;
  score += Math.min(sections * 5, 15);

  // 6. Mentions configuration or options
  if (/config|option|flag|param|argument/i.test(content)) score += 10;

  return Math.min(score, 100);
}

export function calculateScore(metrics: AROMetrics): number {
  let score = 0;

  // 1. Documentation Base (25pts)
  // Quality-based scoring: content analysis instead of raw byte count
  if (metrics.hasReadme) {
    score += 10;
    // Map quality score (0-100) → bonus points (0-15)
    score += Math.round((metrics.readmeQualityScore / 100) * 15);
  }

  // 2. Structural Health (20pts)
  if (metrics.hasSrc) score += 20;

  // 3. AI Debt / Truncation Risk (30pts)
  score += Math.max(30 - metrics.largeFiles * 5, 0);

  // 4. Agent Instructions & Context (25pts)
  if (metrics.contextFiles.length > 0) {
    const totalContextScore = metrics.contextFiles.reduce(
      (acc, f) => acc + f.score,
      0,
    );
    const avgContextScore = totalContextScore / metrics.contextFiles.length;
    // We give points based on both presence and quality
    score += Math.min(10 + avgContextScore * 0.15, 25);
  }

  // Bonus for Config & AI-Map
  if (metrics.hasConfig > 3) score += 5;
  if (metrics.hasAIMap) score += 5;

  // Security Penalty: -5 per issue, caps at 20
  score -= Math.min(metrics.securityIssues * 5, 20);

  return Math.max(0, Math.min(score, 100));
}
