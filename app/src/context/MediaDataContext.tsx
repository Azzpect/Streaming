import { createContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "react-toastify";
export const MediaDataContext = createContext<MediaDataContextValue | null>(
  null
);


type mediaData = {
  thumbnail: string;
  path: string;
}

export interface Media extends mediaData {
  name: string,
};

type Directory = {
  files: {[key: string]: mediaData};
  subDirectories: {[key: string]: Directory};
}

type MediaDataContextValue = {
  allMedia: Media[];
  directoryData: Directory;
  fetchAllMedia: () => void;
  resetAllMedia: () => void;
};

export function MediaContextProvider({ children }: { children: ReactNode }) {
  const [allMedia, setAllMedia] = useState<Media[]>([]);
  const [directoryData, setDirectoryData] = useState<Directory>({files: {}, subDirectories: {}})

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
          setDirectoryData(data.data)
        } else {
          toast.error(data.message);
          resetAllMedia()
        }
      });
  }

  function resetAllMedia() {
    setDirectoryData({files: {}, subDirectories: {}})
  }

  function flattenDirectoryData(dir: Directory) {
    Object.values(dir.subDirectories).forEach(d => {
      flattenDirectoryData(d)
    })
    Object.entries(dir.files).forEach(([n, f]) => {
      setAllMedia(prev => [...prev, {...f, name: n}])
    })
  }

  useEffect(() => {
    flattenDirectoryData(directoryData)
  }, [directoryData])

  return (
    <MediaDataContext.Provider value={{allMedia, directoryData, fetchAllMedia, resetAllMedia}}>
      {children}
    </MediaDataContext.Provider>
  );
}
