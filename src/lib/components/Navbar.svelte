<div class="navbar bg-primary navbar-dark">
  <div class="container">
    <div class="d-flex align-items-center w-100">
      <button
        class="btn btn-link text-white position-absolute start-0 ms-3"
        on:click={toggleTheme}
        title="Toggle Theme">
        <i class="fa fa-moon" class:fa-sun={isDarkTheme}></i>
      </button>
      <a href="https://panomc.com" target="_blank" class="navbar-brand mx-auto">
        <img src="/assets/img/logo.svg" width="24" height="24" alt="Pano" />
        {title}
      </a>
      <a
        href="https://docs.panomc.com"
        target="_blank"
        class="text-white position-absolute end-0 me-3"
        title="Documentation">
        <i class="fa fa-book-open"></i>
      </a>
    </div>
  </div>
</div>

<script>
  import { _ } from "svelte-i18n";
  import { onMount } from "svelte";

  $: title = $_("title");

  let isDarkTheme = false;

  onMount(() => {
    // Sistem tercihini kontrol et
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const currentTheme = document.documentElement.getAttribute("data-bs-theme");

    // Eğer data-bs-theme ayarlanmamışsa sistem tercihini kullan
    if (!currentTheme) {
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
