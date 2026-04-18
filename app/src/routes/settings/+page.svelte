<script lang="ts">
  import { userData } from "../userData";
  import { toast } from "../toast";

  let temp = $state({ mediaPath: $userData.mediaPath, port: $userData.port });
  let loading = $state(false);

  $effect(() => {
    temp.mediaPath = $userData.mediaPath;
    temp.port = $userData.port;
  });

  let children = $state<string[]>([]);

  let showPicker = $state(false);

  function getDirInfo(path: string) {
    fetch(`http://127.0.0.1:8000/api/get_dir_info?path=${path}`)
      .then((res) => res.json())
      .then((data) => {
        temp.mediaPath = path;
        children = data;
        showPicker = true;
      });
  }

  function saveChange() {
    loading = true;
    fetch("http://127.0.0.1:8000/api/change_user_data", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: temp.mediaPath, port: temp.port }),
    }).then((res) => {
      if (!res.ok) {
        $toast.error("Couldn't save user data.");
      } else {
        $userData.mediaPath = temp.mediaPath;
        $userData.port = temp.port;
        $toast.success("User data saved.");
        loading = false;
      }
    });
  }
  function prevDir() {
    let parts = temp.mediaPath.split("/");
    parts.pop();
    let path = parts.join("/");
    getDirInfo(path === "" ? "/" : path);
  }
</script>

<div class="w-[80%] md:w-[60%] h-screen m-auto flex flex-col gap-5 mt-10 md:mt-28 relative">
  <span class="text-white text-lg font-semibold">Port</span>
  <input
    type="number"
    class="w-[80%] md:w-[60%] h-8 bg-white rounded-xl outline-none p-3"
    value={temp.port}
    onchange={(e) => (temp.port = parseInt(e.currentTarget?.value))}
  />
  <span class="text-white text-lg font-semibold">Media Directory</span>
  <div class="w-full flex items-center gap-5">
    <input
      type="text"
      class="w-[80%] md:w-[60%] h-8 bg-white rounded-xl outline-none p-3"
      value={temp.mediaPath}
      readonly
    />
    <button
      class="gradient-bg px-3 py-2 text-white font-semibold rounded-xl cursor-pointer"
      onclick={() => getDirInfo(temp.mediaPath)}>Choose</button
    >
  </div>
  {#if showPicker}
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] md:w-[60%] h-[50%] md:h-[60%] bg-white flex flex-col p-5 gap-2 rounded-xl"
    >
      <div class="flex gap-2 items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="cursor-pointer"
          role="button"
          onkeydown={() => {}}
          tabindex="0"
          onclick={() => prevDir()}><path d="m15 18-6-6 6-6" /></svg
        >
        <h4 class="text-lg font-bold">{temp.mediaPath}</h4>
      </div>
      <hr />
      <div class="flex flex-col overflow-y-scroll w-full h-[80%]">
        {#each children as item}
          <button
            class="flex cursor-pointer hover:bg-[#1d2f43] hover:text-white font-semibold p-2 rounded-lg gap-2"
            onclick={() =>
              getDirInfo(
                temp.mediaPath === "/"
                  ? temp.mediaPath + item
                  : temp.mediaPath + "/" + item,
              )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-folder-icon lucide-folder"
              ><path
                d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"
              /></svg
            >
            <li class="list-none">{item}</li>
          </button>
        {/each}
      </div>
      <button
        class="font-semibold gradient-bg text-white px-3 p-2 text-lg rounded-lg cursor-pointer absolute bottom-5 right-5"
        onclick={() => (showPicker = false)}>Close</button
      >
    </div>
  {/if}
  <button
    class="font-semibold gradient-bg text-white px-3 p-2 text-lg rounded-lg cursor-pointer self-start"
    disabled={temp.mediaPath === $userData.mediaPath &&
      temp.port === $userData.port}
    onclick={saveChange}
  >
    {#if loading}
      <div class="loading"></div>
    {:else}
      Save
    {/if}
  </button>
</div>
