<nav
  class="navbar navbar-expand-xl border-bottom"
  style="z-index: 1040;">
  <div class="container d-flex align-items-center">
    <!-- Left Section: Mobile Toggler & Desktop Links (Order 1) -->
    <div class="col-4 d-flex align-items-center order-1">
      <!-- Mobile Toggler (Left) -->
      <div class="d-xl-none d-flex align-items-center">
        <button
          class="nav-link p-0"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileMenuOffcanvas"
          aria-controls="mobileMenuOffcanvas"
          aria-label="Toggle navigation">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>

      <!-- Desktop Navigation Links (Visible only on XL and above) -->
      <div
        class="collapse navbar-collapse d-xl-flex"
        id="navbarContentDesktop">
        <ul class="navbar-nav gap-2">
          <li class="nav-item">
            <a
              class="nav-link"
              href="{PANO_WEBSITE_URL}/docs"
              target="_blank"
              rel="noreferrer"
              title="{$_("buttons.docs")}"
              aria-label={$_("buttons.docs")}>
              <i class="fa-solid fa-book"></i>
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link"
              href="{PANO_WEBSITE_URL}/discord"
              target="_blank"
              rel="noreferrer"
              title="Discord"
              aria-label="Discord">
              <i class="fa-brands fa-discord"></i>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Center Section: Logo (Order 2) -->
    <div class="col-4 d-flex justify-content-center order-2">
      <div class="navbar-brand me-0 d-inline-flex align-items-center justify-content-center bg-primary rounded" style="width: 32px; height: 32px;">
        <a
          href={PANO_WEBSITE_URL}
          target="_blank"
          aria-label="Pano">
          <img src="/assets/img/logo.svg" width="24" height="24" alt="Pano" />
        </a>
      </div>  
    </div>

    <!-- Right Section: Version Info (Order 3) -->
    <div class="col-4 d-flex justify-content-end align-items-center gap-2 order-3">
      <span class="small">{version === "local-build" ? version : "v" + version}</span>
    </div>
  </div>

  <!-- Mobile Offcanvas Menu -->
  <div
    class="offcanvas offcanvas-bottom d-xl-none w-100"
    tabindex="-1"
    id="mobileMenuOffcanvas"
    aria-labelledby="mobileMenuOffcanvasLabel"
    style="z-index: 1080; height: auto !important;">
    <div class="offcanvas-header border-bottom">
      <div class="offcanvas-title fw-bold" id="mobileMenuOffcanvasLabel">
      </div>
      <button
        type="button"
        class="btn-close shadow-none"
        data-bs-dismiss="offcanvas"
        aria-label="Close"></button>
    </div>
    <div class="offcanvas-body p-0">
      <ul class="navbar-nav">
        <li class="nav-item text-center border-bottom py-3">
          <a
            class="nav-link d-block w-100"
            href="{PANO_WEBSITE_URL}/docs"
            target="_blank"
            rel="noreferrer"
            aria-label={$_("buttons.docs")}>
            {$_("buttons.docs")}
          </a>
        </li>
        <li class="nav-item text-center border-bottom py-3">
          <a
            class="nav-link d-block w-100"
            href="{PANO_WEBSITE_URL}/discord"
            target="_blank"
            rel="noreferrer"
            aria-label="Discord">
            Discord
          </a>
        </li>
      </ul>
    </div>
  </div>
</nav>

<script>
  import { _ } from "svelte-i18n";
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
