export interface Statement {
  bind(...values: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes?: number } }>;
}
export interface GiveawayDatabase {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<unknown[]>;
}
export interface GiveawayEnv {
  GIVEAWAY_DB?: GiveawayDatabase;
  GIVEAWAY_ENABLED?: string;
  TURNSTILE_SECRET_KEY?: string;
  MAILCHIMP_API_KEY?: string;
  MAILCHIMP_SERVER_PREFIX?: string;
  MAILCHIMP_GIVEAWAY_AUDIENCE_ID?: string;
  GIVEAWAY_ACCESS_TEAM?: string;
  GIVEAWAY_ACCESS_AUD?: string;
  GIVEAWAY_ADMIN_EMAILS?: string;
}
