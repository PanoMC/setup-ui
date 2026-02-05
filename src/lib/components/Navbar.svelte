<style>
  .navbar-container {
    background-color: var(--bs-body-bg);
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
</style>

<div
  class="navbar navbar-expand fixed-top navbar-container"
  style="z-index: 1040;">
  <div class="container d-flex justify-content-between align-items-center">
    <div class="col-4 d-flex align-items-center gap-2">
      <button
        class="nav-link btn btn-link text-body p-0 ms-2"
        on:click={toggleTheme}
        title="Toggle Theme">
        <i class="fa-solid fa-adjust"></i>
      </button>
    </div>

    <div class="col-4 text-center">
      <div class="d-inline-flex flex-column align-items-center">
        <a
          href={PANO_WEBSITE_URL}
          target="_blank"
          class="brand-box mx-auto shadow-sm">
          <img src="/assets/img/logo.svg" width="24" height="24" alt="Pano" />
        </a>
      </div>
    </div>

    <div class="col-4 d-flex justify-content-end align-items-center gap-3">
      <a
        href="{PANO_WEBSITE_URL}/docs"
        target="_blank"
        class="nav-link text-body p-0 me-2"
        title="Documentation">
        <i class="fa-solid fa-book"></i>
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
