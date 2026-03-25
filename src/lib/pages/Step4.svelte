
<style>
  .connect-account-board {
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
  }

  :global([data-bs-theme="light"]) .connect-account-board {
    --welcome-gradient: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.95) 20%,
      rgba(255, 255, 255, 0.5) 100%
    );
  }

  :global([data-bs-theme="dark"]) .connect-account-board,
  :global([data-bs-theme="copper"]) .connect-account-board {
    --welcome-gradient: linear-gradient(
      90deg,
      rgba(20, 22, 25, 0.95) 20%,
      rgba(20, 22, 25, 0.5) 100%
    );
  }

  @media (max-width: 991.98px) {
    .connect-account-board {
      --welcome-gradient: linear-gradient(
        180deg,
        rgba(var(--bs-body-bg-rgb), 0.95) 40%,
        rgba(var(--bs-body-bg-rgb), 0.8) 100%
      ) !important;
    }
  }

  .connect-account-board .alert-link {
    text-decoration: none;
  }

  .connect-account-board.interactive {
    cursor: pointer;
  }
</style>
<div class="animate__animated animate__fadeIn animate__slower">

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
          <i class="fa-solid fa-triangle-exclamation me-2"></i>
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
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <div
            class="alert alert-secondary connect-account-board border mb-0 focus-ring"
            class:interactive={!panoAccount && !connecting}
            role="alert"
            on:click={!panoAccount && !connecting ? onConnectClick : null}
            style="background-image: var(--welcome-gradient), url('{base}/assets/img/connect-pano-bg.png');">
            <div class="row align-items-center">
              <div class="col-lg-9">
                <h5 class="alert-heading mb-2">
                  <i class="fa-solid fa-circle-user me-2"></i>
                  {panoAccount
                    ? panoAccount.username
                    : $_("steps.account.online-account")}
                </h5>
                <p class="mb-0" class:text-success={panoAccount} class:text-body={!panoAccount}>
                  {panoAccount
                    ? "Pano hesabınız başarıyla bağlandı."
                    : $_("steps.account.online-account-description")}
                </p>
              </div>
              <div class="col-lg-3 text-lg-end mt-3 mt-lg-0">
                {#if panoAccount}
                  <div class="hstack gap-2 justify-content-lg-end">
                    <span class="badge text-bg-gray"
                      >{maskEmail(panoAccount.email)}</span>
                    <button
                      type="button"
                      class="btn-close"
                      use:tooltip={[$_("buttons.remove"), { placement: 'bottom' }]}
                      aria-label={$_("buttons.remove")}
                      on:click={onDisconnectClick}
                      disabled={disconnecting}></button>
                  </div>
                {:else}
                  <div class="alert-link rounded border-0 bg-transparent p-0">
                    {connecting
                      ? $_("buttons.connecting")
                      : $_("buttons.connect")}

                    {#if connecting}
                      <span
                        class="spinner-border spinner-border-sm text-primary ms-2"
                        role="status"></span>
                    {:else}
                      <i class="fa-solid fa-arrow-right ms-1"></i>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
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
  import tooltip from "$lib/tooltip.util.js";
  import { onDestroy } from "svelte";

  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { base } from "$app/paths";

  import { navigationState, isFinishing } from "$lib/Store.js";
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
  let error = null;
  let connecting = !panoAccount && state && encodedData;
  let disconnecting;

  $: disabled =
    account.username === "" ||
    account.password === "" ||
    account.password.length < 6 ||
    account.password.length > 128 ||
    account.email === "" ||
    account.passwordRepeat !== account.password;

  $: navigationState.update((s) => ({
    ...s,
    nextDisabled: disabled,
    nextLoading: loading,
    nextAction: submit,
    nextLabel: "buttons.finish",
  }));

  onDestroy(() => {
    navigationState.update((s) => {
      if (s.nextAction === submit) {
        return {
          ...s,
          nextAction: null,
          nextLoading: false,
          nextLabel: "buttons.next",
        };
      }
      return s;
    });
  });

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

  async function submit() {
    $isFinishing = true;
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

  async function showError(errorCode) {
    loading = false;
    $isFinishing = false;

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
