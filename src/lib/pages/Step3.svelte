<style>
  .smtp-steps-container {
    display: flex;
    width: 200%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .smtp-step-pane {
    width: 50%;
    flex-shrink: 0;
  }

  .pano-mail-card {
    border-width: 2px;
    background: var(--bs-primary-bg-subtle);
  }

  .slide-active {
    transform: translateX(-50%);
  }

  .merged-grid {
    display: grid;
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .merged-grid .form-control {
    border-radius: 0;
  }

  .merged-grid > .form-floating {
    position: relative;
    z-index: 1;
  }

  .merged-grid > .form-floating:focus-within {
    z-index: 3;
  }

  /* Mobile: stacked 1x2 */
  @media (max-width: 768px) {
    .merged-grid > :first-child .form-control {
      border-top-left-radius: var(--bs-border-radius) !important;
      border-top-right-radius: var(--bs-border-radius) !important;
    }
    .merged-grid > :last-child .form-control {
      border-bottom-left-radius: var(--bs-border-radius) !important;
      border-bottom-right-radius: var(--bs-border-radius) !important;
    }
    .merged-grid > :not(:last-child) {
      margin-bottom: -1px;
    }
    .merged-grid > :not(:last-child) .form-control:not(:focus) {
      border-bottom-color: transparent;
    }
  }

  /* Desktop: 1x2 grid side by side */
  @media (min-width: 769px) {
    .merged-grid {
      grid-template-columns: 1fr 1fr;
    }

    .merged-grid > :nth-child(1) .form-control {
      border-top-left-radius: var(--bs-border-radius) !important;
      border-bottom-left-radius: var(--bs-border-radius) !important;
    }
    .merged-grid > :nth-child(2) .form-control {
      border-top-right-radius: var(--bs-border-radius) !important;
      border-bottom-right-radius: var(--bs-border-radius) !important;
    }

    .merged-grid > :nth-child(1) {
      margin-right: -1px;
    }

    .merged-grid > :nth-child(1) .form-control:not(:focus) {
      border-right-color: transparent;
    }
  }
</style>

<div class="animate__animated animate__fadeIn animate_animate__slower">
  <form on:submit|preventDefault={next}>
    <CardHeader>{$_("steps.email.title")}</CardHeader>
    <div class="card-body vstack gap-3 overflow-hidden p-0">
      {#if mode === "panomail"}
        <div class="p-3 vstack gap-3">
          <ErrorAlert error={error} />

          <div class="card pano-mail-card border-primary">
            <div class="card-body vstack gap-3">
              <div class="d-flex align-items-start gap-3">
                <i
                  class="fa-solid fa-envelope-circle-check fa-2x text-primary"
                  aria-hidden="true"></i>
                <div class="flex-grow-1">
                  <div class="d-flex flex-wrap align-items-center gap-2">
                    <h5 class="mb-0">Pano Mail</h5>
                    <span class="badge text-bg-success"
                      >{$_("steps.email.pano-mail.free")}</span>
                  </div>
                  <div class="text-body-secondary">
                    {$_("steps.email.pano-mail.by", { values: { website } })}
                  </div>
                </div>
              </div>

              <ul class="list-unstyled vstack gap-1 mb-0">
                {#if panoMail.mailsPerMonth}
                  <li>
                    <i
                      class="fa-solid fa-check text-success me-2"
                      aria-hidden="true"></i>
                    {#if panoMail.mailsPerDay}
                      {$_("steps.email.pano-mail.allowance-both", {
                        values: {
                          month: formattedAllowance,
                          day: formattedDay,
                        },
                      })}
                    {:else}
                      {$_("steps.email.pano-mail.allowance", {
                        values: { count: formattedAllowance },
                      })}
                    {/if}
                  </li>
                {/if}
                <li>
                  <i
                    class="fa-solid fa-check text-success me-2"
                    aria-hidden="true"></i>
                  {$_("steps.email.pano-mail.no-setup")}
                </li>
              </ul>

              {#if panoMail.connected}
                <div class="fw-semibold">
                  <i
                    class="fa-solid fa-circle-check text-success me-2"
                    aria-hidden="true"></i>
                  {$_("steps.email.pano-mail.signed-in", {
                    values: { name: panoMail.username },
                  })}
                </div>

                {#if panoMail.sender}
                  <div>
                    <label class="form-label small mb-1" for="panoMailLocal"
                      >{$_("steps.email.pano-mail.sender")}</label>
                    <div class="input-group">
                      <input
                        class="form-control"
                        id="panoMailLocal"
                        type="text"
                        autocomplete="off"
                        spellcheck="false"
                        maxlength="64"
                        bind:value={panoMail.sender.localPart} />
                      <span class="input-group-text">@</span>
                      <input
                        class="form-control"
                        id="panoMailName"
                        type="text"
                        autocomplete="off"
                        spellcheck="false"
                        maxlength="63"
                        class:is-valid={nameClass === "is-valid"}
                        class:is-invalid={nameClass === "is-invalid"}
                        title={$_("steps.email.pano-mail.sender-name")}
                        aria-label={$_("steps.email.pano-mail.sender-name")}
                        value={panoMail.sender.name}
                        on:input={onSenderNameInput} />
                      <span class="input-group-text"
                        >.{panoMail.sender.zone}</span>
                    </div>
                    {#if nameMessage}
                      <div class="invalid-feedback d-block">
                        {$_("errors." + nameMessage.key, {
                          values: nameMessage.props,
                        })}
                      </div>
                    {/if}
                  </div>
                {/if}
              {:else}
                <button
                  type="button"
                  class="btn btn-primary w-100"
                  disabled={checking || connecting}
                  on:click={connectAccount}>
                  {#if connecting}
                    <span
                      class="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"></span>
                    {$_("buttons.connecting")}
                  {:else}
                    <i
                      class="fa-solid fa-right-to-bracket me-2"
                      aria-hidden="true"></i>
                    {$_("steps.email.pano-mail.sign-in", {
                      values: { website },
                    })}
                  {/if}
                </button>
              {/if}
            </div>
          </div>

          <button
            type="button"
            class="btn btn-link text-decoration-none align-self-center"
            on:click={() => chooseMode("own")}>
            {$_("steps.email.own-server")}
          </button>
        </div>
      {:else}
        <div class="smtp-steps-container" class:slide-active={chosenService}>
          <!-- Step 1: Service Selection -->
          <div class="smtp-step-pane p-3">
            <button
              type="button"
              class="btn btn-link px-0 text-decoration-none mb-3"
              on:click={() => chooseMode("panomail")}>
              <i class="fa-solid fa-arrow-left me-1" aria-hidden="true"></i>
              {$_("steps.email.back-to-pano-mail")}
            </button>

            <div class="mb-3">
              {$_(
                serversOnly
                  ? "steps.email.servers-intro"
                  : "steps.email.description",
              )}
            </div>

            <div class="list-group">
              {#each Object.keys(services) as service, index (service)}
                <button
                  type="button"
                  class="list-group-item list-group-item-action fw-normal"
                  on:click={() => chooseService(service)}>
                  {$_(services[service].name) ||
                    services[service].name}</button>
              {/each}
            </div>
          </div>

          <!-- Step 2: Service Details -->
          <div class="smtp-step-pane p-3">
            {#if lastChosenService && mailConfiguration[lastChosenService]}
              <button
                type="button"
                class="btn btn-link px-0 text-decoration-none mb-3"
                on:click={() => (chosenService = null)}>
                <i class="fa-solid fa-arrow-left me-1"></i>
                {$_("steps.email.return-back-to-service-list-text")}
              </button>

              <div class="vstack gap-2">
                <h5>{$_(services[lastChosenService].name)}</h5>

                <ErrorAlert error={error} />

                <div class="merged-grid w-100">
                  <div class="form-floating">
                    <input
                      class="form-control"
                      id="mailUsername"
                      type="text"
                      placeholder="no-reply"
                      bind:value={mailConfiguration[lastChosenService].username}
                      on:input={onUsernameChange} />
                    <label for="mailUsername"
                      >{$_("steps.email.inputs.username")}</label>
                  </div>
                  <div class="form-floating">
                    <input
                      class="form-control"
                      id="mailUserPassword"
                      placeholder="****************"
                      type="password"
                      bind:value={
                        mailConfiguration[lastChosenService].password
                      } />
                    <label for="mailUserPassword"
                      >{$_("steps.email.inputs.password")}</label>
                  </div>
                </div>
              </div>

              <details>
                <summary class="pt-3"
                  >{$_("steps.email.inputs.details-button")}</summary>

                <div class="row g-3 pt-2">
                  <div class="col-12 col-md-6 mb-3">
                    <label class="form-label"
                      >{$_("steps.email.inputs.ssl")}</label>
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        name="ssl"
                        id="ssl"
                        aria-checked={mailConfiguration[lastChosenService].ssl}
                        bind:checked={
                          mailConfiguration[lastChosenService].ssl
                        } />
                      <label class="form-check-label" for="ssl">
                        {$_("steps.email.inputs.active")}
                      </label>
                    </div>
                  </div>
                  <div class="col-12 col-md-6 mb-3">
                    <label class="form-label" for="port"
                      >{$_("steps.email.inputs.tls-setting")}</label>
                    <select
                      class="form-select"
                      id="port"
                      bind:value={
                        mailConfiguration[lastChosenService].starttls
                      }>
                      <option value="REQUIRED">REQUIRED</option>
                      <option value="OPTIONAL">OPTIONAL</option>
                      <option value="DISABLED">DISABLED</option>
                    </select>
                  </div>
                </div>

                <div class="row">
                  <div class="col-12 col-md-6">
                    <div class="mb-3">
                      <label class="form-label" for="sendingAddress"
                        >{$_("steps.email.inputs.sending-address")}</label>
                      <input
                        class="form-control"
                        id="sendingAddress"
                        type="text"
                        placeholder="no-reply@forexample.com"
                        bind:value={
                          mailConfiguration[lastChosenService].sender
                        } />
                    </div>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="mb-3">
                      <label class="form-label" for="hostname"
                        >{$_("steps.email.inputs.hostname")}</label>
                      <input
                        class="form-control"
                        id="hostname"
                        type="text"
                        placeholder="smtp.forexample.com"
                        bind:value={
                          mailConfiguration[lastChosenService].hostname
                        } />
                    </div>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="mb-3">
                      <label class="form-label" for="port"
                        >{$_("steps.email.inputs.port")}</label>
                      <input
                        class="form-control"
                        id="port"
                        placeholder="465"
                        type="number"
                        bind:value={
                          mailConfiguration[lastChosenService].port
                        } />
                    </div>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="mb-3">
                      <label class="form-label" for="port"
                        >{$_("steps.email.inputs.auth-method")}</label>
                      <select
                        class="form-select"
                        bind:value={
                          mailConfiguration[lastChosenService].authMethods
                        }>
                        <option value="PLAIN">PLAIN</option>
                        <option value=""></option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </form>
</div>

<ConfirmSkipSMTPModal />

<script context="module">
  import { detectMailService } from "$lib/mail.util.js";
  import { fetchPanoMail } from "$lib/pano-mail.util.js";

  const defaultMailConfiguration = Object.freeze({
    ssl: true,
    starttls: "DISABLED",
    port: 465,
    authMethods: "",
  });

  export const services = Object.freeze({
    GMAIL: {
      name: "GMail",
      config: {
        ...defaultMailConfiguration,
        hostname: "smtp.gmail.com",
        port: 587,
        ssl: false,
        starttls: "REQUIRED",
        authMethods: "PLAIN",
      },
    },
    YAHOO: {
      name: "Yahoo",
      config: {
        ...defaultMailConfiguration,
        hostname: "smtp.mail.yahoo.com",
      },
    },
    YANDEX: {
      name: "Yandex",
      config: {
        ...defaultMailConfiguration,
        hostname: "smtp.yandex.com",
        port: 465,
        ssl: true,
        starttls: "DISABLED",
        authMethods: "PLAIN",
      },
    },
    MAIL_RU: {
      name: "Mail.ru",
      config: {
        ...defaultMailConfiguration,
        hostname: "smtp.mail.ru",
      },
    },
    OUTLOOK: {
      name: "Hotmail / Outlook",
      config: {
        ...defaultMailConfiguration,
        hostname: "smtp-mail.outlook.com",
        port: 587,
      },
    },
    OTHER: {
      name: "buttons.other",
      config: {
        ...defaultMailConfiguration,
      },
    },
  });

  /** @type {import('./$types').PageLoad} */
  export async function load({ parent }) {
    const { stepInfo } = await parent();
    const { email } = stepInfo;
    const chosenService = detectMailService(email, services);

    const mailConfiguration = {
      [chosenService]: email,
    };

    // Read with the page, so the card never flips after it is shown.
    const panoMail = await fetchPanoMail();

    return { stepInfo: { mailConfiguration, chosenService, panoMail } };
  }
</script>

<script>
  import CardHeader from "$lib/components/CardHeader.svelte";
  import { _ } from "svelte-i18n";
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { currentLanguage } from "$lib/language.util.js";
  import { PANO_WEBSITE_URL } from "$lib/variables.js";
  import { websiteHost } from "$lib/restore.util.js";
  import {
    normalizeName,
    panoMailBody,
    panoMailError,
    senderComplete,
    verifyPanoMail,
    checkPanoMailName,
  } from "$lib/pano-mail.util.js";
  import {
    createNameChecker,
    nameCheckBlocks,
    nameCheckClass,
    nameCheckMessage,
  } from "$lib/pano-name-check.js";
  import {
    finishPanoConnect,
    startPanoConnect,
  } from "$lib/pano-connect.util.js";
  import { nextStep, navigationState, usageMode } from "$lib/Store.js";

  import { fade } from "svelte/transition";
  import ApiUtil, { NETWORK_ERROR } from "$lib/api.util.js";
  import { isOk } from "$lib/api.result.js";

  import ErrorAlert from "$lib/components/ErrorAlert.svelte";
  import ConfirmSkipSMTPModal, {
    show as showConfirmSkipSMTPModal,
  } from "$lib/components/modals/ConfirmSkipSMTPModal.svelte";

  let loading = false;
  let error = null;
  export let chosenService;
  let lastChosenService = null;

  $: if (chosenService) {
    lastChosenService = chosenService;
  }

  export let mailConfiguration = {};

  // In SERVERS mode e-mail is about alerts and password resets, not visitor mail.
  $: serversOnly = $usageMode === "SERVERS";

  // Pano Mail (the website's own e-mail service) is the default; "own" is the SMTP list + form.
  /** @type {"panomail" | "own"} */
  let mode = chosenService ? "own" : "panomail";
  let checking = false;
  let connecting = false;
  export let panoMail = {
    website: null,
    connected: false,
    username: "",
    mailsPerMonth: null,
  };

  // The website this Pano talks to; the build-time address only when Pano does not say.
  $: websiteUrl = (panoMail.website || PANO_WEBSITE_URL).replace(/\/+$/, "");
  $: website = websiteHost(websiteUrl);
  $: formattedAllowance = panoMail.mailsPerMonth
    ? new Intl.NumberFormat($currentLanguage?.locale).format(
        panoMail.mailsPerMonth,
      )
    : "";

  $: formattedDay = panoMail.mailsPerDay
    ? new Intl.NumberFormat($currentLanguage?.locale).format(
        panoMail.mailsPerDay,
      )
    : "";

  function onSenderNameInput(event) {
    const value = normalizeName(event.currentTarget.value);

    event.currentTarget.value = value;
    panoMail.sender.name = value;
    nameChecker?.input(value);
  }

  let nameState = null;
  $: nameClass = nameCheckClass(nameState);
  $: nameMessage = nameCheckMessage(nameState);

  const nameChecker = panoMail.sender
    ? createNameChecker({
        check: checkPanoMailName,
        initialName: panoMail.sender.name,
        onChange: (state) => (nameState = state),
      })
    : null;

  $: disabled =
    mode === "panomail"
      ? checking ||
        connecting ||
        !panoMail.connected ||
        !senderComplete(panoMail.sender) ||
        nameCheckBlocks(nameState)
      : ownDisabled;

  $: ownDisabled =
    !chosenService ||
    (chosenService &&
      (!mailConfiguration[chosenService].port ||
        !mailConfiguration[chosenService].sender ||
        !mailConfiguration[chosenService].hostname ||
        !mailConfiguration[chosenService].username ||
        !mailConfiguration[chosenService].password));

  $: navigationState.update((s) => ({
    ...s,
    nextDisabled: disabled,
    nextLoading: loading,
    nextAction: next,
    showSkip: true,
    skipAction: skip,
  }));

  onMount(async () => {
    if (/[?&](encodedData|failed)=/.test(window.location.search)) {
      checking = true;

      const failed = await finishPanoConnect(window.location.search);

      await goto(window.location.pathname, {
        replaceState: true,
        noScroll: true,
      });

      if (failed) {
        error = { key: "PANO_MAIL_CONNECT_FAILED", props: { website } };
      }

      panoMail = await fetchPanoMail();
      checking = false;
    }
  });

  onDestroy(() => {
    nameChecker?.destroy();

    navigationState.update((s) => {
      if (s.nextAction === next) {
        return {
          ...s,
          nextAction: null,
          nextLoading: false,
          showSkip: false,
          skipAction: null,
        };
      }
      return s;
    });
  });

  async function showError(errorCode) {
    loading = false;

    error = errorCode;
  }

  function chooseMode(newMode) {
    error = null;
    mode = newMode;
  }

  function connectAccount() {
    error = null;
    connecting = true;

    startPanoConnect({
      websiteUrl,
      locale: $currentLanguage.locale,
    }).then((failed) => {
      if (!failed) return;

      connecting = false;
      showError(failed.error?.code || NETWORK_ERROR);
    });
  }

  function chooseService(service) {
    if (!mailConfiguration[service]) {
      mailConfiguration[service] = { ...services[service].config };
    }

    chosenService = service;
  }

  async function next() {
    if (disabled) {
      return;
    }

    loading = true;
    error = null;

    if (mode === "panomail") {
      verifyPanoMail(panoMail.sender).then((failure) => {
        if (!failure) {
          nextStep(panoMailBody(panoMail.sender));
          return;
        }

        showError(panoMailError(failure, website));
      });
      return;
    }

    ApiUtil.post({
      path: "/setup/steps/3/verify",
      body: mailConfiguration[chosenService],
    })
      .then((body) => {
        if (isOk(body)) {
          nextStep(mailConfiguration[chosenService]);
          return;
        }

        loading = false;
        showError(
          body.error?.code === "INVALID_DATA"
            ? {
                key: "INVALID_EMAIL_DATA",
                props: { mailError: body.error.details?.mailError },
              }
            : body.error?.code || NETWORK_ERROR,
        );
      })
      .catch(() => {
        loading = false;
        showError(NETWORK_ERROR);
      });
  }

  function skip() {
    showConfirmSkipSMTPModal(() => {
      loading = true;
      error = null;

      nextStep();
    });
  }

  function onUsernameChange() {
    const service = chosenService || lastChosenService;
    if (service && mailConfiguration[service]) {
      mailConfiguration[service].sender = mailConfiguration[service].username;
    }
  }
</script>
