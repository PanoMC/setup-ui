<style>
  .navbar {
    opacity: 0.5;
    transition: opacity 0.3s ease-in-out;
  }

  .navbar:hover {
    opacity: 1;
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

<div class="navbar">
  <div class="container d-flex justify-content-between align-items-center">
    <div class="col-4 d-flex align-items-center gap-2">
      <small class="nav-text">{version}</small>
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

    <div class="col-4 d-flex justify-content-end align-items-center gap-2">
      <a
        href="{PANO_WEBSITE_URL}/discord"
        target="_blank"
        rel="noreferrer"
        class="nav-link"
        title="Discord"
        aria-label="Discord">
        <i class="fa-brands fa-discord"></i>
      </a>
    </div>
  </div>
</div>

<script>
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
