import { describe, expect, it } from "vitest";

import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("escapes commas, quotes, and newlines", () => {
    const csv = toCsv([
      { a: 'hello, "world"\nnext' },
      { a: "plain" },
    ]);

    expect(csv).toContain('"hello, ""world""\nnext"');
    expect(csv).toContain("plain");
  });
});

