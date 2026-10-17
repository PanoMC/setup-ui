{#if flag}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 30 20"
    width="24"
    height="16"
    class="rounded-1 flex-shrink-0"
    aria-hidden="true">
    {#if flag === "us"}
      <rect width="30" height="20" fill="#fff" />
      {#each [0, 2, 4, 6, 8, 10, 12] as i (i)}
        <rect y={(i * 20) / 13} width="30" height={20 / 13} fill="#b22234" />
      {/each}
      <rect width="12" height={(7 * 20) / 13} fill="#3c3b6e" />
    {:else if flag === "tr"}
      <rect width="30" height="20" fill="#e30a17" />
      <circle cx="11" cy="10" r="5" fill="#fff" />
      <circle cx="12.5" cy="10" r="4" fill="#e30a17" />
      <polygon
        fill="#fff"
        points="17.5,10 20.4,9 18.6,11.5 18.6,8.5 20.4,11" />
    {:else if flag === "ru"}
      <rect width="30" height="6.67" fill="#fff" />
      <rect y="6.67" width="30" height="6.67" fill="#0039a6" />
      <rect y="13.33" width="30" height="6.67" fill="#d52b1e" />
    {/if}
  </svg>
{:else}
  <i class="fa-solid fa-globe text-center" style="width: 1.5rem;" aria-hidden="true"></i>
{/if}

<script>
  /** @type {{ locale: string }} */
  let { locale } = $props();

  const FLAGS = { "en-US": "us", tr: "tr", ru: "ru" };

  const flag = $derived(FLAGS[locale]);
</script>
