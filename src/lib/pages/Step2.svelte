<style>
  .cursor-pointer {
    cursor: pointer;
  }
</style>

<div class="animate__animated animate__fadeIn animate__slower">
  <div class="card-header">
    {$_("steps.database.title")}
  </div>

  <form on:submit|preventDefault={submit}>
    <div class="card-body vstack gap-3">
      <ErrorAlert error={error} />

      <div class="vstack gap-2">
        <label
          class="form-check-label d-block p-3 border rounded cursor-pointer"
          for="dbPortable"
          class:border-primary={dbType === "portable"}
          class:opacity-50={!portableSupported}>
          <div class="d-flex align-items-center gap-3">
            <input
              class="form-check-input mt-0"
              type="radio"
              name="dbType"
              id="dbPortable"
              value="portable"
              disabled={!portableSupported}
              bind:group={dbType} />
            <div class="vstack">
              <strong
                >{$_("steps.database.databases.local-portable-db")}</strong>
              <small>
                >{$_(
                  "steps.database.databases.local-portable-db-description",
                )}</small>

                <div class="alert alert-warning mt-2 mb-0 p-2 d-flex align-items-center gap-2">
                  <i class="fa fa-exclamation-triangle"></i>
                  <small>
                    {$_(
                      "steps.database.databases.portable-not-supported",
                    )}<br />
                    {$_("steps.database.databases.supported-systems", {
                      values: { systems: supportedSystems.join(", ") },
                    })}
                  </small>
                </div>

              {#if !portableSupported}
              {:else if dbType === "portable" && !installed}
                <div class="mt-3">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm"
                    on:click={installPortableDB}
                    disabled={installLoading}>
                    {#if installLoading}
                      <span
                        class="spinner-border spinner-border-sm me-2"
                        role="status"></span>
                      {$_("steps.database.databases.installing")}
                    {:else}
                      {$_("steps.database.databases.download-and-install")}
                    {/if}
                  </button>
                </div>
              {:else if dbType === "portable" && installed}
                <div class="mt-2">
                  <span class="badge text-bg-success"
                    >{$_("steps.database.databases.portable-installed")}</span>
                </div>
              {/if}
            </div>
          </div>
        </label>

        <label
          class="form-check-label d-block p-3 border rounded cursor-pointer"
          for="dbManual"
          class:border-primary={dbType === "mariadb"}>
          <div class="d-flex align-items-center gap-3">
            <input
              class="form-check-input mt-0"
              type="radio"
              name="dbType"
              id="dbManual"
              value="mariadb"
              bind:group={dbType} />
            <div class="vstack">
              <strong>{$_("steps.database.databases.mysql-or-mariadb")}</strong>
              <small>
                >{$_(
                  "steps.database.databases.mysql-or-mariadb-description",
                )}</small>
            </div>
          </div>
        </label>
      </div>

      <div class="row g-3" class:opacity-50={dbType === "portable"}>
        <div class="col-lg-6">
          <div class="form-floating">
            <input
              class="form-control"
              id="databaseAddress"
              placeholder="localhost:3306"
              bind:value={database.host}
              disabled={dbType === "portable"}
              type="text" />
            <label class="form-label" for="databaseAddress"
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
              disabled={dbType === "portable"}
              type="text" />
            <label class="form-label" for="databaseName"
              >{$_("steps.database.inputs.name")}</label>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="form-floating">
            <input
              class="form-control"
              id="databaseUserName"
              placeholder="root"
              bind:value={database.username}
              disabled={dbType === "portable"}
              type="text" />
            <label class="form-label" for="databaseUserName"
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
              disabled={dbType === "portable"}
              type="password" />
            <label class="form-label" for="databaseUserPassword"
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
              disabled={dbType === "portable"}
              type="text" />
            <label class="form-label" for="databaseTablePrefix"
              >{$_("steps.database.inputs.prefix")}</label>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-6">
          <button
            type="button"
            class="btn btn-link w-100"
            on:click={back}
            class:disabled={loading || installLoading}
            disabled={loading || installLoading}
            >{$_("buttons.back")}
          </button>
        </div>
        <div class="col-6">
          <div class="animate__animated animate__zoomIn animate__slow">
            <button
              type="submit"
              class="btn btn-secondary w-100"
              class:disabled={loading || disabled || installLoading}
              disabled={loading || disabled || installLoading}
              >{$_("buttons.next")}
              {#if nextLoading}
                <span
                  class="spinner-border spinner-border-sm text-primary ms-2"
                  role="status"></span>
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </form>
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

  import { backStep, nextStep } from "$lib/Store.js";
  import ApiUtil, { NETWORK_ERROR } from "$lib/api.util.js";

  import ErrorAlert from "$lib/components/ErrorAlert.svelte";

  let loading = false;
  let nextLoading;
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

  function installPortableDB() {
    if (!portableSupported) return;

    installLoading = true;
    error = null;

    ApiUtil.post({
      path: "/api/setup/steps/2/install-portable",
    })
      .then((body) => {
        if (body.result === "ok") {
          database = body.database;
          installed = true;
          installLoading = false;
        } else if (body.error) {
          showError(body.error);
          installLoading = false;
        } else {
          showError(NETWORK_ERROR);
          installLoading = false;
        }
      })
      .catch(() => {
        showError(NETWORK_ERROR);
        installLoading = false;
      });
  }

  function submit() {
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
    loading = true;
    nextLoading = true;

    // ensure dbType is manual if portable not supported
    if (!portableSupported && dbType === "portable") dbType = "mariadb";

    nextStep({ ...database, dbType });
  }

  function back() {
    if (!loading && !installLoading) {
      loading = true;
      error = null;

      backStep();
    }
  }

  function showError(errorCode) {
    loading = false;

    error = errorCode;
  }
</script>
