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

<script>
  import { nextStep, navigationState } from "$lib/Store.js";
  import { onDestroy } from "svelte";

  import {
    changeLanguage,
    currentLanguage,
    languageLoading,
    Languages,
  } from "$lib/language.util";
  import { _, isLoading } from "svelte-i18n";

  export let stepInfo;

  let loading = false;
  $: disabled = !!stepInfo.error;

  $: navigationState.update((s) => ({
    ...s,
    nextDisabled: disabled,
    nextLoading: loading,
    nextAction: start,
    nextLabel: "buttons.start",
    backDisabled: true, // No back from first page
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
