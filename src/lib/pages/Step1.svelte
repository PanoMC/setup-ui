<div class="animate__animated animate__fadeIn">
  <div class="animate__animated animate__slideInUp">
    <h4>{$_("steps.website.title")}</h4>

    <p class="text-muted">
      {$_("steps.website.description")}
    </p>
  </div>
  <form on:submit|preventDefault="{submit}">
    <label for="websiteName">{$_("steps.website.inputs.title")}</label>
    <input
      id="websiteName"
      class="form-control form-control-lg mb-3"
      placeholder="Panocraft"
      type="text"
      bind:value="{websiteName}" />
    <label for="websiteName">{$_("steps.website.inputs.description")}</label>
    <textarea
      id="websiteDescription"
      class="form-control mb-3"
      rows="2"
      bind:value="{websiteDescription}"></textarea>

    <div class="row">
      <div class="col-6">
        <a
          href="javascript:void(0);"
          class="btn btn-link w-100"
          role="button"
          class:disabled="{loading}"
          disabled="{loading}"
          on:click="{back}">{$_("buttons.back")}</a>
      </div>
      <div class="col-6">
        <div class="animate__animated animate__zoomIn">
          <button
            type="submit"
            class="btn btn-secondary w-100"
            class:disabled="{loading || disabled}"
            disabled="{loading || disabled}">
            {$_("buttons.next")}
          </button>
        </div>
      </div>
    </div>
  </form>
</div>

<script context="module">
  /** @type {import('./$types').PageLoad} */
  export async function load({ parent }) {
    const {
      stepInfo: { websiteName, websiteDescription },
    } = await parent();

    return { stepInfo: { websiteName, websiteDescription } };
  }
</script>

<script>
  import { backStep, nextStep } from "$lib/Store.js";
  import { _ } from "svelte-i18n";

  let loading = false;

  export let websiteName = "";
  export let websiteDescription = "";

  $: disabled = websiteName === "" || websiteDescription === "";

  function submit() {
    if (!loading && !disabled) {
      loading = true;

      nextStep({
        websiteName,
        websiteDescription,
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
