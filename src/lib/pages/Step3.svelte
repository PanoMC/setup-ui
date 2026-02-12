<div class="animate__animated animate__fadeIn animate_animate__slower">
  <form on:submit|preventDefault={next}>
    <div class="card-body vstack gap-3">
      <ErrorAlert error={error} />

      {$_("steps.email.description")}

      {#if !chosenService}
        <div class="list-group">
          {#each Object.keys(services) as service, index (service)}
            <button
              type="button"
              class="list-group-item list-group-item-action fw-normal"
              on:click={() => chooseService(service)}
              in:fade>
              {$_(services[service].name) || services[service].name}</button>
          {/each}
        </div>
      {:else}
        <div in:fade>
          <button
            class="btn btn-primary btn-sm mb-3"
            on:click={() => (chosenService = null)}>
            <i class="fa-solid fa-arrow-left me-1"></i>
            {$_("steps.email.return-back-to-service-list-text")}
          </button>

          <h5>{$_(services[chosenService].name)}</h5>

          <div class="row g-3">
            <div class="col-6">
              <div class="form-floating">
                <input
                  class="form-control"
                  id="mailUsername"
                  type="text"
                  placeholder="no-reply"
                  bind:value={mailConfiguration[chosenService].username}
                  on:input={onUsernameChange} />
                <label for="mailUsername"
                  >{$_("steps.email.inputs.username")}</label>
              </div>
            </div>
            <div class="col-6">
              <div class="form-floating">
                <input
                  class="form-control"
                  id="mailUserPassword"
                  placeholder="****************"
                  type="password"
                  bind:value={mailConfiguration[chosenService].password} />
                <label for="mailUserPassword"
                  >{$_("steps.email.inputs.password")}</label>
              </div>
            </div>
          </div>

          <details>
            <summary class="pt-3"
              >{$_("steps.email.inputs.details-button")}</summary>

            <div class="row g-3 pt-2">
              <div class="col-6 mb-3">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    name="ssl"
                    id="ssl"
                    aria-checked={mailConfiguration[chosenService].ssl}
                    bind:checked={mailConfiguration[chosenService].ssl} />
                  <label class="form-check-label" for="ssl">
                    {$_("steps.email.inputs.ssl")}
                  </label>
                </div>
              </div>
              <div class="col-6 mb-3">
                <label for="port">{$_("steps.email.inputs.tls-setting")}</label>
                <select
                  class="form-select"
                  id="port"
                  bind:value={mailConfiguration[chosenService].starttls}>
                  <option value="REQUIRED">REQUIRED</option>
                  <option value="OPTIONAL">OPTIONAL</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-6">
                <div class="mb-3">
                  <label for="sendingAddress"
                    >{$_("steps.email.inputs.sending-address")}</label>
                  <input
                    class="form-control"
                    id="sendingAddress"
                    type="text"
                    placeholder="no-reply@forexample.com"
                    bind:value={mailConfiguration[chosenService].sender} />
                </div>
              </div>

              <div class="col-6">
                <div class="mb-3">
                  <label for="hostname"
                    >{$_("steps.email.inputs.hostname")}</label>
                  <input
                    class="form-control"
                    id="hostname"
                    type="text"
                    placeholder="smtp.forexample.com"
                    bind:value={mailConfiguration[chosenService].hostname} />
                </div>
              </div>

              <div class="col-6">
                <div class="mb-3">
                  <label for="port">{$_("steps.email.inputs.port")}</label>
                  <input
                    class="form-control"
                    id="port"
                    placeholder="465"
                    type="number"
                    bind:value={mailConfiguration[chosenService].port} />
                </div>
              </div>

              <div class="col-6">
                <div class="mb-3">
                  <label for="port"
                    >{$_("steps.email.inputs.auth-method")}</label>
                  <select
                    class="form-select"
                    bind:value={mailConfiguration[chosenService].authMethods}>
                    <option value="PLAIN">PLAIN</option>
                    <option value=""></option>
                  </select>
                </div>
              </div>
            </div>
          </details>
        </div>
      {/if}
    </div>
  </form>
</div>

<ConfirmSkipSMTPModal />

<script context="module">
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
    const { sender, hostname, username, password, port } = email;

    let chosenService = null;

    if (sender && hostname && username && password && port) {
      Object.keys(services).forEach((service) => {
        const serviceOptions = services[service];

        if (serviceOptions.config.hostname === hostname) {
          chosenService = service;
        }
      });

      if (!chosenService) {
        chosenService = "OTHER";
      }
    }

    const mailConfiguration = {
      [chosenService]: email,
    };

    return { stepInfo: { mailConfiguration, chosenService } };
  }
</script>

<script>
  import { _ } from "svelte-i18n";
  import { onDestroy } from "svelte";
  import { nextStep, navigationState } from "$lib/Store.js";

  import { fade } from "svelte/transition";
  import ApiUtil, { NETWORK_ERROR } from "$lib/api.util.js";

  import ErrorAlert from "$lib/components/ErrorAlert.svelte";
  import ConfirmSkipSMTPModal, {
    show as showConfirmSkipSMTPModal,
  } from "$lib/components/modals/ConfirmSkipSMTPModal.svelte";

  let loading = false;
  let error = null;
  export let chosenService;

  export let mailConfiguration = {};

  $: disabled =
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

  onDestroy(() => {
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

  function chooseService(service) {
    if (!mailConfiguration[service]) {
      mailConfiguration[service] = { ...services[service].config };
    }

    chosenService = service;
  }

  function next() {
    if (disabled) {
      return;
    }

    loading = true;
    error = null;

    ApiUtil.post({
      path: "/api/setup/steps/3/verify",
      body: mailConfiguration[chosenService],
    })
      .then((body) => {
        if (body.result === "ok") {
          nextStep(mailConfiguration[chosenService]);
          return;
        }

        loading = false;
        if (body.error) {
          showError(
            body.error === "INVALID_DATA"
              ? {
                  key: "INVALID_EMAIL_DATA",
                  props: { mailError: body.mailError },
                }
              : body.error,
          );
        } else showError(NETWORK_ERROR);
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
    mailConfiguration[chosenService].sender =
      mailConfiguration[chosenService].username;
  }
</script>
