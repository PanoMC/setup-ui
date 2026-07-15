<style>
  .plugin-card {
    transition: border-color 0.15s ease, transform 0.15s ease;
    border: 1px solid var(--bs-border-color);
    cursor: default;
  }

  .plugin-card:hover {
    border-color: var(--bs-primary);
    transform: translateY(-2px);
  }

  .plugin-icon {
    width: 56px;
    height: 56px;
    flex-shrink: 0;
  }

  .plugin-stats {
    font-size: 0.75rem;
  }
</style>

<div class="card rounded-4 plugin-card h-100">
  <div class="card-body d-flex flex-column p-3">
    <div class="d-flex align-items-start gap-3 mb-2">
      <div
        class="plugin-icon rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
        style="background-color: {iconColor || 'var(--bs-tertiary-bg)'}; color: white;">
        <i class="{iconClass} fa-xl"></i>
      </div>
      <div class="d-flex flex-column overflow-hidden">
        <h6 class="card-title mb-0 text-truncate">{name}</h6>
        <small class="text-body-secondary font-monospace">{version}</small>
      </div>
    </div>

    <p
      class="mb-2 text-body-secondary small overflow-hidden"
      style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
      {description}
    </p>

    <div class="mt-auto d-flex align-items-center justify-content-between plugin-stats text-body-secondary">
      <div class="d-flex align-items-center gap-1">
        <i class="fa-solid fa-star fa-xs"></i>
        <span>{rating}</span>
      </div>
      <div class="d-flex align-items-center gap-1">
        <i class="fa-solid fa-download fa-xs"></i>
        <span>{downloads}</span>
      </div>
      {#if author}
        <div class="d-flex align-items-center gap-1">
          <i class="fa-regular fa-user fa-xs"></i>
          <span>{author}</span>
        </div>
      {/if}
    </div>
  </div>
</div>

<script>
  export let name = "Plugin";
  export let version = "1.0.0";
  export let description = "";
  export let iconClass = "fa-solid fa-puzzle-piece";
  export let iconColor = "var(--bs-primary)";
  export let rating = "0.0";
  export let downloads = "0";
  export let author = "";
</script>
