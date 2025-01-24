<div class="animate__animated animate__fadeIn">
  <div class="animate__animated animate__slideInUp">
    <h4>{$_("steps.account.title")}</h4>
    <p class="text-muted">
      {$_("steps.account.description")}
    </p>
  </div>
  <form on:submit|preventDefault={submit}>
    <ErrorAlert error={error} />
    {#if !panoAccount && failed}
      <!-- Error Alert -->
      <div
        class="alert alert-danger alert-dismissible fade show mb-0"
        role="alert">
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
          aria-label={$_("buttons.close")}></button>
        {$_("connect-failed-alert")}
      </div>
    {/if}

    <div class="mb-3">
      <label for="admin-email">{$_("steps.account.inputs.email")}</label>
      <input
        class="form-control"
        id="admin-email"
        type="email"
        bind:value={account.email} />
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
            bind:value={account.username} />
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
            bind:value={account.password} />
          <small>{$_("steps.account.inputs.password-help-text")}</small>
        </div>
      </div>
    </div>

    <h5>{$_("steps.account.online-account")}</h5>
    <p class="text-muted">{$_("steps.account.online-account-description")}</p>
    {#if panoAccount}
      {$_("steps.account.online-account-connected")}
      <br />
      <span class="text-muted">{panoAccount.email}</span>
      <button
        type="button"
        class="btn btn-sm btn-outline-danger ms-2"
        on:click={onDisconnectClick}
        disabled={disconnecting}>{$_("buttons.remove")}</button>
    {:else}
      <button
        type="button"
        class="btn btn-sm btn-outline-primary lh-base"
        on:click={onConnectClick}
        disabled={connecting}>
        <img
          src="/assets/img/logo.svg"
          width="20"
          height="20"
          class="me-2 bg-dark p-1 rounded"
          alt="Pano" />

        {connecting ? $_("buttons.connecting") : $_("buttons.connect")}

        {#if connecting}
          <span
            class="spinner-border spinner-border-sm text-primary"
            role="status"></span>
        {/if}
      </button>
    {/if}

    <div class="row pt-3">
      <div class="col-6">
        <a
          class="btn btn-link w-100"
          role="button"
          href="javascript:void(0);"
          on:click={back}
          class:disabled={loading}
          disabled={loading}>
          {$_("buttons.back")}
        </a>
      </div>
      <div class="col-6">
        <div class="animate__animated animate__zoomIn">
          <button
            type="submit"
            class="btn btn-secondary w-100"
            class:disabled={loading || disabled}
            disabled={loading || disabled}>
            {$_("buttons.finish")}
            {#if loading}
              <span
                class="spinner-border spinner-border-sm text-secondary"
                role="status"></span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </form>
</div>

<script context="module">
  /**  @type {import('@sveltejs/kit').LayoutLoad} */
  export async function load({ parent, url: { searchParams } }) {
    const {
      stepInfo: { account, panoAccount },
    } = await parent();

    const failed = searchParams.get("failed");
    const encodedData = searchParams.get("encodedData");
    const state = searchParams.get("state");

    return { stepInfo: { account, panoAccount, failed, encodedData, state } };
  }
</script>

<script>
  import { _ } from "svelte-i18n";

  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  import { backStep } from "$lib/Store.js";
  import ApiUtil, { buildQueryParams, NETWORK_ERROR } from "$lib/api.util.js";
  import { PANEL_URL, PANO_WEBSITE_URL } from "$lib/variables.js";

  import ErrorAlert from "$lib/components/ErrorAlert.svelte";
  import { currentLanguage } from "$lib/language.util.js";

  export let account = {
    username: "",
    password: "",
    email: "",
  };

  export let panoAccount;
  export let failed;
  export let encodedData;
  export let state;

  let loading = false;
  let error = null;
  let connecting = !panoAccount && state && encodedData;
  let disconnecting;

  $: disabled =
    account.username === "" || account.password === "" || account.email === "";

  if (browser) {
    if (!panoAccount && state && encodedData) {
      ApiUtil.post({
        path: "/api/setup/steps/4/platform/connect",
        body: {
          encodedData,
          state,
        },
      })
        .then(async (body) => {
          if (body.error) {
            if (body.error === "ALREADY_CONNECTED_TO_PANO") {
              await goto($page.url.pathname, { invalidateAll: true });
              connecting = false;
              return;
            }

            const queryParameters = buildQueryParams({ failed: true });
            await goto($page.url.pathname + queryParameters, {
              invalidateAll: true,
            });
            connecting = false;

            return;
          }

          await goto($page.url.pathname, { invalidateAll: true });

          if (!account.username) {
            account.username = body.username;
          }

          if (!account.email) {
            account.email = body.email;
          }

          connecting = false;
        })
        .catch(async (_) => {
          const queryParameters = buildQueryParams({ failed: true });
          await goto($page.url.pathname + queryParameters, {
            invalidateAll: true,
          });
        });
    }

    if (panoAccount) {
      if (!account.username) {
        account.username = panoAccount.username;
      }

      if (!account.email) {
        account.email = panoAccount.email;
      }
    }
  }

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

  function onConnectClick() {
    connecting = true;

    ApiUtil.post({
      path: "/api/setup/steps/4/platform/code",
    })
      .then((body) => {
        if (body.error) {
          location.reload();
          return;
        }

        const { publicKey, state } = body;

        // Encode dynamic parts to ensure the URL is safe
        const encodedPublicKey = encodeURIComponent(publicKey);
        const encodedRedirectUrl = encodeURIComponent(
          $page.url.origin + $page.url.pathname,
        );
        const encodedState = encodeURIComponent(state);

        // Redirect to the constructed URL
        window.location = `${PANO_WEBSITE_URL}/auth?loginPanoPlatform=${encodedPublicKey}&redirectUrl=${encodedRedirectUrl}&state=${encodedState}`;
      })
      .catch((_) => {
        connecting = false;
        error = NETWORK_ERROR;
      });
  }

  function onDisconnectClick() {
    disconnecting = true;

    ApiUtil.post({
      path: "/api/setup/steps/4/platform/disconnect",
    })
      .then(async (body) => {
        if (body.error) {
          error = body.error;

          disconnecting = false;
          return;
        }

        panoAccount = null;

        disconnecting = false;
      })
      .catch((_) => {
        disconnecting = false;
        location.reload();
      });
  }
</script>
