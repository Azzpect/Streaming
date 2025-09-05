import { useContext, useEffect, useRef, useState } from "react";
import { MediaDataContext } from "../context/MediaDataContext";
import Folder from "../assets/folder.svg";
import type { Directory } from "../context/MediaDataContext";
import { useNavigate } from "react-router-dom";

export default function AllFiles({
  setYPos,
}: {
  setYPos: React.Dispatch<React.SetStateAction<number>>;
}) {
  const container = useRef<HTMLDivElement>(null);
  const { directoryData } = useContext(MediaDataContext)!;
  const [currentDir, setCurrentDir] = useState<Directory>(directoryData);
  const [history, setHistory] = useState<string[]>(["/"]);
  const [activeDir, setActiveDir] = useState<HTMLDivElement | null>(null);
  const [depth, setDepth] = useState<number>(1);

  useEffect(() => {
    if (!container.current) return;
    const rect = container.current.getBoundingClientRect();
    setYPos(rect.y + rect.height / 2);
  });

  function changeHistory(name: string) {
    const temp = [...history];
    let dir: Directory;
    for (let i = 1; i <= depth; i++) {
      dir = currentDir.subDirectories[name];
    }
    setCurrentDir(dir!);
    setHistory([...temp, name]);
    setDepth(depth + 1);
  }

  function rollbackHistory(newDepth: number) {
    let temp: string[] = [];
    for (let i = 0; i <= newDepth; i++) {
      temp[i] = history[i];
    }
    let dir: Directory = directoryData;
    for (let i = 1; i <= newDepth; i++) {
      dir = dir.subDirectories[history[i]];
    }
    setCurrentDir(dir);
    setHistory(temp);
  }

  return (
    <div
      ref={container}
      className="flex flex-col items-center gap-5 w-screen min-h-screen mt-[40vh]"
    >
      <h2 className="text-white text-lg font-bold">All Files</h2>
      <div className="self-start p-20 flex flex-col gap-5">
        <div className="flex gap-1 items-center">
          {history.map((s, i) => (
            <p
              key={i}
              className="text-white font-bold text-lg cursor-pointer"
              onClick={() => rollbackHistory(i)}
            >
              {history.length - 1 === i ? (
                <span className="hover:underline">{s}</span>
              ) : (
                <span>
                  <span className="hover:underline">{s}</span>
                  {`>`}
                </span>
              )}
            </p>
          ))}
        </div>
        <div className="flex gap-10 items-center">
          {Object.keys(currentDir.subDirectories).map((n, i) => {
            return (
              <Directory
                key={i}
                name={n}
                activeDir={activeDir}
                setActiveDir={setActiveDir}
                changeHistory={changeHistory}
              />
            );
          })}
          {Object.entries(currentDir.files).map(([n, d], i) => {
            return <MediaCard key={i} name={n} thumbnail={d.thumbnail} />;
          })}
        </div>
      </div>
    </div>
  );
}

function Directory({
  name,
  activeDir,
  setActiveDir,
  changeHistory,
}: {
  name: string;
  activeDir: HTMLDivElement | null;
  setActiveDir: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
  changeHistory: (name: string) => void;
}) {
  const self = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={self}
      className={`flex flex-col items-center gap-2 cursor-pointer directory p-5 rounded-xl ${
        self.current == activeDir ? "active-dir" : ""
      }`}
      onClick={() => {
        if (self.current == activeDir) {
          changeHistory(name);
          setActiveDir(null);
        } else {
          setActiveDir(self.current!);
        }
      }}
    >
      <img src={Folder} alt="" />
      <p className="text-white font-bold text-lg">{name}</p>
    </div>
  );
}

function MediaCard({ name, thumbnail }: { name: string; thumbnail: string }) {
  const { allMedia } = useContext(MediaDataContext)!;
  let index: number;
  const navigate = useNavigate();
  const parts = window.location.href.split(":");
  const MEDIA_URL =
    "http:" +
    parts.filter((_, i) => i !== parts.length - 1 && i !== 0).join("") +
    ":8100";

  useEffect(() => {
    for(let i = 0; i < allMedia.length; i++) {
      if (allMedia[i].thumbnail === thumbnail) {
        index = i;
        break;
      }
    }
  }, []);

  return (
    <div
      className={`w-45 h-60 flex flex-col items-center justify-center cursor-pointer`}
    >
      <img
        src={new URL(thumbnail, MEDIA_URL).href}
        alt={name}
        className="w-full h-full"
        onClick={() => {
          navigate("/player?id=" + index);
        }}
      />
      <p className="text-white font-bold text-lg text-center">{name}</p>
    </div>
  );
}
