<div class="animate__animated animate__fadeIn">
  <div class="animate__animated animate__slideInUp">
    <h4>{$_("steps.email.title")}</h4>
    <p class="text-muted">
      {$_("steps.email.description")}
      <br />
      <a href="#">
        <i class="fa-solid fa-up-right-from-square me-2"></i>
        {$_("steps.email.help-link-text")}
      </a>
    </p>
  </div>
  <ErrorAlert error="{error}" />

  <form on:submit|preventDefault="{next}">
    {#if !chosenService}
      <div class="list-group mb-3">
        {#each Object.keys(services) as service, index (service)}
          <a
            href="javascript:void(0)"
            class="list-group-item list-group-item-action"
            on:click="{() => chooseService(service)}"
            in:fade>
            {$_(services[service].name) || services[service].name}</a>
        {/each}
      </div>
    {:else}
      <div in:fade>
        <button
          class="btn btn-link mb-3 ps-0"
          on:click="{() => (chosenService = null)}">
          <i class="fa-solid fa-arrow-left me-1"></i>
          {$_("steps.email.return-back-to-service-list-text")}
        </button>

        <h5>{$_(services[chosenService].name)}</h5>

        <div class="row">
          <div class="col-6">
            <label for="mailUsername"
              >{$_("steps.email.inputs.username")}</label>
            <input
              class="form-control"
              id="mailUsername"
              type="text"
              placeholder="no-reply"
              bind:value="{mailConfiguration[chosenService].username}"
              on:input="{onUsernameChange}" />
          </div>
          <div class="col-6">
            <label for="mailUserPassword"
              >{$_("steps.email.inputs.password")}</label>
            <input
              class="form-control"
              id="mailUserPassword"
              placeholder="****************"
              type="password"
              bind:value="{mailConfiguration[chosenService].password}" />
          </div>
        </div>

        <details>
          <summary class="h6 text-primary my-3"
            >{$_("steps.email.inputs.details-button")}</summary>

          <div class="row">
            <div class="col-6 mb-3">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  name="ssl"
                  id="ssl"
                  aria-checked="{mailConfiguration[chosenService].ssl}"
                  bind:checked="{mailConfiguration[chosenService].ssl}" />
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
                bind:value="{mailConfiguration[chosenService].starttls}">
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
                  bind:value="{mailConfiguration[chosenService].sender}" />
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
                  bind:value="{mailConfiguration[chosenService].hostname}" />
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
                  bind:value="{mailConfiguration[chosenService].port}" />
              </div>
            </div>

            <div class="col-6">
              <div class="mb-3">
                <label for="port">{$_("steps.email.inputs.auth-method")}</label>
                <select
                  class="form-select"
                  bind:value="{mailConfiguration[chosenService].authMethods}">
                  <option value="PLAIN">PLAIN</option>
                  <option value=""></option>
                </select>
              </div>
            </div>
          </div>
        </details>
      </div>
    {/if}
    <div class="row">
      <div class="col-4">
        <a
          href="javascript:void(0);"
          class="btn btn-link w-100"
          role="button"
          class:disabled="{loading}"
          disabled="{loading}"
          on:click="{back}">{$_("buttons.back")}</a>
      </div>
      <div class="col-4">
        <div class="animate__animated animate__zoomIn">
          <button
            type="submit"
            class="btn btn-primary w-100"
            class:disabled="{loading || disabled}"
            disabled="{loading || disabled}">
            {$_("buttons.next")}
            {#if nextLoading}
              <span
                class="spinner-border spinner-border-sm text-secondary"
                role="status"></span>
            {/if}
          </button>
        </div>
      </div>
      <div class="col-4">
        <div class="animate__animated animate__zoomIn">
          <button
            type="button"
            class="btn btn-primary w-100"
            on:click="{skip}"
            disabled="{loading}">
            {$_("buttons.skip")}
          </button>
        </div>
      </div>
    </div>
  </form>
</div>

<ConfirmSkipSMTPModal/>

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
  import { backStep, nextStep } from "$lib/Store.js";

  import { fade } from "svelte/transition";
  import ApiUtil, { NETWORK_ERROR } from "$lib/api.util.js";

  import ErrorAlert from "$lib/components/ErrorAlert.svelte";
  import ConfirmSkipSMTPModal, { show as showConfirmSkipSMTPModal } from "$lib/components/modals/ConfirmSkipSMTPModal.svelte";

  let loading = false;
  let nextLoading;
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
    nextLoading = true;
    error = null;

    ApiUtil.post({
      path: "/api/setup/steps/3/verify",
      body: mailConfiguration[chosenService],
    })
      .then((body) => {
        if (body.result === "ok") {
          nextStep(mailConfiguration[chosenService]);
        } else if (body.error) {
          showError(body.error);
        } else showError(NETWORK_ERROR);
      })
      .catch(() => {
        showError(NETWORK_ERROR);
      });
  }

  function skip() {
    showConfirmSkipSMTPModal(() => {
      loading = true;
      error = null;

      nextStep();
    })
  }

  function onUsernameChange() {
    mailConfiguration[chosenService].sender =
      mailConfiguration[chosenService].username;
  }
</script>
