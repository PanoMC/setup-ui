<!-- A running upload: phase and percent, the bar, "305 MB / 612 MB · 5.8 MB/s · 2 min left" and
     Cancel. A copy of panel-ui's component (the repositories share no code). -->
{#if stats}
  <div class="vstack gap-1">
    {#if phase}
      <div class="d-flex align-items-center gap-2 small">
        <span class="flex-grow-1 text-break">{phase}</span>
        <span class="font-monospace flex-shrink-0">{stats.percent}%</span>
      </div>
    {/if}
    <div
      class="progress"
      style="height: 8px;"
      role="progressbar"
      aria-label={phase || $_("upload-progress.uploading")}
      aria-valuenow={stats.percent}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuetext="{stats.percent}% · {figures}">
      <div
        class="progress-bar"
        class:progress-bar-striped={stats.sent}
        class:progress-bar-animated={stats.sent}
        style="width: {stats.percent}%;">
      </div>
    </div>
    <div class="d-flex align-items-center gap-2 small text-body-secondary">
      <span class="font-monospace flex-grow-1 text-break">{figures}</span>
      {#if oncancel}
        <button
          type="button"
          class="btn btn-sm btn-link text-danger text-capitalize p-0 flex-shrink-0"
          onclick={oncancel}>
          {$_("upload-progress.cancel")}
        </button>
      {/if}
    </div>
  </div>
{/if}

<script>
  import { _ } from "svelte-i18n";

  import { formatUploadBytes } from "$lib/upload.util.js";

  /**
   * @type {{
   *   stats: import('$lib/upload.util.js').UploadStats | null,
   *   phase?: string,
   *   oncancel?: (() => void) | null,
   * }}
   */
  let { stats = null, phase = "", oncancel = null } = $props();

  /** @param {number} seconds */
  function timeLeft(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;

    if (hours > 0)
      return $_("upload-progress.hours-left", { values: { hours, minutes } });
    if (minutes > 0)
      return $_("upload-progress.minutes-left", {
        values: { minutes, seconds: rest },
      });

    return $_("upload-progress.seconds-left", { values: { seconds: rest } });
  }

  const figures = $derived.by(() => {
    if (!stats) return "";

    const parts = [
      `${formatUploadBytes(stats.loaded)} / ${formatUploadBytes(stats.total)}`,
    ];

    if (stats.sent) return parts.join(" · ");

    if (stats.speed != null && stats.speed > 0) {
      parts.push(
        $_("upload-progress.speed", {
          values: { speed: formatUploadBytes(stats.speed) },
        }),
      );
    }

    parts.push(
      stats.secondsLeft == null
        ? $_("upload-progress.calculating")
        : timeLeft(stats.secondsLeft),
    );

    return parts.join(" · ");
  });
</script>
