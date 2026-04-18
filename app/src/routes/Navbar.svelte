<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { toast } from "./toast";
  import { filteredMovies, userData } from "./userData";

  let loading = $state(false);

  function scan() {
    loading = true;
    goto("/");
    fetch("http://127.0.0.1:8000/api/scan")
      .then((res) => res.json())
      .then((data) => {
        userData.set({ ...$userData, mediaData: data });
        $toast.success("Directory scan complete for media.");
        loading = false;
      });
  }

  function search(val: string) {
    filteredMovies.set(
      $userData.mediaData.filter((v) =>
        v.name.toLowerCase().includes(val.toLowerCase()),
      ),
    );
  }
</script>

<nav class="w-screen h-14 md:h-20 flex justify-around p-2 md:p-5">
  <h1 class="text-white text-2xl md:text-4xl font-bold">
    Movie<span class="gradient-text">MOO</span>
  </h1>
  <div class="flex w-[40%] h-full items-center gap-5">
    <div class="relative w-[80%] h-full hidden md:block">
      <input
        type="text"
        class="bg-white outline-none w-full h-full p-2 rounded-xl"
        placeholder="Search movies here..."
        onkeydown={(e) => search(e.currentTarget.value)}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="black"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="absolute top-1/2 -translate-y-1/2 right-1"
        ><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg
      >
    </div>
    <a
      href="/"
      class="text-white text-sm md:text-lg font-semibold transition-all duration-200 ease-linear"
      >Home</a
    >
    <a
      href="/settings"
      class="text-white text-sm md:text-lg font-semibold transition-all duration-200 ease-linear"
      >Settings</a
    >
    <button
      class="gradient-bg text-white font-bold text-sm md:text-lg px-3 md:px-5 py-2 rounded-xl cursor-pointer"
      onclick={() => scan()}
      disabled={loading}
    >
      {#if loading}
        <div class="loading"></div>
      {:else}
        Scan
      {/if}
    </button>
  </div>
</nav>
{#if page.url.pathname === "/"}
  <div class="relative w-[80%] h-10 m-auto md:hidden">
    <input
      type="text"
      class="bg-white outline-none w-full h-full p-2 rounded-xl"
      placeholder="Search movies here..."
      onkeydown={(e) => search(e.currentTarget.value)}
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="absolute top-1/2 -translate-y-1/2 right-1"
      ><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg
    >
  </div>
{/if}
