<div class="animate__animated animate__fadeIn">
  <div>
    <div class="card-body vstack gap-3">
      <!-- Database Type Selection (Nav Pills) -->
      <ul class="nav nav-underline nav-fill">
        <li class="nav-item">
          <button
            type="button"
            class="nav-link"
            class:active={dbType === "portable"}
            class:disabled={!portableSupported}
            on:click={() => (dbType = "portable")}>
            {#if dbType === "portable"}
              <i class="fa fa-check me-2"></i>
            {/if}
            {$_("steps.database.databases.local-portable-db")}
          </button>
        </li>
        <li class="nav-item">
          <button
            type="button"
            class="nav-link"
            class:active={dbType === "mariadb"}
            on:click={() => (dbType = "mariadb")}>
            {#if dbType === "mariadb"}
              <i class="fa fa-check me-2"></i>
            {/if}
            {$_("steps.database.databases.mysql-or-mariadb")}
          </button>
        </li>
      </ul>

      <ErrorAlert error={error} />

      <!-- Selection Details / Context -->
      {#if dbType === "portable"}
        <div class="vstack gap-2">
          <small>
            {$_("steps.database.databases.local-portable-db-description")}
          </small>

          {#if !portableSupported}
            <div class="alert alert-warning mb-0 p-2 small">
              <i class="fa fa-exclamation-triangle me-2"></i>
              {$_("steps.database.databases.portable-not-supported")}
              <br />
              {$_("steps.database.databases.supported-systems", {
                values: { systems: supportedSystems.join(", ") },
              })}
            </div>
          {:else if !installed}
            <button
              type="button"
              class="btn btn-primary btn-sm mt-1"
              on:click={installPortableDB}
              disabled={installLoading}>
              {#if installLoading}
                <span
                  class="spinner-border spinner-border-sm me-2"
                  role="status"></span>
                {$_("steps.database.databases.installing")}...
                {#if installProgress > 0}
                  ({installProgress}%)
                {/if}
              {:else}
                <i class="fa fa-download me-2"></i>
                {$_("steps.database.databases.download-and-install")}
              {/if}
            </button>
          {:else}
            <div class="badge text-bg-success rounded-pill me-auto">
              <i class="fa fa-check-circle me-1"></i>
              {$_("steps.database.databases.portable-installed")}
            </div>
          {/if}
        </div>
      {:else}
        <small>
          {$_("steps.database.databases.mysql-or-mariadb-description")}
        </small>
      {/if}

      <!-- Manual Connection Fields -->
      <div class="row g-3" class:d-none={dbType === "portable"}>
        <div class="col-lg-6">
          <div class="form-floating">
            <input
              class="form-control"
              id="databaseAddress"
              placeholder="localhost:3306"
              bind:value={database.host}
              type="text" />
            <label for="databaseAddress"
              >{$_("steps.database.inputs.address")}</label>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="form-floating">
            <input
              class="form-control"
              id="databaseName"
              placeholder="pano"
              bind:value={database.dbName}
              type="text" />
            <label for="databaseName">{$_("steps.database.inputs.name")}</label>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="form-floating">
            <input
              class="form-control"
              id="databaseUserName"
              placeholder="root"
              bind:value={database.username}
              type="text" />
            <label for="databaseUserName"
              >{$_("steps.database.inputs.username")}</label>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="form-floating">
            <input
              class="form-control"
              id="databaseUserPassword"
              placeholder="****************"
              bind:value={database.password}
              type="password" />
            <label for="databaseUserPassword"
              >{$_("steps.database.inputs.password")}</label>
          </div>
        </div>
        <div class="col-12">
          <div class="form-floating">
            <input
              class="form-control"
              id="databaseTablePrefix"
              placeholder="pano_"
              bind:value={database.prefix}
              type="text" />
            <label for="databaseTablePrefix"
              >{$_("steps.database.inputs.prefix")}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script context="module">
  /** @type {import('./$types').PageLoad} */
  export async function load({ parent }) {
    const parentData = await parent();
    const { stepInfo } = parentData;

    return { stepInfo };
  }
</script>

<script>
  import { _ } from "svelte-i18n";
  import { onDestroy } from "svelte";

  import { nextStep, navigationState } from "$lib/Store.js";
  import ApiUtil, { NETWORK_ERROR } from "$lib/api.util.js";

  import ErrorAlert from "$lib/components/ErrorAlert.svelte";

  let loading = false;
  let error = null;
  export let dbType = "mariadb";
  let installLoading = false;
  export let installed = false;

  export let portableDatabaseSupported = false;
  export let supportedSystems = [];

  $: portableSupported = portableDatabaseSupported;
  $: if (!portableSupported && dbType === "portable") dbType = "mariadb";

  export let database = {
    host: "",
    dbName: "",
    username: "",
    password: "",
    prefix: "",
  };

  $: disabled =
    dbType === "mariadb"
      ? database.host === "" ||
        database.dbName === "" ||
        database.username === ""
      : !installed;

  $: navigationState.update((s) => ({
    ...s,
    nextDisabled: disabled,
    nextLoading: loading,
    nextAction: submit,
  }));

  onDestroy(() => {
    clearInterval(progressInterval);
    navigationState.update((s) => {
      if (s.nextAction === submit) {
        return { ...s, nextAction: null, nextLoading: false };
      }
      return s;
    });
  });

  let installProgress = 0;
  let progressInterval;

  function installPortableDB() {
    if (!portableSupported) return;

    installLoading = true;
    error = null;
    installProgress = 0;

    progressInterval = setInterval(() => {
      ApiUtil.get({ path: "/api/setup/step" }).then((body) => {
        if (body.installProgress !== undefined) {
          installProgress = body.installProgress;
        }
      });
    }, 500);

    ApiUtil.post({
      path: "/api/setup/steps/2/install-portable",
    })
      .then((body) => {
        clearInterval(progressInterval);
        if (body.result === "ok") {
          database = body.database;
          installed = true;
          installLoading = false;
          installProgress = 100;
        } else if (body.error) {
          showError(body.error);
          installLoading = false;
        } else {
          showError(NETWORK_ERROR);
          installLoading = false;
        }
      })
      .catch(() => {
        clearInterval(progressInterval);
        showError(NETWORK_ERROR);
        installLoading = false;
      });
  }

  function submit() {
    if (loading || disabled) return;

    loading = true;
    error = null;

    if (dbType === "portable" && installed) {
      next();
      return;
    }

    ApiUtil.post({
      path: "/api/setup/steps/2/verify",
      body: database,
    })
      .then((body) => {
        if (body.result === "ok") {
          next();
        } else if (body.error) {
          showError(
            body.error === "INVALID_DATA" ? "INVALID_DB_DATA" : body.error,
          );
        } else showError(NETWORK_ERROR);
      })
      .catch(() => {
        showError(NETWORK_ERROR);
      });
  }

  function next() {
    // ensure dbType is manual if portable not supported
    if (!portableSupported && dbType === "portable") dbType = "mariadb";

    nextStep({ ...database, dbType });
  }

  function showError(errorCode) {
    loading = false;
    error = errorCode;
  }
</script>
