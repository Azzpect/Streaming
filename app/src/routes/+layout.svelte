<script lang="ts">
  import Navbar from "./Navbar.svelte";
  import "./style.css";
  import { onMount } from "svelte";
  import { userData } from "./userData";
  import Message from "./Message.svelte";
  import { filteredMovies } from "./userData";

  let { children } = $props();

  onMount(() => {
    fetch("http://127.0.0.1:8000/api/get_user_data")
      .then((res) => res.json())
      .then((data) => {
        userData.set(data);
      });
  });

  $effect(() => {
    userData.subscribe((u) => filteredMovies.set(u.mediaData));
  });
</script>

<Navbar />
<Message />

<svelte:head>
  <title>MovieMOO</title>
</svelte:head>

{@render children()}
