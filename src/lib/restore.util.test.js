import { describe, expect, test } from "bun:test";

import {
  ENVELOPE_MAGIC,
  archiveKind,
  databaseProblem,
  describeError,
  formatBytes,
  inspectArchiveFile,
  inspectArchiveHeader,
  jobPercent,
  pollDelay,
} from "./restore.util.js";

/** @param {object} header */
function envelope(header, { cut = 0 } = {}) {
  const json = new TextEncoder().encode(JSON.stringify(header));
  const bytes = new Uint8Array(ENVELOPE_MAGIC.length + 4 + json.length + 16);

  bytes.set(ENVELOPE_MAGIC, 0);
  new DataView(bytes.buffer).setUint32(
    ENVELOPE_MAGIC.length,
    json.length,
    false,
  );
  bytes.set(json, ENVELOPE_MAGIC.length + 4);

  return cut ? bytes.slice(0, cut) : bytes;
}

describe("archive sniffing", () => {
  test("a passphrase envelope asks for the passphrase", () => {
    const info = inspectArchiveHeader(
      envelope({ alg: "AES-256-GCM-STREAM", keyMode: "passphrase" }),
    );

    expect(info).toEqual({ type: "encrypted", keyMode: "passphrase" });
    expect(archiveKind(info)).toBe("passphrase");
  });

  test("a Pano Host instance-key archive is refused", () => {
    expect(
      archiveKind(inspectArchiveHeader(envelope({ keyMode: "workload" }))),
    ).toBe("workload");
  });

  test("a cut-off header still counts as a passphrase archive", () => {
    const info = inspectArchiveHeader(
      envelope({ keyMode: "workload" }, { cut: 14 }),
    );

    expect(info).toEqual({ type: "encrypted", keyMode: null });
    expect(archiveKind(info)).toBe("passphrase");
  });

  test("a zip is a plain export, anything else is unknown", () => {
    expect(archiveKind(inspectArchiveHeader([0x50, 0x4b, 3, 4, 20]))).toBe(
      "plain",
    );
    expect(
      archiveKind(
        inspectArchiveHeader(new TextEncoder().encode("hello world")),
      ),
    ).toBe("unknown");
    expect(archiveKind(inspectArchiveHeader(null))).toBe("unknown");
  });

  test("a garbage header length does not throw", () => {
    const bytes = envelope({ keyMode: "passphrase" });

    new DataView(bytes.buffer).setUint32(
      ENVELOPE_MAGIC.length,
      0xffffffff,
      false,
    );
    expect(inspectArchiveHeader(bytes)).toEqual({
      type: "encrypted",
      keyMode: null,
    });
  });

  test("inspectArchiveFile reads a Blob", async () => {
    const info = await inspectArchiveFile(
      new Blob([envelope({ keyMode: "passphrase" })]),
    );

    expect(info.keyMode).toBe("passphrase");
  });
});

describe("helpers", () => {
  test("job percent", () => {
    expect(jobPercent({ bytesDone: 50, bytesTotal: 200 })).toBe(25);
    expect(jobPercent({ bytesDone: 500, bytesTotal: 200 })).toBe(100);
    expect(jobPercent({ bytesDone: 5 })).toBeNull();
    expect(jobPercent(null)).toBeNull();
  });

  test("poll delay stays between 2 and 30 s", () => {
    expect(pollDelay(5)).toBe(5000);
    expect(pollDelay(0)).toBe(5000);
    expect(pollDelay(1)).toBe(2000);
    expect(pollDelay(600)).toBe(30000);
    expect(pollDelay(undefined)).toBe(5000);
  });

  test("bytes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(64 * 1024 * 1024)).toBe("64 MB");
  });

  test("the target database needs host, name and user", () => {
    expect(
      databaseProblem({ host: " ", dbName: "pano", username: "root" }),
    ).toBe("host");
    expect(
      databaseProblem({ host: "localhost", dbName: "", username: "root" }),
    ).toBe("dbName");
    expect(
      databaseProblem({ host: "localhost", dbName: "pano", username: "" }),
    ).toBe("username");
    expect(
      databaseProblem({
        host: "localhost",
        dbName: "pano",
        username: "root",
        password: "",
      }),
    ).toBeNull();
  });

  test("errors map to lang keys, Pano Host errors are unwrapped", () => {
    expect(describeError({ error: "WRONG_PASSPHRASE" })).toEqual({
      code: "WRONG_PASSPHRASE",
      key: "import.errors.WRONG_PASSPHRASE",
    });
    expect(
      describeError({ error: "PANO_HOST_ERROR", hostError: "PAYMENT_REQUIRED" })
        .key,
    ).toBe("import.errors.PAYMENT_REQUIRED");
    expect(describeError({ error: "PANO_HOST_ERROR" }).code).toBe(
      "PANO_HOST_UNAVAILABLE",
    );
    expect(describeError({ error: "SOMETHING_NEW" })).toEqual({
      code: "SOMETHING_NEW",
      key: "import.errors.generic",
    });
    expect(describeError({ result: "ok" })).toBeNull();
  });
});
