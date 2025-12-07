<div class="navbar bg-primary navbar-dark">
  <div class="container">
    <a href="https://panomc.com" target="_blank" class="navbar-brand mx-auto">
      <img src="/assets/img/logo.svg" width="24" height="24" alt="Pano" />
      {title}
    </a>
  </div>
</div>

<script>
  import { _ } from "svelte-i18n";

  $: title = $_("title");
</script>
