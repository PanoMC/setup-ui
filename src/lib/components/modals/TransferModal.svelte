<style>
  .host-item-gradient {
    background: linear-gradient(
      135deg,
      rgba(var(--bs-primary-rgb), 0.12) 0%,
      rgba(var(--bs-info-rgb), 0.12) 100%
    ) !important;
    border: 1px solid rgba(var(--bs-primary-rgb), 0.25) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .host-item-gradient:hover {
    background: linear-gradient(
      135deg,
      rgba(var(--bs-primary-rgb), 0.2) 0%,
      rgba(var(--bs-info-rgb), 0.2) 100%
    ) !important;
    border-color: rgba(var(--bs-primary-rgb), 0.45) !important;
    box-shadow: 0 4px 15px rgba(var(--bs-primary-rgb), 0.15) !important;
  }
  .form-floating:focus-within {
    z-index: 5;
    position: relative;
  }
</style>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    transition:fade={{ duration: 150 }}
    class="modal-backdrop fade show"
    onclick={close}>
  </div>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    transition:fade={{ duration: 150 }}
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.5);"
    onclick={(e) => e.target === e.currentTarget && close()}>
    <div
      in:fly={{ y: -50, duration: 300 }}
      out:fly={{ y: -50, duration: 150 }}
      class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content text-start">
        <div class="modal-header">
          <h5 class="modal-title">{$_("import.modal-title")}</h5>
          {#if !locked}
            <button
              type="button"
              class="btn-close"
              aria-label={$_("buttons.close")}
              onclick={close}></button>
          {/if}
        </div>

        <div class="modal-body vstack gap-3">
          {#if step === "selection"}
            <div class="list-group">
              <button
                type="button"
                class="list-group-item list-group-item-action host-item-gradient d-flex justify-content-between align-items-start p-3"
                onclick={openHost}>
                <div class="me-auto text-start">
                  <div class="d-flex align-items-center gap-2">
                    <div
                      class="d-inline-flex align-items-center justify-content-center bg-primary rounded"
                      style="width: 24px; height: 24px;">
                      <img
                        src="/assets/img/logo.svg"
                        width="16"
                        height="16"
                        alt="Pano" />
                    </div>
                    <h5 class="mb-0">{$_("import.pano-host.title")}</h5>
                    <span class="badge text-bg-primary"
                      >{$_("import.pano-host.badge")}</span>
                  </div>
                  <div class="text-body-secondary mt-2 fw-normal">
                    {$_("import.pano-host.description")}
                  </div>
                </div>
                <i
                  class="fa-solid fa-cloud-arrow-down text-body-secondary align-self-center fs-5"
                ></i>
              </button>

              <button
                type="button"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-start p-3"
                onclick={() => (step = "file")}>
                <div class="me-auto text-start">
                  <h5 class="mb-0">{$_("import.other-pano.title")}</h5>
                  <div class="text-body-secondary mt-1 fw-normal">
                    {$_("import.other-pano.description")}
                  </div>
                </div>
                <i
                  class="fa-solid fa-file-import text-body-secondary align-self-center fs-5"
                ></i>
              </button>
            </div>
          {:else if step === "file" || step === "host"}
            <button
              type="button"
              class="btn btn-link text-decoration-none p-0 hstack gap-2 align-self-start"
              onclick={back}>
              <i class="fa-solid fa-arrow-left"></i>
              <span>{$_("buttons.back")}</span>
            </button>

            {#if step === "file"}
              <div>
                <label class="form-label" for="restoreFile"
                  >{$_("import.file.label")}</label>
                <input
                  class="form-control"
                  id="restoreFile"
                  type="file"
                  accept=".panoarc,.zip"
                  onchange={pickFile} />
                {#if fileKind === "plain"}
                  <div class="form-text">{$_("import.file.plain")}</div>
                {:else if fileKind === "passphrase"}
                  <div class="form-text">{$_("import.file.encrypted")}</div>
                {:else if fileKind === "workload"}
                  <div class="text-danger small mt-1">
                    {$_("import.file.workload")}
                  </div>
                {:else if fileKind === "unknown"}
                  <div class="text-danger small mt-1">
                    {$_("import.file.unknown")}
                  </div>
                {/if}
              </div>
            {:else if hostState !== "connected"}
              <div class="vstack gap-2">
                <p class="mb-0 text-body-secondary">
                  {#if hostState === "reconnect"}
                    {$_("import.host.reconnect")}
                  {:else}
                    {$_("import.host.intro")}
                  {/if}
                </p>

                {#if hostState === "checking" || hostState === "finishing"}
                  <div
                    class="small text-body-secondary hstack gap-2 justify-content-center py-2">
                    <span
                      class="spinner-border spinner-border-sm"
                      aria-hidden="true"></span>
                    {hostState === "finishing"
                      ? $_("import.host.finishing")
                      : $_("import.host.checking")}
                  </div>
                {/if}
              </div>
            {:else}
              <div class="vstack gap-2">
                <div class="small text-success">
                  <i class="fa-solid fa-circle-check me-1"></i>{accountName
                    ? $_("import.host.connected-as", {
                        values: { username: accountName },
                      })
                    : $_("import.host.connected")}
                </div>

                {#if backupsLoading}
                  <div class="text-center py-2">
                    <span
                      class="spinner-border spinner-border-sm"
                      aria-hidden="true"></span>
                  </div>
                {:else if backups.length === 0}
                  <div class="alert alert-secondary mb-0">
                    {$_("import.host.no-backups")}
                  </div>
                {:else}
                  <div class="list-group">
                    {#each backups as backup (backup.id)}
                      <label
                        class="list-group-item d-flex gap-2 align-items-start">
                        <input
                          class="form-check-input mt-1"
                          type="radio"
                          name="panoBackup"
                          value={backup.id}
                          bind:group={selectedBackupId} />
                        <span class="vstack">
                          <span class="fw-semibold"
                            >{backup.instanceName || "Pano"}</span>
                          <span class="small text-body-secondary">
                            {new Date(
                              backup.finishedAt || backup.createdAt,
                            ).toLocaleString()}
                            · {formatBytes(backup.sizeBytes)}
                          </span>
                        </span>
                      </label>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}

            {#if needsPassphrase}
              <div class="form-floating">
                <input
                  class="form-control"
                  id="restorePassphrase"
                  type="password"
                  autocomplete="off"
                  placeholder={$_("import.passphrase")}
                  bind:value={passphrase} />
                <label for="restorePassphrase">{$_("import.passphrase")}</label>
              </div>
            {/if}

            {#if showDatabase}
              <fieldset class="vstack gap-2">
                <legend class="fs-6 mb-0">{$_("import.database.title")}</legend>
                <div class="small text-body-secondary">
                  {$_("import.database.description")}
                </div>
                <div class="row g-2">
                  <div class="col-7 form-floating">
                    <input
                      class="form-control"
                      id="restoreDbHost"
                      placeholder="localhost:3306"
                      bind:value={database.host} />
                    <label for="restoreDbHost"
                      >{$_("steps.database.inputs.address")}</label>
                  </div>
                  <div class="col-5 form-floating">
                    <input
                      class="form-control"
                      id="restoreDbName"
                      placeholder="pano"
                      bind:value={database.dbName} />
                    <label for="restoreDbName"
                      >{$_("steps.database.inputs.name")}</label>
                  </div>
                  <div class="col-6 form-floating">
                    <input
                      class="form-control"
                      id="restoreDbUser"
                      autocomplete="off"
                      placeholder="root"
                      bind:value={database.username} />
                    <label for="restoreDbUser"
                      >{$_("steps.database.inputs.username")}</label>
                  </div>
                  <div class="col-6 form-floating">
                    <input
                      class="form-control"
                      id="restoreDbPassword"
                      type="password"
                      autocomplete="off"
                      placeholder="password"
                      bind:value={database.password} />
                    <label for="restoreDbPassword"
                      >{$_("steps.database.inputs.password")}</label>
                  </div>
                </div>
              </fieldset>

              <div class="alert alert-warning small mb-0">
                <i class="fa-solid fa-triangle-exclamation me-1"></i>{$_(
                  "import.restore-warning",
                )}
              </div>
            {/if}
          {:else if step === "running"}
            <div class="vstack gap-2 py-2">
              <div class="fw-semibold">{$_("import.progress.title")}</div>
              <div class="small text-body-secondary">{phaseText}</div>
              <div
                class="progress"
                role="progressbar"
                aria-valuenow={percent ?? 0}
                aria-valuemin="0"
                aria-valuemax="100">
                <div
                  class="progress-bar"
                  class:progress-bar-striped={percent === null}
                  class:progress-bar-animated={percent === null}
                  style="width: {percent ?? 100}%">
                </div>
              </div>
              <div class="small text-body-secondary">
                {$_("import.progress.keep-open")}
              </div>
            </div>
          {:else if step === "done"}
            <div class="vstack gap-2 py-2 text-center">
              <i class="fa-solid fa-circle-check text-success fs-1"></i>
              <div class="fw-semibold">{$_("import.done.title")}</div>
              <div class="small text-body-secondary">
                {$_("import.done.description")}
              </div>
              <div class="small text-body-secondary">
                {$_("import.done.manual")}
              </div>
              <a class="btn btn-primary align-self-center" href="/"
                >{$_("import.done.open")}</a>
            </div>
          {/if}

          {#if error}
            <div
              class="alert alert-danger mb-0"
              transition:slide={{ duration: 150 }}>
              <i class="fa-solid fa-triangle-exclamation me-2"></i>
              {$_(error.key, { values: { code: error.code } })}
            </div>
          {/if}
        </div>

        {#if step === "file" || step === "host"}
          <div class="modal-footer">
            {#if step === "host" && hostState !== "connected"}
              <button
                type="button"
                class="btn btn-primary w-100"
                disabled={hostState !== "connect" &&
                  hostState !== "reconnect" &&
                  hostState !== "failed"}
                onclick={hostState === "failed" ? loadBackups : connect}>
                {#if hostState === "redirecting" || hostState === "finishing"}
                  <span
                    class="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"></span>
                  {$_("buttons.connecting")}
                {:else if hostState === "failed"}
                  {$_("import.host.retry")}
                {:else if hostState === "reconnect"}
                  {$_("import.host.reconnect-button")}
                {:else}
                  {$_("import.host.connect")}
                {/if}
              </button>
            {:else}
              <button
                type="button"
                class="btn btn-primary w-100"
                disabled={!canRestore || submitting}
                onclick={restore}>
                {#if submitting}
                  <span
                    class="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"></span>
                {/if}
                {$_("import.restore")}
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<script>
  import { fade, fly, slide } from "svelte/transition";
  import { _ } from "svelte-i18n";

  import { untrack } from "svelte";

  import ApiUtil, { NETWORK_ERROR } from "$lib/api.util.js";
  import { currentLanguage } from "$lib/language.util";
  import {
    connectNeeded,
    connectSucceeded,
    connectUrl,
  } from "$lib/panoHost.util.js";
  import { PANO_WEBSITE_URL } from "$lib/variables.js";
  import {
    archiveKind,
    databaseProblem,
    describeError,
    formatBytes,
    inspectArchiveFile,
    jobPercent,
  } from "$lib/restore.util.js";

  /**
   * `resume`: the panomc.com sign-in came back to the first page (`connectReturn`); the dialog opens
   * on "Pano Backup" and finishes the connection.
   */
  let { open = $bindable(false), resume = $bindable(null) } = $props();

  /** @type {"selection" | "file" | "host" | "running" | "done"} */
  let step = $state("selection");
  /** Where a failed restore goes back to. */
  let source = $state("file");
  let error = $state(null);
  let submitting = $state(false);

  let file = $state(null);
  /** @type {"plain" | "passphrase" | "workload" | "unknown" | null} */
  let fileKind = $state(null);
  let passphrase = $state("");
  let database = $state({ host: "", dbName: "", username: "", password: "" });

  /**
   * The platform connection (shared with setup step 4): "checking" the backups, "connect" /
   * "reconnect" needed, "redirecting" to panomc.com, "finishing" a returned sign-in, "connected",
   * or "failed" to list them (panomc.com unreachable, no plan, …; retry).
   * @type {"checking" | "connect" | "reconnect" | "redirecting" | "finishing" | "connected" | "failed"}
   */
  let hostState = $state("checking");
  let accountName = $state("");
  let backups = $state([]);
  let backupsLoading = $state(false);
  let selectedBackupId = $state(null);

  let uploadProgress = $state(null);
  let job = $state(null);

  let timer = null;

  const locked = $derived(step === "running" || step === "done");
  const needsPassphrase = $derived(
    (step === "file" && fileKind === "passphrase") ||
      (step === "host" && hostState === "connected" && backups.length > 0),
  );
  const showDatabase = $derived(
    (step === "file" && (fileKind === "plain" || fileKind === "passphrase")) ||
      (step === "host" && hostState === "connected" && backups.length > 0),
  );
  const canRestore = $derived(
    databaseProblem(database) === null &&
      (step === "file"
        ? fileKind === "plain" ||
          (fileKind === "passphrase" && passphrase.length > 0)
        : !!selectedBackupId && passphrase.length > 0),
  );
  const percent = $derived(
    job
      ? jobPercent(job)
      : uploadProgress === null
        ? null
        : Math.round(uploadProgress * 100),
  );
  const phaseText = $derived.by(() => {
    if (!job) return $_("import.progress.UPLOADING");

    const phase = job.phase || "RESTORING";

    return $_(`import.progress.${phase}`, {
      default: $_("import.progress.RESTORING"),
    });
  });

  function clearTimer() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  function schedule(fn, ms) {
    clearTimer();
    timer = setTimeout(fn, ms);
  }

  function reset() {
    clearTimer();
    step = "selection";
    error = null;
    submitting = false;
    file = null;
    fileKind = null;
    passphrase = "";
    hostState = "checking";
    accountName = "";
    backups = [];
    selectedBackupId = null;
    uploadProgress = null;
    job = null;
  }

  // Fresh dialog on every open; timers never outlive it.
  $effect(() => {
    if (open) {
      reset();

      const returned = untrack(() => resume);

      if (returned) {
        resume = null;
        finishConnect(returned);
      }
    }

    return clearTimer;
  });

  function close() {
    if (locked) return;

    clearTimer();
    open = false;
  }

  function back() {
    clearTimer();
    error = null;
    step = "selection";
  }

  function openHost() {
    error = null;
    step = "host";
    loadBackups();
  }

  function fail(body) {
    submitting = false;
    error = describeError(body && body.error ? body : { error: NETWORK_ERROR });
  }

  async function pickFile(event) {
    error = null;
    file = event.currentTarget.files?.[0] || null;
    fileKind = null;

    if (file) {
      try {
        fileKind = archiveKind(await inspectArchiveFile(file));
      } catch {
        fileKind = "unknown";
      }
    }
  }

  /** Same connect as setup step 4; panomc.com sends the browser back to the first page. */
  async function connect() {
    const reconnect = hostState === "reconnect";

    error = null;
    hostState = "redirecting";

    try {
      if (reconnect) {
        await ApiUtil.post({ path: "/api/setup/steps/4/platform/disconnect" });
      }

      const body = await ApiUtil.post({
        path: "/api/setup/steps/4/platform/code",
      });

      if (body.result !== "ok") {
        hostState = "connect";
        fail(body);
        return;
      }

      window.location.assign(
        connectUrl({
          websiteUrl: PANO_WEBSITE_URL,
          publicKey: body.publicKey,
          state: body.state,
          redirectUrl: window.location.origin + "/",
          locale: $currentLanguage.locale,
        }),
      );
    } catch {
      hostState = "connect";
      fail(null);
    }
  }

  /** @param {{ encodedData: string | null, state: string | null, failed: boolean }} returned */
  function finishConnect(returned) {
    step = "host";

    if (returned.failed) {
      hostState = "connect";
      fail({ error: "PANO_CONNECT_FAILED" });
      return;
    }

    hostState = "finishing";

    ApiUtil.post({
      path: "/api/setup/steps/4/platform/connect",
      body: { encodedData: returned.encodedData, state: returned.state },
    })
      .then((body) => {
        if (step !== "host") return;

        if (connectSucceeded(body)) {
          loadBackups();
        } else {
          hostState = "connect";
          fail(body);
        }
      })
      .catch(() => {
        hostState = "connect";
        fail(null);
      });
  }

  function loadBackups() {
    if (hostState !== "finishing") hostState = "checking";
    backupsLoading = true;

    ApiUtil.get({ path: "/api/setup/pano-host/backups" })
      .then((body) => {
        backupsLoading = false;
        if (step !== "host") return;

        if (body.result !== "ok") {
          const needed = connectNeeded(body);

          hostState = needed || "failed";
          if (!needed) fail(body);
          return;
        }

        hostState = "connected";
        accountName = body.account?.username || "";

        backups = [...(body.backups || [])].sort(
          (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
        );
        selectedBackupId = backups[0]?.id ?? null;
      })
      .catch(() => {
        backupsLoading = false;
        hostState = "failed";
        fail(null);
      });
  }

  function started(body) {
    submitting = false;

    if (body.result !== "ok") {
      step = source;
      fail(body);
      return;
    }

    job = body.job;
    schedule(pollJob, 2000);
  }

  function restore() {
    if (!canRestore || submitting) return;

    error = null;
    submitting = true;
    source = step;
    uploadProgress = null;
    job = null;

    const target = {
      host: database.host.trim(),
      dbName: database.dbName.trim(),
      username: database.username.trim(),
      password: database.password,
    };

    if (step === "file") {
      const form = new FormData();

      form.append("file", file);
      if (fileKind === "passphrase") form.append("passphrase", passphrase);
      Object.entries(target).forEach(([key, value]) => form.append(key, value));

      uploadProgress = 0;
      step = "running";

      ApiUtil.post({
        path: "/api/setup/restore",
        body: form,
        onUploadProgress: (value) => (uploadProgress = value),
      })
        .then(started)
        .catch(() => {
          step = source;
          fail(null);
        });
    } else {
      step = "running";

      ApiUtil.post({
        path: "/api/setup/pano-host/restore",
        body: { backupId: selectedBackupId, passphrase, ...target },
      })
        .then(started)
        .catch(() => {
          step = source;
          fail(null);
        });
    }
  }

  function finished() {
    clearTimer();
    step = "done";
    // Pano restarts a few seconds after the restore; the restored site answers on "/" then.
    schedule(() => window.location.assign("/"), 10000);
  }

  function pollJob() {
    ApiUtil.get({ path: "/api/setup/restore" })
      .then((body) => {
        const current = body?.job;

        if (!current) {
          // Pano already restarted into the restored site: the setup job is gone.
          if (job) finished();
          else schedule(pollJob, 2000);
          return;
        }

        job = current;

        if (current.status === "DONE") {
          finished();
        } else if (current.status === "FAILED") {
          step = source;
          error = describeError(current);
        } else {
          schedule(pollJob, 2000);
        }
      })
      // The restart makes the API briefly unreachable: keep polling.
      .catch(() => schedule(pollJob, 3000));
  }
</script>
