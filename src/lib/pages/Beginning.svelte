<div class:opacity-50={disabled}>
  {#if stepInfo.stage === "ALPHA" && !$languageLoading && !$isLoading}
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
  {#if stepInfo.stage === "BETA" && !$languageLoading && !$isLoading}
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

<TransferModal bind:open={showTransferModal} bind:resume={connectResume} />

<script>
  import { DEFAULT_USAGE_MODE, nextStep, navigationState } from "$lib/Store.js";
  import { onDestroy, onMount } from "svelte";
  import { page } from "$app/stores";
  import { replaceState } from "$app/navigation";

  import {
    changeLanguage,
    currentLanguage,
    languageLoading,
    Languages,
  } from "$lib/language.util";
  import { _, isLoading } from "svelte-i18n";
  import UsageModeSelect from "$lib/components/UsageModeSelect.svelte";
  import TransferModal from "$lib/components/modals/TransferModal.svelte";
  import { connectReturn } from "$lib/panoHost.util.js";

  export let stepInfo;

  let loading = false;
  $: disabled = !!stepInfo.error;

  // Kept in component state so reopening the wizard on this step shows what is configured.
  let selectedUsageMode = stepInfo.usageMode || DEFAULT_USAGE_MODE;

  let showTransferModal = false;
  let connectResume = null;

  // The transfer dialog's panomc.com sign-in comes back here (`?encodedData=…&state=…`): reopen
  // it on "Pano Backup" to finish the connection, and drop the query from the address bar.
  onMount(() => {
    const returned = connectReturn($page.url.searchParams);

    if (!returned) return;

    replaceState($page.url.pathname, {});
    connectResume = returned;
    showTransferModal = true;
  });

  function openTransferModal() {
    showTransferModal = true;
  }

  $: navigationState.update((s) => ({
    ...s,
    nextDisabled: disabled,
    nextLoading: loading,
    nextAction: start,
    nextLabel: "buttons.start",
    backDisabled: true, // No back from first page
    showTransfer: true,
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
        usageMode: selectedUsageMode,
      });
    }
  }
</script>
