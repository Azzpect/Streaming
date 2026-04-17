<script lang="ts">
  import Navbar from "./Navbar.svelte";
  import "./style.css";
  import { onMount } from "svelte";
  import { userData } from "./userData";
    import Message from "./Message.svelte";

  let { children } = $props();

  onMount(() => {
    fetch("http://localhost:8000/api/get_user_data")
      .then((res) => res.json())
      .then((data) => {
        userData.set(data);
      });
  });
</script>

<Navbar />
<Message />

{@render children()}
