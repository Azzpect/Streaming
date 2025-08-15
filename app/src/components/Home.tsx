import { Play } from "lucide-react"
import { useContext, useEffect } from "react";
import { MediaDataContext } from "../context/MediaDataContext";
import { useNavigate } from "react-router-dom";

export default function Home() {

    const { allMedia, fetchAllMedia } = useContext(MediaDataContext)!

    useEffect(() => {
        fetchAllMedia()
    }, [])

    return (
        <>
        <div>
            <button className="flex bg-blue-400 p-3 rounded-lg absolute bottom-2 right-2 cursor-pointer"><Play />Scan</button>
            <section className="flex gap-2 items-center">
                {
                    allMedia.map((movie, i) => <MovieCard key={i} index={i} name={movie.name} thumbnail={movie.thumbnail} />)
                }
            </section>
        </div>
        </>
    )
}

function MovieCard({ index, name, thumbnail } : { index: number, name: string, thumbnail: string }) {

    const navigate = useNavigate()

    return (
        <div className="flex flex-col w-60 h-70 p-3 items-center cursor-pointer" onClick={() => navigate(`/player?id=${index}`)}>
            <img src={new URL(thumbnail, import.meta.env.VITE_API_URL).href} alt={name} className="w-4/5 h-4/5" />
            <h2 className="text-white font-bold text-lg text-center">{name}</h2>
        </div>
    )
}