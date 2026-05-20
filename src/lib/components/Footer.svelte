<style>
  .navbar {
    background-color: var(--bs-body-bg) !important;
  }
  
  .navbar-brand-centered {
    margin: 0;
    z-index: 1050;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-link i {
    font-size: 1.15rem;
  }
</style>

<nav
  class="navbar navbar-expand-xl border-bottom"
  style="z-index: 1040;">
  <div class="container d-flex align-items-center">
    <div class="col-4 d-flex align-items-center order-1 gap-2">
      <div class="nav-item">
        <span class="nav-text opacity-75">{version === "local-build" ? version : "v" + version}</span>
      </div>
    </div>

    <div class="col-4 d-flex justify-content-center order-2">
      <div class="navbar-brand-centered">
        <a
          href={PANO_WEBSITE_URL}
          target="_blank"
          aria-label="Pano"
          class="navbar-brand me-0 d-inline-flex align-items-center justify-content-center bg-primary rounded"
          style="width: 32px; height: 32px;">
          <img src="/assets/img/logo.svg" width="24" height="24" alt="Pano" />
        </a>
      </div>  
    </div>

    <div class="col-4 d-flex justify-content-end align-items-center gap-3 order-3">
      <div class="nav-item">
        <a
          href="{PANO_WEBSITE_URL}/docs"
          target="_blank"
          rel="noreferrer"
          class="nav-link"
          use:tooltip={[$_("buttons.docs"), { placement: "bottom" }]}
          aria-label={$_("buttons.docs")}>
          <i class="fa-solid fa-circle-question"></i>
        </a>
      </div>
      <div class="nav-item">
        <a
          href="{PANO_WEBSITE_URL}/discord"
          target="_blank"
          rel="noreferrer"
          class="nav-link"
          use:tooltip={["Discord", { placement: "bottom" }]}
          aria-label="Discord">
          <i class="fa-brands fa-discord"></i>
        </a>
      </div>
    </div>
  </div>
</nav>

<script>
  import { _ } from "svelte-i18n";
  import tooltip from "$lib/tooltip.util.js";
  import { onMount } from "svelte";
  import { PANO_WEBSITE_URL } from "$lib/variables.js";
  
  export let version = "1.0";

  let isDarkTheme = false;

  onMount(() => {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme");
    if (!currentTheme) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      isDarkTheme = prefersDark;
      document.documentElement.setAttribute(
        "data-bs-theme",
        prefersDark ? "dark" : "light",
      );
    } else {
      isDarkTheme = currentTheme === "dark";
    }
  });
</script>
