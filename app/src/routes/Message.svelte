<script lang="ts">
import { message } from "./toast";
import { showMessage } from "./toast";
</script>

{#if $showMessage}
  <button
    class="absolute bottom-5 right-2 {$message.type === 'success'
      ? 'bg-green-400'
      : 'bg-red-500'} px-5 py-3 rounded-xl min-w-96 cursor-pointer text-left"
    onclick={() => (showMessage.set(false))}
  >
    <p class="text-white font-bold text-lg w-full wrap-break-word">
      {$message.msg}
    </p>
  </button>
{/if}
