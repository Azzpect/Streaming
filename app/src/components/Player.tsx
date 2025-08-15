import { useContext, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { MediaDataContext } from "../context/MediaDataContext"
import { MediaPlayer } from "dashjs"


export default function Player() {

    const [ searchParams ] = useSearchParams()

    const id = searchParams.get("id")
    const { allMedia } = useContext(MediaDataContext)!
    const navigate = useNavigate()

    useEffect(() => {
        if (!id) navigate("/")
        let parsedId = parseInt(id as string)
        if(isNaN(parsedId)) navigate("/")

        const player = MediaPlayer().create()
        const media = allMedia[parsedId]
        const playerElement: HTMLMediaElement | null = document.querySelector("#player") 
        if (!playerElement) {
            navigate("/")
            return
        }
        player.initialize(playerElement, new URL(media.path, import.meta.env.VITE_API_URL).href, false)
    }, [])

    return (
        <video id="player" className="w-screen h-screen" controls></video>
    )
}