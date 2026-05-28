import logger from './logger.js';

/**
 * Feature Flags — config-driven feature toggling.
 *
 * Enables:
 * - Gradual rollouts (enable for 10% of users, then 50%, then 100%)
 * - Kill switches (instantly disable a broken feature without deploy)
 * - A/B testing (different code paths for different flag values)
 * - Development (test unreleased features in production safely)
 *
 * This implementation is config-based (env vars + defaults).
 * In production, you'd replace this with LaunchDarkly, Unleash, or Flagsmith
 * for dynamic flags without deploys.
 *
 * Usage:
 *   if (featureFlags.isEnabled('AI_MATCHING')) {
 *     const recommendations = await aiService.match(user, jobs);
 *   }
 */

interface FeatureFlagConfig {
  description: string;
  defaultValue: boolean;
  envVar?: string;  // Override via environment variable
}

const FLAG_DEFINITIONS: Record<string, FeatureFlagConfig> = {
  AI_MATCHING: {
    description: 'TF-IDF based job recommendation engine',
    defaultValue: true,
    envVar: 'FF_AI_MATCHING',
  },
  NOTIFICATIONS: {
    description: 'In-app notification system',
    defaultValue: true,
    envVar: 'FF_NOTIFICATIONS',
  },
  SAVED_JOBS: {
    description: 'Job bookmarking feature',
    defaultValue: true,
    envVar: 'FF_SAVED_JOBS',
  },
  AUDIT_LOGGING: {
    description: 'Audit log trail for mutating operations',
    defaultValue: true,
    envVar: 'FF_AUDIT_LOGGING',
  },
  REDIS_CACHE: {
    description: 'Redis-based response caching',
    defaultValue: true,
    envVar: 'FF_REDIS_CACHE',
  },
  PASSWORD_RESET: {
    description: 'Forgot/reset password flow',
    defaultValue: true,
    envVar: 'FF_PASSWORD_RESET',
  },
};

class FeatureFlags {
  private flags: Map<string, boolean>;

  constructor() {
    this.flags = new Map();
    this.loadFlags();
  }

  /**
   * Load flag values from environment variables, falling back to defaults.
   */
  private loadFlags(): void {
    for (const [name, config] of Object.entries(FLAG_DEFINITIONS)) {
      let value = config.defaultValue;

      if (config.envVar && process.env[config.envVar] !== undefined) {
        value = process.env[config.envVar] === 'true';
      }

      this.flags.set(name, value);
    }

    const enabled = Array.from(this.flags.entries())
      .filter(([, v]) => v)
      .map(([k]) => k);
    logger.info(`Feature flags loaded: ${enabled.join(', ') || 'none'}`);
  }

  /**
   * Check if a feature flag is enabled.
   */
  isEnabled(flagName: string): boolean {
    const value = this.flags.get(flagName);
    if (value === undefined) {
      logger.warn(`Unknown feature flag: ${flagName}`);
      return false;
    }
    return value;
  }

  /**
   * Get all flag states (useful for admin endpoints or debugging).
   */
  getAllFlags(): Record<string, { enabled: boolean; description: string }> {
    const result: Record<string, { enabled: boolean; description: string }> = {};
    for (const [name, config] of Object.entries(FLAG_DEFINITIONS)) {
      result[name] = {
        enabled: this.flags.get(name) ?? config.defaultValue,
        description: config.description,
      };
    }
    return result;
  }

  /**
   * Override a flag at runtime (useful in tests).
   */
  setFlag(flagName: string, value: boolean): void {
    this.flags.set(flagName, value);
    logger.info(`Feature flag '${flagName}' set to ${value}`);
  }
}

export const featureFlags = new FeatureFlags();
