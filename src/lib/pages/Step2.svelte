<div class="animate__animated animate__fadeIn">
  <div class="animate__animated animate__slideInUp d-block">
    <h4>{$_("steps.database.title")}</h4>
    <p class="text-muted">
      {$_("steps.database.description")}
      &nbsp;
    </p>
  </div>
  <ErrorAlert error="{error}" />
  <form on:submit|preventDefault="{submit}">
    <div class="mb-3">
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
    </div>

    <div class="tab-content">
      <div
        aria-labelledby="mysql-tab"
        class="tab-pane fade show active"
        id="mysql"
        role="tabpanel">
        <div class="row">
          <div class="col-6">
            <div class="mb-3">
              <label for="databaseAddress"
                >{$_("steps.database.inputs.address")}</label>
              <input
                class="form-control"
                id="databaseAddress"
                placeholder="localhost:3306"
                bind:value="{database.host}"
                type="text" />
            </div>
          </div>
          <div class="col-6">
            <div class="mb-3">
              <label for="databaseName"
                >{$_("steps.database.inputs.name")}</label>
              <input
                class="form-control"
                id="databaseName"
                placeholder="pano"
                bind:value="{database.dbName}"
                type="text" />
            </div>
          </div>
          <div class="w-100"></div>
          <div class="col-6">
            <div class="mb-3">
              <label for="databaseUserName"
                >{$_("steps.database.inputs.username")}</label>
              <input
                class="form-control"
                id="databaseUserName"
                placeholder="root"
                bind:value="{database.username}"
                type="text" />
            </div>
          </div>
          <div class="col-6">
            <div class="mb-3">
              <label for="databaseUserPassword"
                >{$_("steps.database.inputs.password")}</label>
              <input
                class="form-control"
                id="databaseUserPassword"
                placeholder="****************"
                bind:value="{database.password}"
                type="password" />
            </div>
          </div>
          <div class="col-12">
            <div class="mb-3">
              <label for="databaseTablePrefix"
                >{$_("steps.database.inputs.prefix")}</label>
              <input
                class="form-control"
                id="databaseTablePrefix"
                placeholder="pano_"
                bind:value="{database.prefix}"
                type="text" />
            </div>
          </div>
        </div>
      </div>

      <!-- <div
      aria-labelledby="sqlite-tab"
      class="tab-pane fade show"
      id="sqlite"
      role="tabpanel">
      sqlite
    </div> -->
    </div>

    <div class="row">
      <div class="col-6">
        <a
          href="javascript:void(0);"
          class="btn btn-link w-100"
          role="button"
          on:click="{back}"
          class:disabled="{loading}"
          disabled="{loading}">{$_("buttons.back")}</a>
      </div>
      <div class="col-6">
        <div class="animate__animated animate__zoomIn">
          <button
            type="submit"
            class="btn btn-primary w-100"
            class:disabled="{loading || disabled}"
            disabled="{loading || disabled}"
            >{$_("buttons.next")}
            {#if nextLoading}
              <span class="spinner-border spinner-border-sm text-secondary" role="status"></span>
            {/if}
          </button>
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

  $: disabled = database.host === "" || database.dbName === "" || database.username === "";

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
          showError(body.error);
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
