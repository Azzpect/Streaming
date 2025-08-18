import { useEffect, useRef } from "react"

export default function AllFiles({ setYPos } : { setYPos : React.Dispatch<React.SetStateAction<number>>}) {

    const container = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!container.current) return
        const rect =container.current.getBoundingClientRect() 
        setYPos(rect.y + rect.height / 2)
    })

    return (
        <div ref={container} className="flex justify-center w-screen h-screen mt-[40vh]">
            <h2 className="text-white text-lg font-bold">All Files</h2>
        </div>
    )
}