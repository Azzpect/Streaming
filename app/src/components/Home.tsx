import { Play } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { MediaDataContext } from "../context/MediaDataContext";
import type { Media } from "../context/MediaDataContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Home() {
  const { allMedia, fetchAllMedia, updateMediaList, resetAllMedia } =
    useContext(MediaDataContext)!;
  const [loading, setLoading] = useState<boolean>(false);

  function startMediaProcessing() {
    setLoading(true)
    resetAllMedia()
    try {
      fetch(`${import.meta.env.VITE_API_URL}/process-media`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }).then(res => res.json())
      .then(data => {
        if (data.status === "error") throw new Error(data.message)
        updateMediaList(data.data)
        toast.success("Media processed successfully")
      })
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllMedia();
  }, []);

  return (
    <>
      <div>
        {!loading ? (
          <button
            className="flex items-center bg-blue-400 p-3 rounded-lg absolute bottom-2 right-2 cursor-pointer"
            onClick={startMediaProcessing}
          >
            <Play />
            Scan
          </button>
        ) : (
          <button className="flex bg-blue-400 p-3 rounded-lg absolute bottom-2 right-2 cursor-pointer items-center gap-2">
            <div className="w-5 h-5 border-2 rounded-full border-b-transparent loading-animation"></div>
            Scanning
          </button>
        )}
        <section className="flex gap-2 items-center justify-center pt-10">
          {allMedia.length === 0 ? <p className="font-bold text-white text-xl self-center">No media files found</p> : allMedia.filter((m): m is Media => m !== undefined && m !== null).map((movie, i) => (
            <MovieCard
              key={i}
              index={i}
              name={movie.name}
              thumbnail={movie.thumbnail}
            />
          ))}
        </section>
      </div>
    </>
  );
}

function MovieCard({
  index,
  name,
  thumbnail,
}: {
  index: number;
  name: string;
  thumbnail: string;
}) {
  const navigate = useNavigate();

  return (
    <div
      className={`flex flex-col w-60 h-70 p-3 items-center cursor-pointer ${index === 0 ? "active-movie-icon" : ""}`}
      onClick={() => navigate(`/player?id=${index}`)}
    >
      <img
        src={new URL(thumbnail, import.meta.env.VITE_MEDIA_URL).href}
        alt={name}
        className="w-4/5 h-4/5"
      />
      <h2 className="text-white font-bold text-lg text-center">{name}</h2>
    </div>
  );
}
