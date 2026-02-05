<style>
  .blur-nav {
    background-color: rgba(var(--bs-body-bg-rgb), 0.8) !important;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--bs-border-color);
  }

  .navbar-container {
    transition: background-color 0.3s ease;
  }

  .brand-box {
    width: 32px;
    height: 32px;
    background-color: var(--bs-primary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  :global([data-bs-theme="dark"]) .blur-nav {
    background-color: rgba(10, 25, 49, 0.8) !important;
  }
</style>

<div
  class="navbar navbar-expand fixed-top navbar-container blur-nav"
  style="z-index: 1040;">
  <div class="container d-flex justify-content-between align-items-center">
    <div class="col-4 d-flex align-items-center gap-2">
      <!-- Left side reserved if needed -->
    </div>

    <div class="col-4 text-center">
      <div class="d-inline-flex flex-column align-items-center">
        <a
          href={PANO_WEBSITE_URL}
          target="_blank"
          class="brand-box mx-auto shadow-sm">
          <img src="/assets/img/logo.svg" width="24" height="24" alt="Pano" />
        </a>
        <span
          class="badge text-bg-secondary mt-1"
          style="font-size: 0.45rem; font-weight: 800; letter-spacing: 0.1em; padding: 0.1rem 0.3rem; border-radius: 4px; opacity: 0.8;">
          SETUP
        </span>
      </div>
    </div>

    <div class="col-4 d-flex justify-content-end align-items-center gap-3">
      <button
        class="nav-link btn btn-link text-body p-0"
        on:click={toggleTheme}
        title="Toggle Theme">
        <i class="fa-solid {isDarkTheme ? 'fa-sun' : 'fa-moon'}"></i>
      </button>

      <a
        href="{PANO_WEBSITE_URL}/docs"
        target="_blank"
        class="nav-link text-body p-0"
        title="Documentation">
        <i class="fa-solid fa-circle-question"></i>
      </a>
    </div>
  </div>
</div>

<script>
  import { onMount } from "svelte";
  import { PANO_WEBSITE_URL } from "../../pano-sdk/core/js/variables.js";

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

  function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.documentElement.setAttribute(
      "data-bs-theme",
      isDarkTheme ? "dark" : "light",
    );
  }
</script>
