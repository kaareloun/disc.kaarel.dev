import "@total-typescript/ts-reset";

declare global {
  interface String {
    split(splitter: ""): string[];
    split(splitter: string): [string, ...string[]];
  }
}
