<Toast id={id} variant="danger">{message}</Toast>

<script>
  import Toast from "$lib/components/Toast.svelte";

  export let id;
  export let message;
</script>
