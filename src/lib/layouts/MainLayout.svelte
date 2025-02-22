<svelte:head>
  <title>{$_("title")}{$currentStep !== 0 ? ` ${$currentStep}/4` : ""}</title>
</svelte:head>

<App>
  <div class="bg-light min-vh-100 bg-light overflow-scroll">
    <div class="navbar bg-primary navbar-dark navbar-expand-lg">
      <div class="container">
        <a href="https://panomc.com" target="_blank" class="navbar-brand">
          <img
            alt="Pano"
            src="/assets/img/logo.svg"
            class="d-inline-block align-text-top me-2"
            width="18" />
          {$_("title")}
        </a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <i class="fa-solid fa-bars"></i>
        </button>

        <Navbar />
      </div>
    </div>

    <div class="pt-3">
      <div class="container">
        <ErrorAlert error="{stepInfo.error}" />
        <div class="card">
          <div class="card-body">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
</App>

<ToastContainer />

<script context="module">
  import { init as initLanguage } from "$lib/language.util";
  import {
    checkCurrentStep,
    checkRoute,
    currentStep,
    session,
  } from "$lib/Store.js";
  import { redirect } from "@sveltejs/kit";
  import { updateApiUrl } from "$lib/variables.js";

  /**  @type {import('./$types').LayoutServerLoad} */
  export async function loadServer(input) {
    const {
      url: { pathname },
      locals: { acceptedLanguage, CSRFToken },
    } = input;
    // noinspection JSUnresolvedReference
    const apiUrlEnv = process.env.API_URL

    if (apiUrlEnv) {
      updateApiUrl(apiUrlEnv)
    }

    const stepInfo = await checkCurrentStep();
    const { step } = stepInfo;

    const route = checkRoute(step, pathname);

    if (route) {
      throw redirect(302, route);
    }

    return { stepInfo, acceptedLanguage, CSRFToken, apiUrlEnv };
  }

  /**
   * @type {import('@sveltejs/kit').LoadLayout}
   */
  export async function load(event) {
    const {
      data,
      data: {
        stepInfo: { step },
        acceptedLanguage,
        CSRFToken,
        apiUrlEnv
      },
    } = event;
    if (apiUrlEnv) {
      updateApiUrl(apiUrlEnv)
    }

    session.set({ CSRFToken });
    currentStep.set(step);

    await initLanguage(acceptedLanguage, event);

    return data;
  }
</script>

<script>
  import { _ } from "svelte-i18n";

  import App from "$lib/components/App.svelte";
  import ErrorAlert from "$lib/components/ErrorAlert.svelte";
  import Navbar from "$lib/components/Navbar.svelte";

  import ToastContainer from "$lib/components/ToastContainer.svelte";
  import { onMount } from "svelte";
  import { initialized } from "$lib/Store.js";

  export let stepInfo;

  onMount(() => {
    initialized.set(true);
  })
</script>
