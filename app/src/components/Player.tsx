import { useContext, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { MediaDataContext } from "../context/MediaDataContext"


export default function Player() {

    const [ searchParams ] = useSearchParams()
    const player = useRef<HTMLVideoElement>(null)

    const id = searchParams.get("id")
    const { allMedia } = useContext(MediaDataContext)!
    const navigate = useNavigate()

    useEffect(() => {
        if (!id) navigate("/")
        let parsedId = parseInt(id as string)
        if(isNaN(parsedId)) navigate("/")
        const media = allMedia[parsedId]
        
        if (player.current) {
            player.current.src = new URL(media.path, import.meta.env.VITE_MEDIA_URL).href
        }
    }, [])

    return (
        <video ref={player} className="w-screen h-screen" controls></video>
    )
}