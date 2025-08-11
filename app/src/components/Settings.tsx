import { useState } from "react"
import { X, ChevronRight, ChevronDown, FolderClosed, File, FileText } from "lucide-react"



export default function Settings() {

    const [ showFolderPicker, setShowFolderPicker ] = useState<boolean>(false)

    return (
        <div className="flex flex-col justify-self-center w-4/5 p-10">
            <label htmlFor="path" className="text-lg text-white self-start">Your movies directory:</label>
            <div className="flex gap-2">
                <input type="text" id="path" className="border-white border-2 outline-none py-1 px-3 w-2/4 text-white text-lg" readOnly />
                <button className="bg-purple-950 text-white p-3 rounded-xl font-bold text-md cursor-pointer" onClick={() => setShowFolderPicker(true)}>Choose</button>
            </div>
            {showFolderPicker && <FolderPicker setShowFolderPicker={setShowFolderPicker} />}
        </div>
    )
}

function FolderPicker({ setShowFolderPicker } : { setShowFolderPicker : React.Dispatch<React.SetStateAction<boolean>>}) {

    const folderData: FolderData = {
        name: "/",
        type: "dir",
        children: [
            {
                name: "home",
                type: "dir",
                children: [
                    {
                        name: "azzpect",
                        type: "dir",
                        children: [
                            {
                                name: "Downloads",
                                type: "dir",
                                children: [
                                    {
                                        name: "myFile.txt",
                                        type: "txt",
                                    },
                                    {
                                        name: "myFile2.txt",
                                        type: "txt",
                                    }
                                ]
                            },
                            {
                                name: "Documents",
                                type: "dir",
                                children: []
                            }
                        ]
                    }
                ]
            }
        ],
    }

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-h-[40vh] min-w-[20vw] bg-white">
            <X className="absolute top-0 right-0 cursor-pointer" onClick={() => setShowFolderPicker(false)} />
            <h2 className="text-lg font-bold p-2">Choose a folder:</h2>
            <FolderStructure folderData={folderData} />
        </div>
    )
}

type FolderData = {
    name: string,
    children?: FolderData[],
    type: string
}

const Icons : {[key : string]: any} = {
    "dir": <FolderClosed />,
    "txt": <FileText />
}

function FolderStructure({ folderData } : { folderData: FolderData}) {
    return (
        <div className="p-5">
            <Folder data={folderData} indent={1} />
        </div>
    )
}

function Folder({ data, indent } : { data: FolderData, indent: number }) {

    const [ open, setOpen ] = useState<boolean>(false)
    
    return (
        <>
            <div 
            className="flex items-center gap-2 cursor-pointer"
            style={{paddingLeft: `${indent*8}px`}}
            onClick={() => {
                if (!open) setOpen(true)
            }} 
            >
                {!open ? <ChevronRight className="cursor-pointer" /> : <ChevronDown className="cursor-pointer" onClick={() => setOpen(false)} />}
                {Icons[data.type]}
                <p className="text-lg">{data.name}</p>
            </div>
            { open && data.children &&
                data.children.map((child, i) => {
                    return <Folder key={i} data={child} indent={indent+1} />
                })
            }
        </>
    )
}