<div
  class="hero"
  style={backgroundImage
    ? `--bg-image: radial-gradient(circle at 50% 100%, var(--bs-body-bg) 0%, transparent 500%), url('${backgroundImage}')`
    : "--bg-image: radial-gradient(circle at 50% 100%, var(--bs-body-bg) 0%, transparent 500%)"}>
  <div
    class="hero-content d-flex justify-content-center align-items-center h-100 w-100">
    <slot name="content">
      <PageTitle subtitle={subTitle}>
        <svelte:fragment slot="title">
          <slot name="prefix"></slot>{resolvedTitle}<slot name="suffix"></slot>
        </svelte:fragment>
      </PageTitle>
    </slot>
  </div>
</div>

<script>
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import PageTitle from "$lib/components/PageTitle.svelte";

  export let backgroundImage = undefined;
  export let title = undefined;
  export let subTitle = undefined;

  const pageTitle = getContext("pageTitle");

  $: resolvedTitle =
    title ||
    (!$pageTitle
      ? null
      : typeof $pageTitle === "object"
        ? $_($pageTitle.id, $pageTitle.options)
        : $_($pageTitle));
</script>
