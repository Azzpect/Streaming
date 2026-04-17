<script lang="ts">
  import { onMount } from "svelte";
  import { userData } from "../../userData";
  import type { Media } from "../../types";
  import { goto } from "$app/navigation";
  let { params } = $props();

  let media: Media = $state({name: "", thumbnail: "", media: ""});

  onMount(async () => {
    const id: number = parseInt(params.id);
    if (Number.isNaN(id) || id <= 0) await goto("/");
    media = $userData.mediaData[id - 1];
  });
</script>


<video controls class="w-full h-full">
  <source src="http://127.0.0.1:8000{media.media}" />
</video>
