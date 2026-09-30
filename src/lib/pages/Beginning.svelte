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
  <div class="card-body vstack gap-3">
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

    <UsageModeSelect bind:value={selectedUsageMode} disabled={disabled} />
  </div>
</div>

<TransferModal
  bind:open={showTransferModal}
  initialStep={transferInitialStep}
  initialError={transferInitialError} />

<script>
  import { DEFAULT_USAGE_MODE, nextStep, navigationState } from "$lib/Store.js";
  import { onDestroy, onMount } from "svelte";
  import { goto } from "$app/navigation";

  import ApiUtil from "$lib/api.util.js";

  import {
    changeLanguage,
    currentLanguage,
    languageLoading,
    Languages,
  } from "$lib/language.util";
  import { _, isLoading } from "svelte-i18n";
  import UsageModeSelect from "$lib/components/UsageModeSelect.svelte";
  import TransferModal from "$lib/components/modals/TransferModal.svelte";

  export let stepInfo;

  let loading = false;
  $: disabled = !!stepInfo.error;

  // Kept in component state so reopening the wizard on this step shows what is configured.
  let selectedUsageMode = stepInfo.usageMode || DEFAULT_USAGE_MODE;

  let showTransferModal = false;
  /** "host" / "move" when the dialog reopens on Pano Backup / Pano Host after connecting the account. */
  let transferInitialStep = "selection";
  let transferInitialError = null;

  /** Set by the transfer dialog before it sends the owner to the website to connect an account. */
  const TRANSFER_REOPEN_KEY = "pano-setup-transfer";

  function openTransferModal() {
    transferInitialStep = "selection";
    transferInitialError = null;
    showTransferModal = true;
  }

  /**
   * Back from connecting the panomc.com account for the transfer dialog: the website returns here
   * with `encodedData` + `state` (or `failed`). The connect is finished like the last setup step
   * does it, the address is cleaned up and the dialog opens on Pano Backup again.
   */
  onMount(async () => {
    let reopen = null;

    try {
      reopen = sessionStorage.getItem(TRANSFER_REOPEN_KEY);
      sessionStorage.removeItem(TRANSFER_REOPEN_KEY);
    } catch {
      reopen = null;
    }

    if (reopen !== "host" && reopen !== "move") return;

    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get("encodedData");
    const state = params.get("state");
    let connectError = null;

    if (encodedData && state) {
      const body = await ApiUtil.post({
        path: "/api/setup/steps/4/platform/connect",
        body: { encodedData, state },
      }).catch(() => null);

      if (!body || (body.error && body.error !== "ALREADY_CONNECTED_TO_PANO")) {
        connectError = { key: "import.host.connect-failed", code: body?.error };
      }
    } else if (params.has("failed")) {
      connectError = { key: "import.host.connect-failed", code: "FAILED" };
    }

    if (window.location.search) {
      await goto(window.location.pathname, { replaceState: true, noScroll: true });
    }

    transferInitialStep = reopen;
    transferInitialError = connectError;
    showTransferModal = true;
  });

  $: navigationState.update((s) => ({
    ...s,
    nextDisabled: disabled,
    nextLoading: loading,
    nextAction: start,
    nextLabel: "buttons.start",
    backDisabled: true, // No back from first page
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
        usageMode: selectedUsageMode,
      });
    }
  }
</script>
