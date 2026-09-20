<style>
  .usage-mode-card {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    width: 100%;
    padding: 0.85rem;
    text-align: start;
    color: var(--bs-body-color);
    background-color: transparent;
    border: 1px solid var(--bs-border-color);
    border-radius: var(--bs-border-radius);
    transition:
      border-color 0.15s ease-in-out,
      background-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }

  .usage-mode-card:hover:not(:disabled) {
    border-color: rgba(var(--bs-primary-rgb), 0.45);
    background-color: rgba(var(--bs-primary-rgb), 0.06);
  }

  .usage-mode-card:focus-visible {
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25);
  }

  .usage-mode-card.selected {
    border-color: rgba(var(--bs-primary-rgb), 0.6);
    background-color: rgba(var(--bs-primary-rgb), 0.1);
    box-shadow: inset 0 0 0 1px rgba(var(--bs-primary-rgb), 0.6);
  }

  .usage-mode-card:disabled {
    cursor: default;
  }

  .usage-mode-card-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .usage-mode-icon {
    width: 1.25rem;
    text-align: center;
    color: var(--bs-secondary-color);
  }

  .usage-mode-card.selected .usage-mode-icon {
    color: var(--bs-primary);
  }

  .usage-mode-check {
    color: var(--bs-primary);
  }
</style>

<div>
  <div class="mb-2">
    <div class="fw-semibold" id="{uid}-label">{$_("usage-mode.title")}</div>
    <div class="text-body-secondary small">{$_("usage-mode.subtitle")}</div>
  </div>

  <div
    class="row row-cols-1 row-cols-md-3 g-2"
    role="radiogroup"
    aria-labelledby="{uid}-label">
    {#each modes as mode, index (mode.id)}
      {@const selected = value === mode.id}
      <div class="col">
        <button
          {@attach register(index)}
          type="button"
          role="radio"
          class="usage-mode-card h-100"
          class:selected={selected}
          aria-checked={selected}
          tabindex={index === activeIndex ? 0 : -1}
          disabled={disabled}
          onclick={() => select(mode.id)}
          onkeydown={onKeyDown}>
          <span class="usage-mode-card-head">
            <i class="{mode.icon} usage-mode-icon" aria-hidden="true"></i>
            <span class="fw-semibold">
              {$_("usage-mode." + mode.key + ".title")}
            </span>
            {#if mode.recommended && !selected}
              <span class="badge text-bg-primary ms-auto">
                {$_("usage-mode.recommended")}
              </span>
            {/if}
            {#if selected}
              <i
                class="fa-solid fa-circle-check usage-mode-check ms-auto"
                aria-hidden="true"></i>
            {/if}
          </span>
          <span class="small text-body-secondary">
            {$_("usage-mode." + mode.key + ".description")}
          </span>
        </button>
      </div>
    {/each}
  </div>
</div>

<script>
  import { _ } from "svelte-i18n";

  /**
   * @typedef {"WEBSITE" | "SERVERS" | "BOTH"} UsageMode
   */

  /** @type {{ value?: UsageMode, disabled?: boolean }} */
  let { value = $bindable("BOTH"), disabled = false } = $props();

  const uid = $props.id();

  /** @type {{ id: UsageMode, key: string, icon: string, recommended?: boolean }[]} */
  const modes = [
    { id: "WEBSITE", key: "website", icon: "fa-solid fa-globe" },
    { id: "SERVERS", key: "servers", icon: "fa-solid fa-server" },
    {
      id: "BOTH",
      key: "both",
      icon: "fa-solid fa-layer-group",
      recommended: true,
    },
  ];

  /** @type {(HTMLButtonElement | undefined)[]} */
  let cards = $state([]);

  // The group is a single tab stop: only the checked card is reachable with Tab. Falls
  // back to the first card so an unknown mode can never make the group unreachable.
  const activeIndex = $derived(
    Math.max(
      modes.findIndex((mode) => mode.id === value),
      0,
    ),
  );

  /**
   * Keeps a reference to every card so the arrow keys can move the focus. `index` never
   * changes for a keyed item, so the attachment runs once per card.
   *
   * @param {number} index
   */
  function register(index) {
    return (/** @type {HTMLButtonElement} */ node) => {
      cards[index] = node;

      return () => {
        cards[index] = undefined;
      };
    };
  }

  /** @param {UsageMode} mode */
  function select(mode) {
    if (disabled) {
      return;
    }

    value = mode;
  }

  /**
   * The arrow keys move (and select) between the cards, as a radio group does. Space and
   * Enter are handled natively by the buttons themselves.
   *
   * @param {KeyboardEvent} event
   */
  function onKeyDown(event) {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";

    if (disabled || (!forward && !backward)) {
      return;
    }

    event.preventDefault();

    const next =
      (activeIndex + (forward ? 1 : modes.length - 1)) % modes.length;

    select(modes[next].id);
    cards[next]?.focus();
  }
</script>
