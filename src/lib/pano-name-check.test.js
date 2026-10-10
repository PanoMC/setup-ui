import { expect, test } from "bun:test";

import {
  createNameChecker,
  nameCheckBlocks,
  nameCheckClass,
  nameCheckMessage,
  parseNameCheck,
} from "./pano-name-check.js";

/** Manual timers: `run()` fires the pending callback. */
function fakeTimers() {
  let callback = null;
  return {
    setTimeout: (fn) => ((callback = fn), 1),
    clearTimeout: () => (callback = null),
    run: async () => {
      const fn = callback;
      callback = null;
      fn?.();
      await new Promise((resolve) => setTimeout(resolve, 0));
    },
    get armed() {
      return callback !== null;
    },
  };
}

function setup(check, initialName = "mine") {
  const timers = fakeTimers();
  const states = [];
  const checker = createNameChecker({
    check,
    initialName,
    timers,
    onChange: (s) => states.push(s),
  });
  return { timers, states, checker };
}

test("typing waits for the debounce and asks once, with the lowercased name", async () => {
  const asked = [];
  const { timers, states, checker } = setup(async (n) => {
    asked.push(n);
    return { status: "AVAILABLE" };
  });

  checker.input("Pa");
  checker.input("Pano");
  expect(asked).toEqual([]);
  expect(states.at(-1).pending).toBe(true);

  await timers.run();
  expect(asked).toEqual(["pano"]);
  expect(states.at(-1)).toMatchObject({ pending: false, status: "AVAILABLE" });
});

test("empty and prefilled names are not checked", () => {
  const asked = [];
  const { timers, states, checker } = setup(async (n) => asked.push(n));

  checker.input("");
  checker.input("Mine");
  expect(timers.armed).toBe(false);
  expect(states.every((s) => !s.pending && s.status === null)).toBe(true);
});

test("a stale answer is ignored", async () => {
  const resolvers = [];
  const { timers, states, checker } = setup(
    (n) => new Promise((resolve) => resolvers.push([n, resolve])),
  );

  checker.input("one");
  await timers.run();
  checker.input("two");
  resolvers[0][1]({ status: "TAKEN" });
  await new Promise((resolve) => setTimeout(resolve, 0));

  expect(states.at(-1)).toMatchObject({ name: "two", pending: true });
});

test("a failing check is UNKNOWN and never blocks", async () => {
  const { timers, states, checker } = setup(async () => {
    throw new Error("404");
  });

  checker.input("pano");
  await timers.run();
  expect(states.at(-1).status).toBe("UNKNOWN");
  expect(nameCheckBlocks(states.at(-1))).toBe(false);
  expect(nameCheckClass(states.at(-1))).toBe("");
});

test("states, classes and messages", () => {
  const taken = { ...parseNameCheck({ status: "TAKEN" }), pending: false };
  const length = {
    ...parseNameCheck({
      status: "INVALID",
      reason: "length",
      minLength: 3,
      maxLength: 32,
    }),
    pending: false,
  };
  const other = {
    ...parseNameCheck({ status: "INVALID", reason: "chars" }),
    pending: false,
  };
  const ok = { ...parseNameCheck({ status: "CURRENT" }), pending: false };

  expect(nameCheckMessage(taken)).toEqual({ key: "PANO_MAIL_NAME_TAKEN" });
  expect(nameCheckMessage(length)).toEqual({
    key: "PANO_MAIL_NAME_LENGTH",
    props: { min: 3, max: 32 },
  });
  expect(nameCheckMessage(other)).toEqual({ key: "PANO_MAIL_NAME_INVALID" });
  expect(nameCheckMessage(ok)).toBeNull();
  expect(nameCheckClass(ok)).toBe("is-valid");
  expect(nameCheckClass(taken)).toBe("is-invalid");
  expect(nameCheckBlocks(taken)).toBe(true);
  expect(nameCheckBlocks({ ...ok, pending: true })).toBe(true);
  expect(parseNameCheck({ status: "WHAT" }).status).toBe("UNKNOWN");
});
