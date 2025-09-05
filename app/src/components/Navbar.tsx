import { Search } from "lucide-react";

export default function Navbar({
  setPage,
}: {
  setPage: React.Dispatch<React.SetStateAction<"home" | "settings">>;
}) {
  return (
    <>
      <div className="w-full h-full flex items-center justify-between md:justify-around pt-5">
        <h1 className="flex items-center text-white font-bold pl-5 text-2xl">
          Streaming <span className="text-cyan-400">APP</span>
        </h1>

        <nav className="flex items-center gap-10">
          <li
            className="font-bold text-gray-300 text-lg list-none cursor-pointer transition-colors duration-300 ease-linear hover:text-cyan-400"
            onClick={() => setPage("home")}
          >
            Home
          </li>
          <li
            className="font-bold text-gray-300 text-lg list-none cursor-pointer transition-colors duration-300 ease-linear hover:text-cyan-400"
            onClick={() => setPage("settings")}
          >
            Settings
          </li>
        </nav>
      </div>
      <div className="w-4/5 md:w-96 h-10 self-end absolute left-1/2 -translate-x-1/2 top-20">
        <input
          type="text"
          className="w-full h-full p-3 pl-5 outline-none text-lg text-white border-2 border-white rounded-4xl"
          placeholder="Search here...."
        />
        <Search
          color="white"
          className="absolute top-1/2 -translate-y-1/2 right-4"
        />
      </div>
    </>
  );
}
