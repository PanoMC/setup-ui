<style>
  .drop-zone {
    border-style: dashed !important;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .drop-zone:hover {
    background-color: rgba(var(--bs-primary-rgb), 0.05) !important;
  }

  .drop-zone.drag-over {
    border-style: solid !important;
    background-color: rgba(var(--bs-primary-rgb), 0.1) !important;
    transform: scale(0.995);
  }

  .drop-zone.disabled {
    cursor: not-allowed;
    opacity: 0.6;
    border-style: solid !important;
  }
</style>

<!--
  A file picker you can also drop a file on — the setup-ui counterpart of panel-ui's
  DragAndDropZone. `accept` lists extensions (".zip") or MIME types; a file that matches none of
  them goes to `onerror` instead of `ondrop`.
-->
<div
  class="p-3 w-100 d-flex flex-column align-items-center justify-content-center border rounded text-center drop-zone"
  class:drag-over={dragOver}
  class:disabled={disabled}
  style={style}
  role="button"
  tabindex="0"
  onclick={pick}
  onkeydown={onKeyDown}
  ondrop={onDrop}
  ondragover={onDragOver}
  ondragleave={() => (dragOver = false)}>
  {#if icon}
    <i class="{icon} mb-2" aria-hidden="true"></i>
  {/if}
  {#if title}
    <p class="mb-0">{title}</p>
  {/if}
  {#if subtitle}
    <small class="opacity-75">{subtitle}</small>
  {/if}

  <input
    id={id}
    type="file"
    class="d-none"
    accept={accept.join(",")}
    bind:this={input}
    onchange={onChange} />
</div>

<script>
  /**
   * @type {{
   *   accept?: string[],
   *   disabled?: boolean,
   *   style?: string,
   *   icon?: string,
   *   title?: string,
   *   subtitle?: string,
   *   id?: string,
   *   ondrop?: (file: File) => void,
   *   onerror?: (file: File) => void,
   * }}
   */
  let {
    accept = [],
    disabled = false,
    style = "",
    icon = "",
    title = "",
    subtitle = "",
    id = undefined,
    ondrop,
    onerror,
  } = $props();

  let dragOver = $state(false);
  /** @type {HTMLInputElement | undefined} */
  let input = $state();

  /** @param {File} file */
  function accepted(file) {
    if (accept.length === 0) return true;

    const name = file.name.toLowerCase();

    return accept.some((type) =>
      type.startsWith(".")
        ? name.endsWith(type.toLowerCase())
        : type.endsWith("/*")
          ? file.type.startsWith(type.slice(0, -1))
          : file.type === type,
    );
  }

  /** @param {FileList | null | undefined} files */
  function handle(files) {
    const file = files?.[0];

    if (!file) return;

    if (accepted(file)) ondrop?.(file);
    else onerror?.(file);

    if (input) input.value = "";
  }

  function pick() {
    if (!disabled) input?.click();
  }

  /** @param {KeyboardEvent} event */
  function onKeyDown(event) {
    if (disabled || (event.key !== "Enter" && event.key !== " ")) return;

    event.preventDefault();
    pick();
  }

  /** @param {DragEvent} event */
  function onDragOver(event) {
    if (disabled) return;

    event.preventDefault();
    dragOver = true;
  }

  /** @param {DragEvent} event */
  function onDrop(event) {
    if (disabled) return;

    event.preventDefault();
    dragOver = false;
    handle(event.dataTransfer?.files);
  }

  /** @param {Event} event */
  function onChange(event) {
    if (!disabled)
      handle(/** @type {HTMLInputElement} */ (event.currentTarget).files);
  }
</script>
