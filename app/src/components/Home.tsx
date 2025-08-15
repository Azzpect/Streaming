import { Play } from "lucide-react"
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Home() {

    type Movie = {
        name: string;
        thumbnail: string;
        path: string;
    }

    const [ allMovies, setAllMovies ] = useState<Movie[]>([])

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/get-media-data`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json())
        .then(data => {
            if (data.status === "success") {
                toast.success("Movies data fetched successfully.")
                setAllMovies(data.data)
            } else {
                toast.error(data.message)
            }
        })
    }, [])

    return (
        <>
        <div>
            <button className="flex bg-blue-400 p-3 rounded-lg absolute bottom-2 right-2 cursor-pointer"><Play />Scan</button>
            <section className="flex gap-2 items-center">
                {
                    allMovies.map((movie, i) => <MovieCard key={i} name={movie.name} thumbnail={movie.thumbnail} />)
                }
            </section>
        </div>
        </>
    )
}

function MovieCard({ name, thumbnail } : { name: string, thumbnail: string }) {
    return (
        <div className="flex flex-col w-60 h-70 p-3 items-center cursor-pointer">
            <img src={new URL(thumbnail, import.meta.env.VITE_API_URL).href} alt={name} className="w-4/5 h-4/5" />
            <h2 className="text-white font-bold text-lg text-center">{name}</h2>
        </div>
    )
}