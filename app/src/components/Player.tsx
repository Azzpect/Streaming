import { useContext, useEffect, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { MediaDataContext } from "../context/MediaDataContext"


export default function Player() {

    const [ searchParams ] = useSearchParams()
    const player = useRef<HTMLVideoElement>(null)

    const id = searchParams.get("id")
    const { allMedia } = useContext(MediaDataContext)!
    const navigate = useNavigate()
    const parts = window.location.href.split(":")
    const MEDIA_URL = "http:" + parts.filter((_, i) => i !== parts.length - 1 && i !== 0).join("")+":8100"

    useEffect(() => {
        if (!id) {
            navigate("/")
            return
        }
        let parsedId = parseInt(id as string)
        if(isNaN(parsedId)) {
            navigate("/")
            return
        }
        if(allMedia.length === 0) {
            navigate("/")
            return
        }
        const media = allMedia[parsedId]

        if (media === undefined) {
            navigate("/")
            return
        }
        if (player.current) {
            player.current.src = new URL(media.path, MEDIA_URL).href
        }
    }, [])

    return (
        <video ref={player} className="w-screen h-screen" controls></video>
    )
}