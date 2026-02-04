<div class="animate__animated animate__fadeIn animate__slower">
  <div class="card-header">
    {$_("steps.website.title")}
  </div>
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

      <div class="row">
        <div class="col-6">
          <button
            class="btn btn-link w-100"
            type="button"
            class:disabled={loading}
            disabled={loading}
            on:click={back}>{$_("buttons.back")}</button>
        </div>
        <div class="col-6">
          <div class="animate__animated animate__zoomIn animate__slow">
            <button
              type="submit"
              class="btn btn-secondary w-100"
              class:disabled={loading || disabled}
              disabled={loading || disabled}>
              {$_("buttons.next")}
              {#if nextLoading}
                <span
                  class="spinner-border spinner-border-sm text-primary"
                  role="status"></span>
              {/if}
            </button>
          </div>
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
  import { backStep, nextStep } from "$lib/Store.js";
  import { _ } from "svelte-i18n";

  let loading = false;
  let nextLoading = false;

  export let websiteName = "";
  export let websiteDescription = "";
  export let websiteUrl = "";

  import { onMount } from "svelte";

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

  function submit() {
    if (!loading && !disabled) {
      loading = true;
      nextLoading = true;

      nextStep({
        websiteName,
        websiteDescription,
        websiteUrl,
      });
    }
  }

  function back() {
    if (!loading) {
      loading = true;

      backStep();
    }
  }
</script>
