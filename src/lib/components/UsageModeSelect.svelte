<div>
  <div class="mb-2 text-center">
    <h5 id="{uid}-label">{$_("usage-mode.title")}</h5>
  </div>

  <div
    class="list-group list-group-horizontal-md"
    role="radiogroup"
    aria-labelledby="{uid}-label">
    {#each modes as mode, index (mode.id)}
      {@const selected = value === mode.id}
      <button
        {@attach register(index)}
        type="button"
        role="radio"
        class="list-group-item list-group-item-action d-flex flex-column justify-content-start text-start"
        class:active={selected}
        style="flex: 1 1 0;"
        aria-checked={selected}
        tabindex={index === activeIndex ? 0 : -1}
        disabled={disabled}
        onclick={() => select(mode.id)}
        onkeydown={onKeyDown}>
        <span class="d-flex align-items-center gap-2 mb-1">
          <i
            class="{mode.icon} text-center"
            style="width: 1.25rem;"
            aria-hidden="true"></i>
          <span class="fw-semibold">
            {$_("usage-mode." + mode.key + ".title")}
          </span>
          {#if mode.recommended && !selected}
            <span class="badge text-bg-primary ms-auto">
              {$_("usage-mode.recommended")}
            </span>
          {/if}
        </span>
        <span class="d-block">
          {$_("usage-mode." + mode.key + ".description")}
        </span>
      </button>
    {/each}
  </div>

  <small class="d-block mt-2 text-center text-body-secondary">
    {$_("usage-mode.subtitle")}
  </small>
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
