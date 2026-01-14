<div class="animate__animated animate__fadeIn animate__slower">
  <div class="card-header">
    {$_("steps.account.title")}
  </div>
  <form on:submit|preventDefault={submit}>
    <div class="card-body vstack gap-3">
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

      <div class="row g-3">
        <div class="col-md-6">
          <div class="form-floating">
            <input
              class="form-control"
              id="admin-email"
              type="email"
              bind:value={account.email} />
            <label for="admin-email">{$_("steps.account.inputs.email")}</label>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-floating">
            <input
              class="form-control"
              id="admin-username"
              type="text"
              bind:value={account.username} />
            <label for="admin-username"
              >{$_("steps.account.inputs.username")}</label>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-floating">
            <input
              type="password"
              class="form-control"
              id="admin-password"
              placeholder="************"
              bind:value={account.password} />
            <label for="admin-password"
              >{$_("steps.account.inputs.password")}</label>
            <small>{$_("steps.account.inputs.password-help-text")}</small>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-floating">
            <input
              type="password"
              class="form-control"
              id="admin-password-repeat"
              placeholder="************"
              bind:value={account.passwordRepeat} />
            <label for="admin-password-repeat"
              >{$_("steps.account.inputs.password-repeat")}</label>
            <small>{$_("steps.account.inputs.password-help-text")}</small>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col vstack gap-2">
          <label for="connect-pano-account">
            {$_("steps.account.online-account")}
            <small class="d-block"
              >{$_("steps.account.online-account-description")}</small>
          </label>

          {#if panoAccount}
            <div class="hstack gap-2">
              <span class="badge text-bg-primary"
                >{maskEmail(panoAccount.email)}</span>
              <button
                type="button"
                title={$_("buttons.remove")}
                aria-label={$_("buttons.remove")}
                class="btn-close"
                on:click={onDisconnectClick}
                disabled={disconnecting}></button>
            </div>
          {:else}
            <button
              id="connect-pano-account"
              type="button"
              class="btn btn-sm btn-primary lh-base d-block"
              on:click={onConnectClick}
              disabled={connecting}>
              {connecting ? $_("buttons.connecting") : $_("buttons.connect")}

              {#if connecting}
                <span
                  class="spinner-border spinner-border-sm text-primary ms-2"
                  role="status"></span>
              {/if}
            </button>
          {/if}
        </div>
      </div>

      <div class="row g-3">
        <div class="col-6">
          <button
            class="btn btn-link w-100"
            type="button"
            on:click={back}
            class:disabled={loading}
            disabled={loading}>
            {$_("buttons.back")}
          </button>
        </div>
        <div class="col-6">
          <div class="animate__animated animate__zoomIn animate__slow">
            <button
              type="submit"
              class="btn btn-secondary w-100"
              class:disabled={loading || disabled}
              disabled={loading || disabled}>
              {$_("buttons.finish")}
              {#if finishLoading}
                <span
                  class="spinner-border spinner-border-sm text-primary"
                  role="status"></span>
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  </form>
</div>

<ConfirmRemovePanoAccountModal />

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

  import { show as showToast } from "$lib/components/ToastContainer.svelte";

  import ErrorAlert from "$lib/components/ErrorAlert.svelte";
  import { currentLanguage } from "$lib/language.util.js";

  import ConfirmRemovePanoAccountModal, {
    show as showConfirmRemovePanoAccountModal,
  } from "$lib/components/modals/ConfirmRemovePanoAccountModal.svelte";

  import PanoAccountConnectSuccessToast from "$lib/components/toasts/PanoAccountConnectSuccessToast.svelte";
  import PanoAccountDisconnectSuccessToast from "$lib/components/toasts/PanoAccountDisconnectSuccessToast.svelte";
  import PanoAccountDisconnectFailToast from "$lib/components/toasts/PanoAccountDisconnectFailToast.svelte";

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
  let finishLoading;
  let error = null;
  let connecting = !panoAccount && state && encodedData;
  let disconnecting;

  $: disabled =
    account.username === "" ||
    account.password === "" ||
    account.email === "" ||
    account.passwordRepeat !== account.password;

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
          await showToast(PanoAccountConnectSuccessToast);

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
    finishLoading = true;
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
    error = null;
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
        window.location = `${PANO_WEBSITE_URL}/auth?loginPanoPlatform=${encodedPublicKey}&redirectUrl=${encodedRedirectUrl}&state=${encodedState}&hl=${$currentLanguage.locale}`;
      })
      .catch((_) => {
        connecting = false;
        error = NETWORK_ERROR;
      });
  }

  function onDisconnectClick() {
    error = null;
    showConfirmRemovePanoAccountModal(() => {
      disconnecting = true;

      ApiUtil.post({
        path: "/api/setup/steps/4/platform/disconnect",
      })
        .then(async (body) => {
          if (body.error) {
            await showToast(PanoAccountDisconnectFailToast);
            error = body.error;

            disconnecting = false;
            return;
          }

          await showToast(PanoAccountDisconnectSuccessToast);

          panoAccount = null;

          disconnecting = false;
        })
        .catch((_) => {
          disconnecting = false;
          location.reload();
        });
    });
  }

  function maskEmail(email) {
    const [localPart, domain] = email.split("@");

    const maskedLocal =
      localPart.length <= 3
        ? `${localPart[0]}**`
        : `${localPart.substring(0, 2)}${"*".repeat(localPart.length - 2)}`;

    const domainParts = domain.split(".");
    const maskedDomain = `${domainParts[0][0]}${"*".repeat(domainParts[0].length - 1)}.${domainParts.slice(1).join(".")}`;

    return `${maskedLocal}@${maskedDomain}`;
  }
</script>
