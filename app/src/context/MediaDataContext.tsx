import { createContext, useState, type ReactNode } from "react";
import { toast } from "react-toastify";
export const MediaDataContext = createContext<MediaDataContextValue | null>(
  null
);

export type Media = {
  name: string;
  thumbnail: string;
  path: string;
};

type MediaDataContextValue = {
  allMedia: Media[];
  fetchAllMedia: () => void;
  resetAllMedia: () => void;
  updateMediaList: (list: Media[]) => void;
};

export function MediaContextProvider({ children }: { children: ReactNode }) {
  const [allMedia, setAllMedia] = useState<Media[]>([]);

  function fetchAllMedia() {
    fetch(`${import.meta.env.VITE_API_URL}/get-media-data`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          toast.success("Media data fetched successfully.");
          setAllMedia(data.data);
        } else {
          toast.error(data.message);
        }
      });
  }

  function resetAllMedia() {
    setAllMedia([])
  }

  function updateMediaList(list: Media[]) {
    setAllMedia(list)
  }

  return (
    <MediaDataContext.Provider value={{allMedia, fetchAllMedia, resetAllMedia, updateMediaList}}>
      {children}
    </MediaDataContext.Provider>
  );
}
