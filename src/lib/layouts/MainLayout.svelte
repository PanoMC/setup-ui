<style>
  .loading-container {
    width: 100%;
    min-height: 450px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .center-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-wrapper {
    width: 64px;
    height: 64px;
  }

  .mc-img-wrapper,
  .hytale-img-wrapper {
    width: 80px;
    height: 80px;
  }

  .pano-anim {
    animation: logo-swap-pano 4.5s infinite ease-in-out;
  }

  .mc-anim {
    animation: logo-swap-mc 4.5s infinite ease-in-out;
  }

  .hytale-anim {
    animation: logo-swap-hytale 4.5s infinite ease-in-out;
  }

  @keyframes logo-swap-pano {
    0%,
    28% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    33%,
    95% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.6);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  @keyframes logo-swap-mc {
    0%,
    28% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.6);
    }
    33%,
    61% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.1);
    }
    66%,
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.6);
    }
  }

  @keyframes logo-swap-hytale {
    0%,
    61% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.6);
    }
    66%,
    95% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.6);
    }
  }

  .logo-img,
  .mc-img,
  .hytale-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .page-header-wrapper {
    transition:
      opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1;
    transform: translateY(0);
  }

  .page-header-wrapper.finishing {
    opacity: 0;
    transform: translateY(-50px);
    pointer-events: none;
  }
</style>

<svelte:head>
  <title>{$_("title")}</title>
</svelte:head>
<App>
  <div class:d-none={$isFinishing}>
    <Navbar version={stepInfo.version} />
  </div>
  <div class="page-header-wrapper" class:finishing={$isFinishing && !stepInfo.error}>
    <PageHeader
      title={$_("title")}
      subTitle={$currentStep !== 0 ? `(${$currentStep}/4)` : undefined}
      backgroundImage="/assets/img/cover.png" />
  </div>

  <div class="container">
    {#if $isFinishing}
      <div class="loading-container">
        <div class="loader-content position-relative" style="height: 100px; width: 100px;">
          <div class="logo-wrapper pano-anim center-content">
            <img alt="Pano" src="{base}/assets/img/logo.svg" class="logo-img" />
          </div>
          <div class="mc-img-wrapper mc-anim center-content">
            <img alt="Minecraft" src="{base}/assets/img/minecraft-icon.png" class="mc-img" />
          </div>
          <div class="hytale-img-wrapper hytale-anim center-content">
            <img alt="Hytale" src="{base}/assets/img/hytale-icon.png" class="hytale-img" />
          </div>
        </div>
      </div>
    {/if}

    <div class="vstack gap-3" class:d-none={$isFinishing}>
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
          {#if $currentStep !== 0}
            <button
              class="btn btn-link"
              on:click={back}
              disabled={$navigationState.nextLoading}>
              {$_("buttons.back")}
            </button>
          {/if}
          
          {#if $currentStep === 0 && $navigationState.showTransfer}
            <button
              class="btn btn-primary"
              on:click={$navigationState.transferAction}
              disabled={$navigationState.nextLoading}>
              <i class="fa-solid fa-cloud-arrow-down me-2"></i>
              {$_("import.toggle-btn")}
            </button>
          {/if}

          <div class="btn-group">
            {#if $navigationState.showSkip}
              <button
                class="btn btn-secondary"
                on:click={$navigationState.skipAction}
                disabled={$navigationState.nextLoading}>
                {$_("buttons.skip")}
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
        </div>
      </PageActions>
      <div class="card">
        <slot />
      </div>
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
  import { base } from "$app/paths";
  import {
    updateApiUrl,
    updatePanoWebsiteUrl,
    checkDomainRedirection,
    PANO_WEBSITE_URL,
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
  import { goToStep, navigationState, backStep, isFinishing } from "$lib/Store.js";

  import App from "$lib/components/App.svelte";
  import ErrorAlert from "$lib/components/ErrorAlert.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import tooltip from "$lib/tooltip.util.js";
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

  $: if ($currentStep !== undefined) {
    navigationState.update((s) => ({
      ...s,
      nextDisabled: $currentStep === 4,
      nextLoading: false,
      nextLabel: $currentStep === 4 ? "buttons.finish" : ($currentStep === 0 ? "buttons.start" : "buttons.next"),
      nextAction: null,
      showSkip: $currentStep === 3,
      skipAction: null,
    }));
  }

  $: if ($currentStep === 0) {
    pageTitle.set("welcome-title");
  } else {
    pageTitle.set(steps[$currentStep - 1]?.name || "");
  }
</script>
