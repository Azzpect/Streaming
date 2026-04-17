<script lang="ts">
    import { toast } from "./toast";
  import { userData } from "./userData";

  function scan() {
    fetch("http://127.0.0.1:8000/api/scan")
      .then((res) => res.json())
      .then((data) => {
        userData.set({ ...$userData, mediaData: data });
        $toast.success("Directory scan complete for media.")
      });
  }
</script>

<nav class="w-screen h-20 flex justify-around p-5">
  <h1 class="text-white text-4xl font-bold">
    Movie<span class="gradient-text">MOO</span>
  </h1>
  <div class="flex w-[40%] h-full items-center gap-5">
    <div class="relative w-[80%] h-full">
      <input
        type="text"
        class="bg-white outline-none w-full h-full p-2 rounded-xl"
        placeholder="Search movies here..."
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
      class="text-white text-lg font-semibold transition-all duration-200 ease-linear"
      >Home</a
    >
    <a
      href="/settings"
      class="text-white text-lg font-semibold transition-all duration-200 ease-linear"
      >Settings</a
    >
    <button
      class="gradient-bg text-white font-bold text-lg px-5 py-2 rounded-xl cursor-pointer"
      onclick={() => scan()}>Scan</button
    >
  </div>
</nav>
