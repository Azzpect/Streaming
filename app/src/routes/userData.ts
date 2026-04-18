import { writable } from "svelte/store";
import type { Media, UserData } from "./types";
export const userData = writable<UserData>({
  mediaData: [],
  port: 8080,
  mediaPath: ""
});


export const filteredMovies = writable<Media[]>([])




