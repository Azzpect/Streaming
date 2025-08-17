import { Play } from "lucide-react";
import React, { useContext, useEffect, useState, useRef } from "react";
import { MediaDataContext } from "../context/MediaDataContext";
import type { Media } from "../context/MediaDataContext";
// import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Home() {
  const { allMedia, fetchAllMedia, updateMediaList, resetAllMedia } =
    useContext(MediaDataContext)!;
  const [loading, setLoading] = useState<boolean>(false);

  function startMediaProcessing() {
    setLoading(true);
    resetAllMedia();
    try {
      fetch(`${import.meta.env.VITE_API_URL}/process-media`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "error") throw new Error(data.message);
          updateMediaList(data.data);
          toast.success("Media processed successfully");
        });
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
      <div className="flex justify-center items-center w-full h-full overflow-hidden">
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
        <Slider mediaList={allMedia} />
      </div>
    </>
  );
}

function Slider({ mediaList }: { mediaList: Media[] }) {
  const window = useRef<HTMLElement>(null)
  const slider = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState<number>(0)
  const [activeCard, setActiveCard] = useState<number>(mediaList.length / 2)

  useEffect(() => {
    if (!slider.current) return
    slider.current.style.translate = `${offset}px 0`
  }, [offset])

  useEffect(() => {
    setActiveCard(mediaList.length / 2)
  }, [mediaList])

  return (
    <section ref={window} className="w-full h-4/5 overflow-hidden relative">
      <div ref={slider} className="flex items-center h-full gap-20 absolute top-0 left-1/3 -translate-x-1/2 transition-transform duration-300 ease-linear">
        {
          mediaList.map((m, i) => <MediaCard key={i} name={m.name} thumbnail={m.thumbnail} i={i}  activeCard={activeCard} setActiveCard={setActiveCard} setOffset={setOffset} window={window} />)
        }
      </div>
    </section>
  )
}

function MediaCard({ i, name, thumbnail, setOffset, activeCard, setActiveCard, window }: { i : number, name: string, thumbnail: string, activeCard: number, setActiveCard: React.Dispatch<React.SetStateAction<number>>, setOffset: React.Dispatch<React.SetStateAction<number>>, window: React.RefObject<HTMLElement | null>}) {

  const child = useRef<HTMLDivElement>(null)

  function slide() {
    if (!window.current) return
    if (!child.current) return
    const windowRect = window.current.getBoundingClientRect()
    const childRect = child.current.getBoundingClientRect()
    const distance = (windowRect.left + windowRect.width / 2) - (childRect.left + childRect.width / 2)
    setOffset(prev => prev + distance)
    setActiveCard(i)
  }

  useEffect(() => {
    if (!child.current) return
    if (activeCard === i) child.current.style.zIndex = "5"
    child.current.style.scale = `${150 - (Math.abs(activeCard - i) * 20)}%`
  }, [activeCard])

  return (
    <div ref={child} className={`w-45 h-60 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 ease-liear`} onClick={slide}>
      <img
        src={new URL(thumbnail, import.meta.env.VITE_MEDIA_URL).href}
        alt={name}
        className="w-full h-full"
      />
      {/* <h2 className="text-white font-bold text-lg text-center">{name}</h2> */}
    </div>
  )
}
