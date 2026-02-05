<div
  class="hero"
  style={backgroundImage ? `--bg-image: url('${backgroundImage}')` : ""}>
  <div
    class="hero-content d-flex justify-content-center align-items-center h-100 w-100">
    <slot name="content">
      <h4 class="animate__animated animate__fadeIn text-center w-100">
        <slot name="prefix"></slot>{resolvedTitle}<slot name="suffix"></slot>
      </h4>
    </slot>
  </div>
</div>

<script>
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";

  export let backgroundImage = undefined;
  export let title = undefined;

  const pageTitle = getContext("pageTitle");

  $: resolvedTitle =
    title ||
    (!$pageTitle
      ? null
      : typeof $pageTitle === "object"
        ? $_($pageTitle.id, $pageTitle.options)
        : $_($pageTitle));
</script>
