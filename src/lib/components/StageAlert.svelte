{#if (stage === "ALPHA" || stage === "BETA") && !$languageLoading && !$isLoading}
  <div
    class="alert d-flex align-items-start mb-0"
    class:alert-warning={stage === "ALPHA"}
    class:alert-info={stage === "BETA"}
    role="alert">
    <i
      class="fa-solid me-3 mt-1"
      class:fa-triangle-exclamation={stage === "ALPHA"}
      class:fa-circle-info={stage === "BETA"}
      aria-hidden="true"></i>
    <div>
      <h5 class="alert-heading d-inline me-2">
        {$_(`${stage.toLowerCase()}-warning.title`)}
      </h5>
      <span>{$_(`${stage.toLowerCase()}-warning.description`)}</span>
    </div>
  </div>
{/if}

<script>
  import { _, isLoading } from "svelte-i18n";
  import { languageLoading } from "$lib/language.util";

  export let stage;
</script>
