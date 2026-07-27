<div
  id="appToast{id}"
  class="animate__animated animate__bounceInUp toast align-items-center bg-dark text-bg-dark shadow-sm {variantClass}"
  role="alert"
  aria-live="assertive"
  aria-atomic="true"
  data-bs-dismiss="toast">
  <div class="toast-body"><slot /></div>
</div>

<script>
  export let id;

  // 'success' | 'danger' | null. Every toast here is its own component (there is no
  // DefaultToast in the wizard), so each one declares its own variant rather than the
  // caller passing one. Mapped instead of interpolated straight into the class list so a
  // caller can't inject an arbitrary utility class, and so a neutral toast keeps
  // text-bg-dark's own contrast colour.
  export let variant = null;

  const VARIANT_CLASSES = {
    success: "text-success",
    danger: "text-danger",
  };

  $: variantClass = VARIANT_CLASSES[variant] ?? "";
</script>
