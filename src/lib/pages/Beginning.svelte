<div class:opacity-50="{disabled}">
  <div class="animate__animated animate__slideInUp">
    <h4>{$_("welcome-title")}</h4>
    <p>
      {$_("welcome-description")}
    </p>
  </div>

  <ul class="list-group mb-3">
    {#each Object.keys($Languages) as language, index (language)}
      <li class="list-group-item">
        <input
          class="form-check-input me-1"
          type="radio"
          name="langSelectionRadio"
          value=""
          id="lang{language}Radio"
          aria-checked="{$currentLanguage === $Languages[language]}"
          checked="{$currentLanguage === $Languages[language]}"
          on:click="{() => changeLanguage($Languages[language])}"
          disabled="{$languageLoading}" />
        <label class="form-check-label" for="lang{language}Radio"
          >{$Languages[language].name}</label>
      </li>
    {/each}
  </ul>

  <div class="row justify-content-end">
    <div class="col-6">
      <div class="animate__animated animate__zoomIn">
        <button
          class="btn btn-secondary w-100"
          on:click="{start}"
          class:disabled="{loading || disabled}"
          disabled="{loading || disabled}">
          {$_("start-button")}
        </button>
      </div>
    </div>
  </div>
</div>

<script>
  import { nextStep } from "$lib/Store.js";

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

  function start() {
    if (!disabled) {
      loading = true;

      nextStep({
        locale: $currentLanguage.locale
      });
    }
  }
</script>
