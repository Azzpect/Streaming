import { createContext, useState, type ReactNode } from "react";
import { toast } from "react-toastify";
export const MediaDataContext = createContext<MediaDataContextValue | null>(
  null
);

type Movie = {
  name: string;
  thumbnail: string;
  path: string;
};

type MediaDataContextValue = {
  allMedia: Movie[];
  fetchAllMedia: () => void;
};

export function MediaContextProvider({ children }: { children: ReactNode }) {
  const [allMedia, setAllMedia] = useState<Movie[]>([]);

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
          toast.success("Movies data fetched successfully.");
          setAllMedia(data.data);
        } else {
          toast.error(data.message);
        }
      });
  }

  return (
    <MediaDataContext.Provider value={{allMedia, fetchAllMedia}}>
      {children}
    </MediaDataContext.Provider>
  );
}
