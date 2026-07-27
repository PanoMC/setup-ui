<Toast id="{id}" variant="success"
  >{$_('components.toasts.pano-account-connect-success')}</Toast>

<script>
  import { _ } from "svelte-i18n";

  import Toast from "$lib/components/Toast.svelte";

  export let id;
</script>
