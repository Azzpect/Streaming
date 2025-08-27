import React, { useContext, useEffect, useState, useRef } from "react";
import { MediaDataContext } from "../context/MediaDataContext";
import type { Media } from "../context/MediaDataContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Scanner from "../assets/scanner.svg";
import AllFiles from "./AllFiles";

export default function Home() {
  const { allMedia, fetchAllMedia, resetAllMedia } =
    useContext(MediaDataContext)!;
  const [loading, setLoading] = useState<boolean>(false);
  const [allFilesYPos, setYPos] = useState<number>(0);

  async function startMediaProcessing() {
    setLoading(true);
    resetAllMedia();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/process-media`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.status === "error") throw new Error(data.message);
      fetchAllMedia()
      toast.success(data.message);
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
      <div className="flex flex-col justify-center items-center w-full overflow-hidden">
        {loading ? (
          <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full flex items-center justify-center loader">
            <div className="w-[80%] h-[80%] bg-[#141212] rounded-full"></div>
          </div>
        ) : (
          <img
            src={Scanner}
            className="fixed bottom-10 right-10 cursor-pointer"
            onClick={() => {
              window.scrollTo(0, 0);
              startMediaProcessing();
            }}
          />
        )}
        {allMedia.length === 0 ? (
          <div className="flex items-center justify-center min-h-[90vh]">
            <p className="font-bold text-white text-xl">
              {loading
                ? "Processing media...."
                : "No media found. Scan the directory."}
            </p>
          </div>
        ) : (
          <>
          <Slider mediaList={allMedia} />
            <div
              className="flex flex-col items-center cursor-pointer"
              onClick={() => {
                window.scrollTo(0, allFilesYPos);
              }}
            >
              <p className="text-white text-lg font-bold">All Files</p>
              <div>
                <div className="w-3 h-3 border-t-3 border-t-white border-r-3 border-r-white rotate-135 arrow-bounce"></div>
                <div className="w-3 h-3 border-t-3 border-t-[#83E2F5] border-r-3 border-r-[#83E2F5] rotate-135 arrow-bounce"></div>
              </div>
            </div>
            <AllFiles setYPos={setYPos} />
          </>
        )}
      </div>
    </>
  );
}

function Slider({ mediaList }: { mediaList: Media[] }) {
  const window = useRef<HTMLElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<number>(0);
  const [activeCard, setActiveCard] = useState<number>(
    Math.floor(mediaList.length / 2)
  );

  useEffect(() => {
    if (!slider.current) return;
    slider.current.style.translate = `${offset}px 0`;
  }, [offset]);

  useEffect(() => {
    if (!slider.current || !window.current) return;
    const sliderRect = slider.current.getBoundingClientRect();
    const windowRect = window.current.getBoundingClientRect();
    const distance =
      windowRect.left +
      windowRect.width / 2 -
      (sliderRect.left + sliderRect.width / 2);
    setOffset(distance);
  }, [mediaList]);

  return (
    <section ref={window} className="w-full h-[70vh] overflow-hidden relative">
      <div
        ref={slider}
        className="flex items-center h-full gap-20 absolute top-0 left-1/2 -translate-x-1/2 transition-transform duration-300 ease-linear"
      >
        {mediaList.map((m, i) => (
          <MediaCard
            key={i}
            name={m.name}
            thumbnail={m.thumbnail}
            i={i}
            activeCard={activeCard}
            setActiveCard={setActiveCard}
            setOffset={setOffset}
            windowObj={window}
          />
        ))}
      </div>
    </section>
  );
}

function MediaCard({
  i,
  name,
  thumbnail,
  setOffset,
  activeCard,
  setActiveCard,
  windowObj,
}: {
  i: number;
  name: string;
  thumbnail: string;
  activeCard: number;
  setActiveCard: React.Dispatch<React.SetStateAction<number>>;
  setOffset: React.Dispatch<React.SetStateAction<number>>;
  windowObj: React.RefObject<HTMLElement | null>;
}) {
  const child = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const parts = window.location.href.split(":");
  const MEDIA_URL =
    "http:" +
    parts.filter((_, i) => i !== parts.length - 1 && i !== 0).join("") +
    ":8100";

  function slide() {
    if (!windowObj.current) return;
    if (!child.current) return;
    if (activeCard === i) navigate("/player?id=" + i);
    const windowRect = windowObj.current.getBoundingClientRect();
    const childRect = child.current.getBoundingClientRect();
    const distance =
      windowRect.left +
      windowRect.width / 2 -
      (childRect.left + childRect.width / 2);
    setOffset((prev) => prev + distance);
    setActiveCard(i);
  }

  useEffect(() => {
    if (!child.current) return;
    if (activeCard === i) {
      child.current.style.zIndex = "5";
    }
    child.current.style.scale = `${150 - Math.abs(activeCard - i) * 20}%`;
  }, [activeCard]);

  return (
    <div
      ref={child}
      className={`w-45 h-60 flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 ease-liear`}
      onClick={slide}
    >
      <img
        src={new URL(thumbnail, MEDIA_URL).href}
        alt={name}
        className="w-full h-full"
      />
    </div>
  );
}
