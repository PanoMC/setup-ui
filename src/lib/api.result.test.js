import { describe, expect, test } from "bun:test";

import { isOk } from "./api.result.js";

describe("isOk", () => {
  test("a plain object body is a success", () => {
    expect(isOk({})).toBe(true);
    expect(isOk({ database: { host: "localhost" } })).toBe(true);
  });

  test("an error envelope is not", () => {
    expect(isOk({ error: { code: "INVALID_DATA" } })).toBe(false);
  });

  test("a proxy page or an empty reply is not", () => {
    expect(isOk("<html>502</html>")).toBe(false);
    expect(isOk(undefined)).toBe(false);
    expect(isOk(null)).toBe(false);
  });
});
