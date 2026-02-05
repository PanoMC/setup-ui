<div class:opacity-50={disabled}>
  <div class="card-body">
    <div class="form-floating">
      <select
        class="form-select"
        id="languageSelect"
        disabled={$languageLoading}
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
  import { _ } from "svelte-i18n";

  export let stepInfo;

  let loading = false;
  $: disabled = !!stepInfo.error;

  $: navigationState.update((s) => ({
    ...s,
    nextDisabled: disabled,
    nextLoading: loading,
    nextAction: start,
    nextLabel: "start-button",
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
