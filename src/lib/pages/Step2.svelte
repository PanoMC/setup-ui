<div class="animate__animated animate__fadeIn animate__slower">
  <div class="card-header">
    {$_("steps.database.title")}
  </div>

  <form on:submit|preventDefault={submit}>
    <div class="card-body vstack gap-3">
      <ErrorAlert error={error} />

      <div class="form-check">
        <input
          class="form-check-input"
          type="radio"
          name="dbMysqlMariaDB"
          id="dbMysqlMariaDB"
          checked />
        <label class="form-check-label" for="dbMysqlMariaDB">
          {$_("steps.database.databases.mysql-or-mariadb")}
        </label>
      </div>

      <div class="row g-3">
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

      <div class="row g-3">
        <div class="col-6">
          <button
            type="button"
            class="btn btn-link w-100"
            on:click={back}
            class:disabled={loading}
            disabled={loading}
            >{$_("buttons.back")}
          </button>
        </div>
        <div class="col-6">
          <div class="animate__animated animate__zoomIn animate__slow">
            <button
              type="submit"
              class="btn btn-secondary w-100"
              class:disabled={loading || disabled}
              disabled={loading || disabled}
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
    const {
      stepInfo: { database },
    } = await parent();

    return { stepInfo: { database } };
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

  export let database = {
    host: "",
    dbName: "",
    username: "",
    password: "",
    prefix: "",
  };

  $: disabled =
    database.host === "" || database.dbName === "" || database.username === "";

  function submit() {
    loading = true;
    error = null;

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

    nextStep(database);
  }

  function back() {
    if (!loading) {
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
