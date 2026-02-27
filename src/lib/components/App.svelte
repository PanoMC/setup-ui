<svelte:head>
  {#if dev}
    <link rel="stylesheet" href="/style.css" />
  {/if}
</svelte:head>

<slot />

<script>
  import { browser, dev } from "$app/environment";
  import "@theme-style";

  if (browser) {
    import("$lib/init.libs");
  }
</script>
