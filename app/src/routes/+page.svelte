<script lang="ts">
import { filteredMovies } from "./userData";
</script>

<div class="w-screen flex flex-wrap mt-20">
  {#each $filteredMovies as media, i}
   <a href="/movie/{i+1}" class="flex flex-col items-center cursor-pointer">
      <img src="http://127.0.0.1:8000{media.thumbnail}" alt={media.name} class="w-96 aspect-video" />
      <p class="text-white font-semibold text-md wrap-break-word w-[60%] text-center">{media.name}</p>
    </a> 
  {/each}
</div>
