declare module 'cron-parser' {
  // Minimal declarations to satisfy TypeScript in the dev environment.
  export type CronFieldCollection = any;
  export type DayOfWeekRange = number;

  export interface CronParserResult {
    fields: CronFieldCollection;
    next: () => Date;
  }

  const CronExpressionParser: {
    parse(expr: string): CronParserResult;
    // some code uses CronExpressionParser.parse(...).next() twice, so provide next
  };

  // The real package exposes a runtime value `CronFieldCollection` with helpers
  // like `from(...)` used by the codebase; declare a minimal value here so the
  // TypeScript checker is satisfied while developing without the npm package.
  export const CronFieldCollection: {
    from(fields: any, overrides?: any): { stringify(): string };
  };

  export default CronExpressionParser;
}
