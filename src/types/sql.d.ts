// drizzle-kit が生成する .sql を inline-import で文字列として取り込むための宣言
declare module '*.sql' {
  const content: string;
  export default content;
}
