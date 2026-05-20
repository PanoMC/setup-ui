<div
  class="container text-center animate__animated animate__fadeIn"
  style="animation-duration: 500ms;">
  <h2 class="mb-0 text-break fw-normal">
    <slot name="title">
      {#if title}
        {#if html}
          {@html title}
        {:else}
          {title}
        {/if}
      {/if}
    </slot>
  </h2>
  {#if subtitle}
    <p class="mb-0 mt-2 opacity-75">
      {#if subtitleHtml}
        {@html subtitle}
      {:else}
        {subtitle}
      {/if}
    </p>
  {/if}
</div>

<script>
  export let title = "";
  export let subtitle = "";
  export let html = false;
  export let subtitleHtml = false;
</script>
