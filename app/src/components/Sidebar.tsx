import { House, Settings } from "lucide-react"


export default function Sidebar({ setPage } : { setPage: React.Dispatch<React.SetStateAction<"home" | "settings">>}) {
    return (
        <div className="flex flex-col gap-3 bg-purple-950 p-3">
            <div className="flex gap-1 items-center justify-center hover:bg-purple-400 cursor-pointer transition-colors duration-300 ease-linear p-5 rounded-xl" onClick={() => setPage("home")}>
                <House color="white" />
                <p className="text-white text-lg">Home</p>
            </div>
            <div className="flex gap-1 items-center justify-center hover:bg-purple-400 cursor-pointer transition-colors duration-300 ease-linear p-5 rounded-xl" onClick={() => setPage("settings")}>
                <Settings color="white" />
                <p className="text-white text-lg">Settings</p>
            </div>
        </div>
    )
}