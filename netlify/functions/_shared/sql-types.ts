/** Both Netlify SQL templates and local test adapters are awaitable. */
export type SqlDatabase = {
  sql: (strings: TemplateStringsArray, ...values: any[]) => PromiseLike<any[]>;
};
