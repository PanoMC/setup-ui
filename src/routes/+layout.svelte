<MainLayout stepInfo="{data.stepInfo}">
  <slot />
</MainLayout>

<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import MainLayout from "$lib/layouts/MainLayout.svelte";

  export let data;

  onMount(() => {
    // Tells the hydration watchdog in app.html that this document booted (see there). Only a
    // real render counts: an error render keeps the one recovery reload available.
    if ($page.error) return;
    window.__PANO_APP_BOOTED__ = true;
    try {
      sessionStorage.removeItem("pano:hydration-reload");
      const url = new URL(location.href);
      if (url.searchParams.has("pano-rl")) {
        url.searchParams.delete("pano-rl");
        history.replaceState(history.state, "", url);
      }
    } catch {
      /* sessionStorage unavailable; the watchdog degrades gracefully */
    }
  });
</script>
