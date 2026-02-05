<style>
  .hero {
    position: relative;
    height: 20vh;
    overflow: hidden;
    padding-top: 64px;
  }

  .hero::before {
    content: "";
    position: absolute;
    inset: 0;
    background: var(--bg-image) center/cover no-repeat;
    -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-size: cover;
    mask-size: cover;
    z-index: 0;
  }

  .hero-content {
    position: relative;
    z-index: 1;
  }
</style>

<div
  class="hero"
  style={backgroundImage ? `--bg-image: url('${backgroundImage}')` : ""}>
  <div
    class="hero-content d-flex justify-content-center align-items-center h-100 w-100">
    <slot name="content">
      <h4 class="animate__animated animate__fadeIn text-center w-100 mb-0">
        <slot name="prefix"></slot>{title}<slot name="suffix"></slot>
      </h4>
    </slot>
  </div>
</div>

<script>
  import { getContext } from "svelte";
  import { _ } from "svelte-i18n";
  import { currentStep } from "$lib/Store.js";

  export let backgroundImage = undefined;
  export let title = "";
</script>
