import { readable, writable } from "svelte/store";

export const message = writable({ type: "error", msg: "Something happened!!!" });
export const showMessage = writable(false);

export const toast = readable({
  success: (msg: string) => {
    message.set({ type: "success", msg: msg });
    showMessage.set(true);
  },
  error: (msg: string) => {
    message.set({ type: "error", msg: msg });
    showMessage.set(true);
  },
});
