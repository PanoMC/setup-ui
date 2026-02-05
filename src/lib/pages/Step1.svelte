<div class="animate__animated animate__fadeIn animate__slower">
  <form on:submit|preventDefault={submit}>
    <div class="card-body vstack gap-3">
      <div class="form-floating">
        <input
          id="websiteName"
          class="form-control form-control-lg"
          placeholder="Panocraft"
          type="text"
          bind:value={websiteName} />
        <label for="websiteName">{$_("steps.website.inputs.title")}</label>
      </div>
      <div class="form-floating">
        <textarea
          id="websiteDescription"
          class="form-control"
          style="height: 128px;"
          bind:value={websiteDescription}></textarea>
        <label for="websiteName"
          >{$_("steps.website.inputs.description")}</label>
      </div>

      <div>
        <div class="form-floating">
          <input
            id="websiteUrl"
            class="form-control"
            placeholder={$_("steps.website.inputs.url-placeholder")}
            type="text"
            bind:value={websiteUrl} />
          <label for="websiteUrl">{$_("steps.website.inputs.url")}</label>
        </div>
        <div class="form-text">
          {$_("steps.website.inputs.url-helper")}
        </div>
      </div>
    </div>
  </form>
</div>

<script context="module">
  /** @type {import('./$types').PageLoad} */
  export async function load({ parent }) {
    const {
      stepInfo: { websiteName, websiteDescription, websiteUrl },
    } = await parent();

    return { stepInfo: { websiteName, websiteDescription, websiteUrl } };
  }
</script>

<script>
  import { nextStep, navigationState } from "$lib/Store.js";
  import { _ } from "svelte-i18n";
  import { onDestroy, onMount } from "svelte";

  let loading = false;

  export let websiteName = "";
  export let websiteDescription = "";
  export let websiteUrl = "";

  onMount(() => {
    if (websiteUrl === "") {
      const origin = window.location.origin;
      if (origin) {
        websiteUrl = origin;
      }
    }
  });

  $: disabled =
    websiteName === "" || websiteDescription === "" || websiteUrl === "";

  $: navigationState.update((s) => ({
    ...s,
    nextDisabled: disabled,
    nextLoading: loading,
    nextAction: submit,
    showSkip: false,
  }));

  onDestroy(() => {
    navigationState.update((s) => {
      if (s.nextAction === submit) {
        return { ...s, nextAction: null, nextLoading: false };
      }
      return s;
    });
  });

  function submit() {
    if (!loading && !disabled) {
      loading = true;

      nextStep({
        websiteName,
        websiteDescription,
        websiteUrl,
      });
    }
  }
</script>
