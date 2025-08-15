import { Play } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { MediaDataContext } from "../context/MediaDataContext";
import type { Media } from "../context/MediaDataContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Home() {
  const { allMedia, fetchAllMedia, addNewMedia, resetAllMedia } =
    useContext(MediaDataContext)!;
  const [loading, setLoading] = useState<boolean>(false);

  async function listenSSE() {
    setLoading(true);
    resetAllMedia();
    try {
      const url = `${import.meta.env.VITE_API_URL}/start-processing`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
        },
      });

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (part.startsWith("data:")) {
            const message = part.replace(/^data:\s*/, "").trim();
            const data = JSON.parse(message);
            if (data.status === "error") toast.error(data.message);
            else if (data.status === "process") toast.info(data.message)
            else {
              toast.success(data.message);
              addNewMedia(data.media);
            }
          }
        }
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
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
            onClick={listenSSE}
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
        <section className={`flex gap-2 items-center ${allMedia.length === 0 ? "justify-center" : ""}`}>
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
      className="flex flex-col w-60 h-70 p-3 items-center cursor-pointer"
      onClick={() => navigate(`/player?id=${index}`)}
    >
      <img
        src={new URL(thumbnail, import.meta.env.VITE_API_URL).href}
        alt={name}
        className="w-4/5 h-4/5"
      />
      <h2 className="text-white font-bold text-lg text-center">{name}</h2>
    </div>
  );
}
