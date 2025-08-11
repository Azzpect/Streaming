import React, { useEffect, useRef, useState } from "react";
import {
  X,
  ChevronRight,
  ChevronDown,
  FolderClosed,
  FileText,
} from "lucide-react";
import { createRoot, type Root } from "react-dom/client";

export default function Settings() {
  const [showFolderPicker, setShowFolderPicker] = useState<boolean>(false);
  const [folderPath, setFolderPath] = useState<string>("");

  return (
    <div className="flex flex-col justify-self-center w-4/5 p-10">
      <label htmlFor="path" className="text-lg text-white self-start">
        Your movies directory:
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          id="path"
          className="border-white border-2 outline-none py-1 px-3 w-2/4 text-white text-lg"
          value={folderPath}
          readOnly
        />
        <button
          className="bg-purple-950 text-white p-3 rounded-xl font-bold text-md cursor-pointer"
          onClick={() => setShowFolderPicker(true)}
        >
          Choose
        </button>
      </div>
      {showFolderPicker && (
        <FileSystem
          setShowFolderPicker={setShowFolderPicker}
          setFolderPath={setFolderPath}
        />
      )}
    </div>
  );
}

function FileSystem({
  setShowFolderPicker,
  setFolderPath,
}: {
  setShowFolderPicker: React.Dispatch<React.SetStateAction<boolean>>;
  setFolderPath: React.Dispatch<React.SetStateAction<string>>;
}) {
  
  const data: DirectoryData = { name: "/", type: "dir" }

  const container = useRef<HTMLDivElement>(null)

  const [selectedFolder, setSelectedFolder] = useState<string>("")
  const root = useRef<Root | null>(null)

  useEffect(() => {
    setTimeout(() => {
      if (!container.current) return
      if (!root.current) root.current = createRoot(container.current)
      root.current.render(
        <Directory
          data={data}
          indent={1}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
        />
      )
    }, 1000)
  }, [])

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40vh] min-w-[20vw] bg-white flex flex-col">
      <X
        className="absolute top-0 right-0 cursor-pointer"
        onClick={() => setShowFolderPicker(false)}
      />
      <h2 className="text-lg font-bold p-2">Choose a folder:</h2>
      <div ref={container} className="h-4/6">
      </div>
      <button className="self-end mr-5 py-1 p-3 bg-blue-400 rounded-xl text-white" onClick={() => setFolderPath(selectedFolder)} disabled={selectedFolder === ""}>Choose</button>
    </div>
  );
}

type DirectoryData = {
  name: string;
  type: string;
};

const Icons: { [key: string]: any } = {
  dir: <FolderClosed />,
  txt: <FileText />,
};

function Directory({
  data,
  indent,
  path,
  selectedFolder,
  setSelectedFolder,
}: {
  data: DirectoryData;
  indent: number;
  path?: string;
  selectedFolder: string;
  setSelectedFolder: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [open, setOpen] = useState<boolean>(false);
  path = path ? path : data.name;

  function handleOnclick() {
    if (!open) setOpen(true);
    if (data.type === "dir") setSelectedFolder(path as string);
  }


  return (
    <>
      <div
        className={`flex items-center gap-2 cursor-pointer ${
          selectedFolder === path ? "bg-blue-300" : ""
        } hover:bg-blue-300`}
        style={{ paddingLeft: `${indent * (data.type !== "dir" ? 16 : 8)}px` }}
        onClick={handleOnclick}
      >
        {data.type === "dir" &&
          (!open ? (
            <ChevronRight className="cursor-pointer" />
          ) : (
            <ChevronDown
              className="cursor-pointer"
              onClick={() => {
                setOpen(false);
                setSelectedFolder("");
              }}
            />
          ))}
        {Icons[data.type]}
        <p className="text-lg">{data.name}</p>
      </div>
    </>
  );
}
