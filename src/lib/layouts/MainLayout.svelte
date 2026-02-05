<style>
  :global(.btn-icon) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    padding: 0;
  }
</style>

<svelte:head>
  <title
    >{$_("title")} {$currentStep !== 0 ? ` (${$currentStep}/4)` : ""}</title>
</svelte:head>
<App>
  <Navbar />
  <PageHeader title={$_("title")} />

  <div class="container vstack gap-3 pt-4" style="max-width: 720px;">
    <ErrorAlert error={stepInfo.error} />
    <PageActions>
      <div slot="left">
        {#if $currentStep !== 0}
          <PageNav>
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
                  <span>{$_(step.name)}</span>
                </button>
              </li>
            {/each}
          </PageNav>
        {/if}
      </div>
      <div slot="right" class="hstack gap-2">
        <button
          class="btn btn-link"
          on:click={back}
          disabled={$navigationState.backDisabled ||
            $navigationState.nextLoading}
          title={$_("buttons.back")}>
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        {#if $navigationState.showSkip}
          <button
            class="btn btn-link"
            on:click={$navigationState.skipAction}
            disabled={$navigationState.nextLoading}
            title={$_("buttons.skip")}>
            <i class="fa-solid fa-forward-step"></i>
          </button>
        {/if}
        <button
          class="btn btn-secondary"
          on:click={handleNext}
          disabled={$navigationState.nextDisabled ||
            $navigationState.nextLoading}>
          {#if $navigationState.nextLoading}
            <span class="spinner-border spinner-border-sm me-2" role="status"
            ></span>
          {/if}
          {$_($navigationState.nextLabel)}
        </button>
      </div>
    </PageActions>
    <div class="card">
      <div
        class="card-header fw-bold d-flex justify-content-between align-items-center">
        <span>{$_($pageTitle)}</span>
        {#if $currentStep !== 0}
          <small class="text-muted">({$currentStep}/4)</small>
        {/if}
      </div>
      <slot />
    </div>
  </div>
</App>

<ToastContainer />

<script context="module">
  import { init as initLanguage } from "$lib/language.util";
  import { writable } from "svelte/store";
  import {
    checkCurrentStep,
    checkRoute,
    currentStep,
    session,
  } from "$lib/Store.js";
  import { redirect } from "@sveltejs/kit";
  import { browser } from "$app/environment";
  import {
    updateApiUrl,
    updatePanoWebsiteUrl,
    checkDomainRedirection,
  } from "$lib/variables.js";

  const pageTitle = writable(null);

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

    if (browser) {
      checkDomainRedirection();
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
  import { goToStep, navigationState, backStep } from "$lib/Store.js";

  import App from "$lib/components/App.svelte";
  import ErrorAlert from "$lib/components/ErrorAlert.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import PageHeader from "$lib/components/PageHeader.svelte";
  import PageActions from "$lib/components/PageActions.svelte";
  import PageNav from "$lib/components/PageNav.svelte";

  import ToastContainer from "$lib/components/ToastContainer.svelte";
  import { onMount, setContext } from "svelte";
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

  setContext("pageTitle", pageTitle);

  function goStep(step) {
    goToStep(step, $page.url.pathname);
  }

  function back() {
    backStep($page.url.pathname);
  }

  function handleNext() {
    if ($navigationState.nextAction) {
      $navigationState.nextAction();
    }
  }

  onMount(() => {
    initialized.set(true);
  });

  $: if ($currentStep === 0) {
    pageTitle.set("welcome-title");
  } else {
    pageTitle.set(steps[$currentStep - 1]?.name || "");
  }
</script>
