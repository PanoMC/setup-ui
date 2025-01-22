<div class="animate__animated animate__fadeIn">
  <div class="animate__animated animate__slideInUp">
    <h4>{$_("steps.account.title")}</h4>
    <p class="text-muted">
      {$_("steps.account.description")}
    </p>
  </div>
  <form on:submit|preventDefault="{submit}">
    <ErrorAlert error="{error}" />

    <div class="mb-3">
      <label for="admin-email">{$_("steps.account.inputs.email")}</label>
      <input
        class="form-control"
        id="admin-email"
        type="email"
        bind:value="{account.email}" />
    </div>
    <div class="row">
      <div class="col-6">
        <div class="mb-3">
          <label for="admin-username"
            >{$_("steps.account.inputs.username")}</label>
          <input
            class="form-control"
            id="admin-username"
            type="text"
            bind:value="{account.username}" />
        </div>
      </div>
      <div class="col-6">
        <div class="mb-3">
          <label for="admin-password"
            >{$_("steps.account.inputs.password")}</label>
          <input
            class="form-control"
            id="admin-password"
            placeholder="************"
            bind:value="{account.password}"
            type="password" />
          <small>{$_("steps.account.inputs.password-help-text")}</small>
        </div>
      </div>
    </div>

    <div class="row pt-3">
      <div class="col-6">
        <a
          class="btn btn-link w-100"
          role="button"
          href="javascript:void(0);"
          on:click="{back}"
          class:disabled="{loading}"
          disabled="{loading}">
          {$_("back-button")}
        </a>
      </div>
      <div class="col-6">
        <div class="animate__animated animate__zoomIn">
          <button
            type="submit"
            class="btn btn-secondary w-100"
            class:disabled="{loading || disabled}"
            disabled="{loading || disabled}">
            {$_("finish-button")}
            {#if loading}
              <span class="spinner-border spinner-border-sm text-secondary" role="status"></span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </form>
</div>

<script context="module">
  /**  @type {import('@sveltejs/kit').LayoutLoad} */
  export async function load({ parent }) {
    const {
      stepInfo: { account },
    } = await parent();

    return { stepInfo: { account } };
  }
</script>

<script>
  import { backStep } from "$lib/Store.js";
  import ApiUtil, { NETWORK_ERROR } from "$lib/api.util.js";
  import { PANEL_URL } from "$lib/variables.js";

  import ErrorAlert from "$lib/components/ErrorAlert.svelte";
  import { currentLanguage } from "$lib/language.util.js";
  import { _ } from "svelte-i18n";

  let loading = false;
  let error = null;

  export let account = {
    username: "",
    password: "",
    email: "",
  };

  $: disabled =
    account.username === "" || account.password === "" || account.email === "";

  function submit() {
    loading = true;
    error = null;

    ApiUtil.post({
      path: "/api/setup/finish",
      body: { ...account, setupLocale: $currentLanguage.locale },
    })
      .then((body) => {
        if (body.result === "ok") {
          window.location.assign(PANEL_URL);
        } else if (body.error) {
          showError(body.error);
        } else {
          showError(NETWORK_ERROR);
          console.log(body);
        }
      })
      .catch(() => {
        showError(NETWORK_ERROR);
      });
  }

  function back() {
    if (!loading) {
      loading = true;
      error = null;

      backStep();
    }
  }

  async function showError(errorCode) {
    loading = false;

    error = errorCode;
  }
</script>
