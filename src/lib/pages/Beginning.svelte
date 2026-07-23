<div class:opacity-50={disabled}>
  {#if stepInfo.stage === 'ALPHA' && !$languageLoading && !$isLoading}
    <div class="card-body pb-0">
      <div class="alert alert-warning mb-0">
        <h6 class="alert-heading hstack gap-2">
          <i class="fa-solid fa-triangle-exclamation"></i>
          {$_("alpha-warning.title")}
        </h6>
        <p class="mb-0 small">
          {$_("alpha-warning.description")}
        </p>
      </div>
    </div>
  {/if}
  {#if stepInfo.stage === 'BETA' && !$languageLoading && !$isLoading}
    <div class="card-body pb-0">
      <div class="alert alert-info mb-0">
        <h6 class="alert-heading hstack gap-2">
          <i class="fa-solid fa-circle-info"></i>
          {$_("beta-warning.title")}
        </h6>
        <p class="mb-0 small">
          {$_("beta-warning.description")}
        </p>
      </div>
    </div>
  {/if}
  <div class="card-body">
    <div class="form-floating">
      <select
        class="form-select"
        id="languageSelect"
        disabled={$languageLoading}
        autocomplete="false"
        on:change={(e) => changeLanguage($Languages[e.target.value])}>
        {#each Object.keys($Languages) as language (language)}
          <option
            value={language}
            selected={$currentLanguage === $Languages[language]}>
            {$Languages[language].name}
          </option>
        {/each}
      </select>
      <label for="languageSelect">{$_("language-label")}</label>
    </div>
  </div>
</div>

{#if showTransferModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div transition:fade={{ duration: 150 }} class="modal-backdrop fade show" on:click={() => showTransferModal = false}></div>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    transition:fade={{ duration: 150 }}
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.5);"
    on:click|self={() => showTransferModal = false}>
    <div in:fly={{ y: -50, duration: 300 }} out:fly={{ y: -50, duration: 150 }} class="modal-dialog modal-dialog-centered">
      <div class="modal-content text-start">
        <div class="modal-header">
          <h5 class="modal-title">{$_("import.modal-title")}</h5>
          <button type="button" class="btn-close" on:click={() => showTransferModal = false} aria-label="Close"></button>
        </div>
        <div class="modal-body overflow-hidden p-0">
          <div class="modal-steps-container" class:slide-active={modalStep === 'pano-transfer'}>
            <!-- Step 1: Selection Panel -->
            <div class="modal-step-pane p-3">
              <div class="list-group">
                <button
                  type="button"
                  class="list-group-item list-group-item-action host-item-gradient d-flex justify-content-between align-items-start p-3"
                  on:click={() => { importFromHost(); showTransferModal = false; }}>
                  <div class="me-auto text-start">
                    <div class="d-flex align-items-center gap-2">
                      <div class="d-inline-flex align-items-center justify-content-center bg-primary rounded" style="width: 24px; height: 24px;">
                        <img src="/assets/img/logo.svg" width="16" height="16" alt="Pano" />
                      </div>
                      <h5 class="mb-0">{$_("import.pano-host.title")}</h5>
                      <span class="badge text-bg-primary">{$_("import.pano-host.badge")}</span>
                    </div>
                    <div class="text-body-secondary mt-2 fw-normal">
                      {$_("import.pano-host.description")}
                    </div>
                  </div>
                  <i class="fa-solid fa-cloud-arrow-down text-body-secondary align-self-center fs-5"></i>
                </button>

                <button
                  type="button"
                  class="list-group-item list-group-item-action d-flex justify-content-between align-items-start p-3"
                  on:click={() => { modalStep = 'pano-transfer'; }}>
                  <div class="me-auto text-start">
                    <div class="d-flex align-items-center gap-2">
                      <h5 class="mb-0">{$_("import.other-pano.title")}</h5>
                    </div>
                    <div class="text-body-secondary mt-1 fw-normal">
                      {$_("import.other-pano.description")}
                    </div>
                  </div>
                  <i class="fa-solid fa-file-import text-body-secondary align-self-center fs-5"></i>
                </button>
              </div>
            </div>

            <!-- Step 2: Transfer Details Panel -->
            <div class="modal-step-pane p-3">
              <button
                type="button"
                class="btn btn-link text-decoration-none p-0 mb-3 hstack gap-2"
                on:click={() => { modalStep = 'selection'; isUrlConnected = false; }}>
                <i class="fa-solid fa-arrow-left"></i>
                <span>{$_("buttons.back")}</span>
              </button>

              <div class="mb-0">
                <div class="form-floating">
                  <input
                    type="url"
                    class="form-control"
                    class:rounded-bottom-0={isUrlConnected}
                    id="platformUrlInput"
                    placeholder="Platform URL"
                    disabled={urlConnecting || isUrlConnected}
                    bind:value={platformUrl} />
                  <label for="platformUrlInput">Platform URL</label>
                </div>

                {#if !isUrlConnected}
                  <div class="mt-1 ms-1 small">
                    <a
                      href="{PANO_WEBSITE_URL}/profile/platforms"
                      target="_blank"
                      rel="noreferrer"
                      class="text-decoration-none small d-inline-flex align-items-center gap-1">
                      <span>{$_("import.get-platform-url")}</span>
                      <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                  </div>
                {/if}

                {#if isUrlConnected}
                  <div transition:slide={{ duration: 200 }} class="form-floating">
                    <input
                      type="text"
                      class="form-control rounded-top-0"
                      style="margin-top: -1px;"
                      id="transferCodeInput"
                      placeholder="Transfer Kodu"
                      bind:value={transferCode} />
                    <label for="transferCodeInput">Transfer Kodu</label>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>

        {#if modalStep === 'pano-transfer'}
          <div class="modal-footer">
            {#if !isUrlConnected}
              <button
                type="button"
                class="btn btn-primary w-100"
                disabled={!platformUrl || urlConnecting}
                on:click={handleConnectUrl}>
                {#if urlConnecting}
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {$_("buttons.connecting")}
                {:else}
                  {$_("buttons.connect")}
                {/if}
              </button>
            {:else}
              <button
                type="button"
                class="btn btn-secondary w-100"
                disabled={!transferCode}
                on:click={handleTransferSubmit}>
                Transfer Et
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<script>
  import { nextStep, navigationState } from "$lib/Store.js";
  import { onDestroy } from "svelte";
  import { fade, fly, slide } from "svelte/transition";

  import {
    changeLanguage,
    currentLanguage,
    languageLoading,
    Languages,
  } from "$lib/language.util";
  import { _, isLoading } from "svelte-i18n";
  import { PANO_WEBSITE_URL } from "$lib/variables.js";

  export let stepInfo;

  let loading = false;
  $: disabled = !!stepInfo.error;

  let showTransferModal = false;
  let modalStep = 'selection';
  let transferCode = '';
  let platformUrl = '';
  let urlConnecting = false;
  let isUrlConnected = false;

  function openTransferModal() {
    modalStep = 'selection';
    transferCode = '';
    platformUrl = '';
    urlConnecting = false;
    isUrlConnected = false;
    showTransferModal = true;
  }

  function handleConnectUrl() {
    if (!platformUrl) return;
    urlConnecting = true;
    setTimeout(() => {
      urlConnecting = false;
      isUrlConnected = true;
    }, 1000);
  }

  function importFromHost() {
    console.log("Import from Pano Host triggered.");
  }

  function importFromPano() {
    console.log("Import from another Pano backup triggered.", { transferCode, platformUrl });
  }

  function handleTransferSubmit() {
    importFromPano();
    showTransferModal = false;
  }

  $: navigationState.update((s) => ({
    ...s,
    nextDisabled: disabled,
    nextLoading: loading,
    nextAction: start,
    nextLabel: "buttons.start",
    backDisabled: true, // No back from first page
    showTransfer: true,
    transferAction: openTransferModal
  }));

  onDestroy(() => {
    navigationState.update((s) => {
      if (s.nextAction === start) {
        return {
          ...s,
          nextAction: null,
          nextLoading: false,
          backDisabled: false,
          nextLabel: "buttons.next",
          showTransfer: false,
          transferAction: null,
        };
      }
      return s;
    });
  });

  function start() {
    if (!disabled) {
      loading = true;

      nextStep({
        locale: $currentLanguage.locale,
      });
    }
  }
</script>

<style>
  .host-item-gradient {
    background: linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.12) 0%, rgba(var(--bs-info-rgb), 0.12) 100%) !important;
    border: 1px solid rgba(var(--bs-primary-rgb), 0.25) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .host-item-gradient:hover {
    background: linear-gradient(135deg, rgba(var(--bs-primary-rgb), 0.20) 0%, rgba(var(--bs-info-rgb), 0.20) 100%) !important;
    border-color: rgba(var(--bs-primary-rgb), 0.45) !important;
    box-shadow: 0 4px 15px rgba(var(--bs-primary-rgb), 0.15) !important;
  }
  .modal-steps-container {
    display: flex;
    width: 200%;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .modal-step-pane {
    width: 50%;
    flex-shrink: 0;
  }
  .slide-active {
    transform: translateX(-50%);
  }
  .modal-step-pane .form-floating:focus-within {
    z-index: 5;
    position: relative;
  }
</style>
