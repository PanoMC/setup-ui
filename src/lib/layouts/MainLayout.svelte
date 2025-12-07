<style>
  .custom-container {
    max-width: 540px;
  }
</style>

<svelte:head>
  <title>{$_("title")}{$currentStep !== 0 ? ` ${$currentStep}/4` : ""}</title>
</svelte:head>
<App>
  <Navbar />

  <div class="container custom-container vstack gap-3 pt-3">
    <ErrorAlert error={stepInfo.error} />
    {#if $currentStep !== 0}
      <ul class="nav nav-pills justify-content-center">
        {#each steps as step, index}
          {@const stepNumber = index + 1}
          <li class="nav-item">
            <button
              class="nav-link"
              class:active={$currentStep === stepNumber}
              class:completed={$currentStep > stepNumber}
              class:disabled={$currentStep < stepNumber}
              on:click={() => goStep(stepNumber)}
              disabled={$currentStep < stepNumber}>
              <i class="step-icon me-2 {step.icon}"></i>
              <span class="d-none d-sm-inline">{$_(step.name)}</span>
              <span class="d-sm-none">{stepNumber}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
    <div class="card">
      <slot />
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
  import { updateApiUrl, updatePanoWebsiteUrl } from "$lib/variables.js";

  /**  @type {import('./$types').LayoutServerLoad} */
  export async function loadServer(input) {
    const {
      url: { pathname },
      locals: { acceptedLanguage, CSRFToken },
    } = input;
    // noinspection JSUnresolvedReference
    const apiUrlEnv = process.env.API_URL;

    // noinspection JSUnresolvedReference
    const panoWebsiteUrlEnv = process.env.PANO_WEBSITE_URL;

    if (apiUrlEnv) {
      updateApiUrl(apiUrlEnv);
    }

    if (panoWebsiteUrlEnv) {
      updatePanoWebsiteUrl(panoWebsiteUrlEnv);
    }

    const stepInfo = await checkCurrentStep();
    const { step } = stepInfo;

    const route = checkRoute(step, pathname);

    if (route) {
      throw redirect(302, route);
    }

    return {
      stepInfo,
      acceptedLanguage,
      CSRFToken,
      apiUrlEnv,
      panoWebsiteUrlEnv,
    };
  }

  /**
   * @type {import('@sveltejs/kit').LoadLayout}
   */
  export async function load(event) {
    const {
      data,
      data: {
        stepInfo: { step, locale },
        CSRFToken,
        apiUrlEnv,
        panoWebsiteUrlEnv,
      },
    } = event;
    if (apiUrlEnv) {
      updateApiUrl(apiUrlEnv);
    }

    if (panoWebsiteUrlEnv) {
      updatePanoWebsiteUrl(panoWebsiteUrlEnv);
    }

    session.set({ CSRFToken });
    currentStep.set(step);

    await initLanguage(locale, event);

    return data;
  }
</script>

<script>
  import { _ } from "svelte-i18n";
  import { page } from "$app/stores";
  import { goToStep } from "$lib/Store.js";

  import App from "$lib/components/App.svelte";
  import ErrorAlert from "$lib/components/ErrorAlert.svelte";
  import Navbar from "$lib/components/Navbar.svelte";

  import ToastContainer from "$lib/components/ToastContainer.svelte";
  import { onMount } from "svelte";
  import { initialized } from "$lib/Store.js";

  const steps = [
    {
      name: "steps.website.title",
      icon: "fa-solid fa-globe",
    },
    {
      name: "steps.database.title",
      icon: "fa-solid fa-database",
    },
    {
      name: "steps.email.title",
      icon: "fa-solid fa-envelope",
    },
    {
      name: "steps.account.title",
      icon: "fa-solid fa-user",
    },
  ];

  export let stepInfo;

  function goStep(step) {
    goToStep(step, $page.url.pathname);
  }

  onMount(() => {
    initialized.set(true);
  });
</script>
