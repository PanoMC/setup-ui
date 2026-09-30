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
                    <!-- The Pano Host mark (Pano Backup is a Pano Host service), as on panomc.com/host. -->
                    <div
                      class="d-inline-flex align-items-center justify-content-center bg-info rounded"
                      style="width: 24px; height: 24px;">
                      <img
                        src="/assets/img/logo.svg"
                        width="16"
                        height="16"
                        alt="Pano Host" />
                    </div>
                    <h5 class="mb-0">{$_("import.pano-host.title")}</h5>
                    <span class="badge text-bg-primary"
                      >{$_("import.pano-host.badge")}</span>
                  </div>
                  <div class="text-body-secondary mt-2 fw-normal">
                    {$_("import.pano-host.description", {
                      values: { website },
                    })}
                  </div>
                </div>
                <i
                  class="fa-solid fa-cloud-arrow-down text-body-secondary align-self-center fs-5"
                ></i>
              </button>

              <!-- Move a Pano Host instance here (its export, downloaded and restored). -->
              <button
                type="button"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-start p-3"
                onclick={openMove}>
                <div class="me-auto text-start">
                  <div class="d-flex align-items-center gap-2">
                    <div
                      class="d-inline-flex align-items-center justify-content-center bg-info rounded"
                      style="width: 24px; height: 24px;">
                      <img
                        src="/assets/img/logo.svg"
                        width="16"
                        height="16"
                        alt="Pano Host" />
                    </div>
                    <h5 class="mb-0">{$_("import.move.title")}</h5>
                  </div>
                  <div class="text-body-secondary mt-2 fw-normal">
                    {$_("import.move.description")}
                  </div>
                </div>
                <i
                  class="fa-solid fa-right-left text-body-secondary align-self-center fs-5"
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
          {:else if step === "file" || step === "host" || step === "move"}
            <button
              type="button"
              class="btn btn-link text-decoration-none p-0 hstack gap-2 align-self-start"
              onclick={back}>
              <i class="fa-solid fa-arrow-left"></i>
              <span>{$_("buttons.back")}</span>
            </button>

            {#if step === "file"}
              <!-- Same as the panel's restore dialog: drop zone, then the picked file as a card. -->
              <div class="vstack gap-2">
                {#if file}
                  <div
                    class="d-flex align-items-center gap-3 border rounded p-3">
                    <i
                      class="fa-solid {fileKind === 'passphrase'
                        ? 'fa-file-shield'
                        : 'fa-file-zipper'} fa-2x text-body-secondary"
                      aria-hidden="true"></i>
                    <div class="vstack min-w-0">
                      <span class="text-truncate">{file.name}</span>
                      <span class="small text-body-secondary">
                        {formatBytes(file.size)}
                        {#if fileKind === "passphrase"}
                          · <i class="fa-solid fa-lock" aria-hidden="true"></i>
                          {$_("import.file.encrypted-short")}
                        {:else if fileKind === "plain"}
                          · {$_("import.file.plain-short")}
                        {/if}
                      </span>
                    </div>
                    <button
                      type="button"
                      class="btn btn-link btn-sm ms-auto"
                      aria-label={$_("import.file.change")}
                      title={$_("import.file.change")}
                      disabled={submitting}
                      onclick={clearFile}>
                      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                  </div>
                {:else}
                  <DragAndDropZone
                    id="restoreFile"
                    accept={[".panoarc", ".zip"]}
                    style="min-height: 9rem;"
                    icon="fa-solid fa-file-arrow-up fa-2x"
                    title={$_("import.file.drop")}
                    subtitle={$_("import.file.label")}
                    ondrop={(picked) => void pickFile(picked)}
                    onerror={() => (fileRejected = true)} />
                {/if}
                {#if fileRejected || fileKind === "unknown"}
                  <div class="text-danger small">
                    {$_("import.file.unknown")}
                  </div>
                {:else if fileKind === "workload"}
                  <div class="text-danger small">
                    {$_("import.file.workload", { values: { website } })}
                  </div>
                {/if}
              </div>
            {:else if step === "move"}
              {#if moveState === "checking"}
                <div class="text-center py-3">
                  <span
                    class="spinner-border spinner-border-sm"
                    aria-hidden="true"></span>
                </div>
              {:else if moveState === "connect"}
                <p class="mb-0 text-body-secondary">
                  {$_("import.move.intro", { values: { website } })}
                </p>
              {:else}
                <div class="vstack gap-2">
                  <div class="small text-success">
                    <i class="fa-solid fa-circle-check me-1"></i>{$_(
                      "import.host.linked",
                      { values: { website, username: accountName } },
                    )}
                  </div>

                  {#if instances.length === 0}
                    <div class="alert alert-secondary mb-0">
                      {$_("import.move.none")}
                    </div>
                  {:else}
                    <div class="list-group">
                      {#each instances as instance (instance.id)}
                        <label
                          class="list-group-item d-flex gap-2 align-items-start"
                          class:opacity-50={!instance.exportable}>
                          <input
                            class="form-check-input mt-1"
                            type="radio"
                            name="panoHostInstance"
                            value={instance.id}
                            disabled={!instance.exportable}
                            bind:group={selectedInstanceId} />
                          <span class="vstack">
                            <span class="fw-semibold"
                              >{instance.name ||
                                instance.label ||
                                instance.id}</span>
                            <span class="small text-body-secondary">
                              {instance.label || instance.id}
                            </span>
                            {#if !instance.exportable}
                              <span class="small text-danger">
                                {$_(`import.move.reasons.${instance.reason}`, {
                                  default: $_("import.move.reasons.STATE"),
                                })}
                              </span>
                            {/if}
                          </span>
                        </label>
                      {/each}
                    </div>
                    <div class="small text-body-secondary">
                      {$_("import.move.note")}
                    </div>
                  {/if}
                </div>
              {/if}
            {:else if hostState === "checking"}
              <div class="text-center py-3">
                <span
                  class="spinner-border spinner-border-sm"
                  aria-hidden="true"></span>
              </div>
            {:else if hostState === "connect"}
              <!-- Not connected yet: the same connect flow as the last setup step; the dialog
                   opens here again when the website sends the owner back. -->
              <div class="vstack gap-2">
                <p class="mb-0 text-body-secondary">
                  {$_("import.host.intro", { values: { website } })}
                </p>
              </div>
            {:else}
              <div class="vstack gap-2">
                <div class="small text-success">
                  <i class="fa-solid fa-circle-check me-1"></i>{$_(
                    "import.host.linked",
                    { values: { website, username: accountName } },
                  )}
                </div>

                {#if backups.length === 0}
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
                  bind:this={passphraseInput}
                  bind:value={passphrase} />
                <label for="restorePassphrase">{$_("import.passphrase")}</label>
              </div>
              {#if step === "host"}
                <div class="form-text mt-0">
                  {$_("import.host.passphrase-hint")}
                </div>
              {/if}
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
              {$_(error.key, { values: { code: error.code, website } })}
            </div>
          {/if}
        </div>

        {#if step === "file" || step === "host" || step === "move"}
          <div class="modal-footer">
            {#if (step === "host" && hostState !== "linked") || (step === "move" && moveState !== "linked")}
              <button
                type="button"
                class="btn btn-primary w-100"
                disabled={(step === "move" ? moveState : hostState) ===
                  "checking" || connecting}
                onclick={connect}>
                {#if connecting}
                  <span
                    class="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"></span>
                  {$_("buttons.connecting")}
                {:else}
                  <i class="fa-solid fa-link me-2" aria-hidden="true"></i>
                  {$_("import.host.connect", { values: { website } })}
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
                {step === "move"
                  ? $_("import.move.submit")
                  : $_("import.restore")}
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<script>
  import { tick } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { _ } from "svelte-i18n";

  import DragAndDropZone from "$lib/components/DragAndDropZone.svelte";

  import ApiUtil, { NETWORK_ERROR } from "$lib/api.util.js";
  import { currentLanguage } from "$lib/language.util";
  import { PANO_WEBSITE_URL } from "$lib/variables.js";
  import {
    archiveKind,
    databaseProblem,
    describeError,
    formatBytes,
    inspectArchiveFile,
    jobPercent,
    websiteHost,
  } from "$lib/restore.util.js";

  /**
   * `initialStep`: "host" reopens the dialog on Pano Backup, e.g. when the website sends the owner
   * back from connecting their account; `initialError` shows why that connect did not work.
   */
  let {
    open = $bindable(false),
    initialStep = "selection",
    initialError = null,
  } = $props();

  /** Where the dialog asks the setup page to reopen it on Pano Backup after the connect round trip. */
  const REOPEN_KEY = "pano-setup-transfer";

  const website = websiteHost(PANO_WEBSITE_URL);

  /** @type {"selection" | "file" | "host" | "running" | "done"} */
  let step = $state("selection");
  /** Where a failed restore goes back to. */
  let source = $state("file");
  let error = $state(null);
  let submitting = $state(false);

  let file = $state(null);
  /** @type {"plain" | "passphrase" | "workload" | "unknown" | null} */
  let fileKind = $state(null);
  /** The dropped file was not a .panoarc / .zip at all. */
  let fileRejected = $state(false);
  /** @type {HTMLInputElement | undefined} */
  let passphraseInput = $state();
  let passphrase = $state("");
  let database = $state({ host: "", dbName: "", username: "", password: "" });

  /** Pano Backup: asking the account, not connected yet, or connected with its backups listed. */
  /** @type {"checking" | "connect" | "linked"} */
  let hostState = $state("checking");
  let connecting = $state(false);
  let accountName = $state("");
  let backups = $state([]);
  let selectedBackupId = $state(null);

  /** Moving from Pano Host: the same connect step, then the account's instances. */
  /** @type {"checking" | "connect" | "linked"} */
  let moveState = $state("checking");
  let instances = $state([]);
  let selectedInstanceId = $state(null);

  let uploadProgress = $state(null);
  let job = $state(null);

  let timer = null;

  const locked = $derived(step === "running" || step === "done");
  const needsPassphrase = $derived(
    (step === "file" && fileKind === "passphrase") ||
      (step === "host" && hostState === "linked" && backups.length > 0),
  );
  const showDatabase = $derived(
    (step === "file" && (fileKind === "plain" || fileKind === "passphrase")) ||
      (step === "host" && hostState === "linked" && backups.length > 0) ||
      (step === "move" && moveState === "linked" && !!selectedInstanceId),
  );
  // A Pano Backup may be plain (a passphrase is recommended, not required) and the list does not
  // say which, so its passphrase is optional: an encrypted one without it fails with its own error.
  const canRestore = $derived(
    databaseProblem(database) === null &&
      (step === "file"
        ? fileKind === "plain" ||
          (fileKind === "passphrase" && passphrase.length > 0)
        : step === "move"
          ? !!selectedInstanceId
          : !!selectedBackupId),
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
    fileRejected = false;
    passphrase = "";
    hostState = "checking";
    connecting = false;
    accountName = "";
    backups = [];
    selectedBackupId = null;
    moveState = "checking";
    instances = [];
    selectedInstanceId = null;
    uploadProgress = null;
    job = null;
  }

  // Fresh dialog on every open (on `initialStep`); timers never outlive it.
  $effect(() => {
    if (open) {
      reset();

      if (initialStep === "host") openHost();
      if (initialStep === "move") openMove();
      if (initialError) error = initialError;
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

  function fail(body) {
    submitting = false;
    error = describeError(body && body.error ? body : { error: NETWORK_ERROR });
  }

  /**
   * Reads the start of the chosen archive: an encrypted one asks for its passphrase right away,
   * anything that is not a Pano backup is refused before it is uploaded.
   *
   * @param {File} picked
   */
  async function pickFile(picked) {
    error = null;
    file = picked;
    fileKind = null;
    fileRejected = false;

    try {
      fileKind = archiveKind(await inspectArchiveFile(picked));
    } catch {
      fileKind = "unknown";
    }

    if (fileKind === "passphrase") {
      await tick();
      passphraseInput?.focus();
    }
  }

  function clearFile() {
    file = null;
    fileKind = null;
    fileRejected = false;
    passphrase = "";
    error = null;
  }

  /** Pano Backup: lists the connected account's backups, or offers to connect one. */
  function openHost() {
    step = "host";
    hostState = "checking";
    error = null;

    ApiUtil.get({ path: "/api/setup/pano-host/backups" })
      .then((body) => {
        if (step !== "host") return;

        if (body.result === "ok") {
          accountName = body.account?.username || "";
          backups = [...(body.backups || [])].sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
          );
          selectedBackupId = backups[0]?.id ?? null;
          hostState = "linked";
        } else if (body.hostError === "CONNECT_REQUIRED") {
          hostState = "connect";
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

  /** Pano Host: the account's instances (the exportable one preselected), or the connect step. */
  function openMove() {
    step = "move";
    moveState = "checking";
    error = null;

    ApiUtil.get({ path: "/api/setup/pano-host/instances" })
      .then((body) => {
        if (step !== "move") return;

        if (body.result === "ok") {
          accountName = body.account?.username || "";
          instances = body.workloads || [];
          selectedInstanceId =
            instances.find((instance) => instance.exportable)?.id ?? null;
          moveState = "linked";
        } else {
          moveState = "connect";
          if (body.hostError !== "CONNECT_REQUIRED") fail(body);
        }
      })
      .catch(() => {
        moveState = "connect";
        fail(null);
      });
  }

  /**
   * Connects the panomc.com account like the last setup step does: a key from Pano, then the
   * website's sign-in, which sends the owner back to this page. The setup page reopens this dialog
   * on Pano Backup then (see Beginning.svelte).
   */
  function connect() {
    error = null;
    connecting = true;

    ApiUtil.post({ path: "/api/setup/steps/4/platform/code" })
      .then((body) => {
        if (body.error) {
          connecting = false;
          fail(body);
          return;
        }

        try {
          // Reopen on the step that asked (Pano Backup or Pano Host).
          sessionStorage.setItem(REOPEN_KEY, step === "move" ? "move" : "host");
        } catch {
          // blocked storage: the account still connects, the dialog just does not reopen itself
        }

        const redirectUrl = encodeURIComponent(
          window.location.origin + window.location.pathname,
        );

        window.location.href = `${PANO_WEBSITE_URL}/auth?loginPanoPlatform=${encodeURIComponent(body.publicKey)}&redirectUrl=${redirectUrl}&state=${encodeURIComponent(body.state)}&hl=${$currentLanguage.locale}`;
      })
      .catch(() => {
        connecting = false;
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
    } else if (step === "move") {
      step = "running";

      ApiUtil.post({
        path: `/api/setup/pano-host/instances/${encodeURIComponent(selectedInstanceId)}/move`,
        body: target,
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
