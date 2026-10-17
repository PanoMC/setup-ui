<div class:opacity-50={disabled}>
  <div class="card-body vstack gap-3">
    <div>
      <h5 class="mb-3" id="languageLabel">{$_("language-label")}</h5>
      <div
        class="list-group list-group-horizontal-md"
        role="radiogroup"
        aria-labelledby="languageLabel">
        {#each Object.keys($Languages) as language (language)}
          {@const selected = $currentLanguage === $Languages[language]}
          <button
            type="button"
            role="radio"
            class="list-group-item list-group-item-action d-flex align-items-center gap-2 text-start"
            class:active={selected}
            style="flex: 1 1 0;"
            aria-checked={selected}
            disabled={$languageLoading}
            on:click={() => changeLanguage($Languages[language])}>
            <LanguageFlag locale={$Languages[language].locale} />
            <span class="fw-semibold">{$Languages[language].name}</span>
          </button>
        {/each}
      </div>
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

  import { finishPanoConnect } from "$lib/pano-connect.util.js";

  import {
    changeLanguage,
    currentLanguage,
    languageLoading,
    Languages,
  } from "$lib/language.util";
  import { _ } from "svelte-i18n";
  import LanguageFlag from "$lib/components/LanguageFlag.svelte";
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

    const failed = await finishPanoConnect(window.location.search);
    const connectError = failed
      ? {
          key: "import.host.connect-failed",
          code: failed.code,
        }
      : null;

    if (window.location.search) {
      await goto(window.location.pathname, {
        replace: true, reset: false });
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
    transferAction: openTransferModal,
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
