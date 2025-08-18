import { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Settings from "./components/Settings";
import { ToastContainer, Bounce } from "react-toastify";
import { MediaContextProvider } from "./context/MediaDataContext";
import { Routes, Route } from "react-router-dom";
import Player from "./components/Player";

export default function App() {
  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <MediaContextProvider>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/player" element={<Player />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </MediaContextProvider>
    </>
  );
}

function MainContent() {
  const [page, setPage] = useState<"home" | "settings">("home");

  return (
    <div className="w-screen h-screen grid grid-rows-[12vh_1fr]">
      <Navbar setPage={setPage} />
      {page === "home" && 
      <section className="flex flex-col items-center">
        <Home />
        <div className="flex flex-col items-center cursor-pointer">
          <p className="text-white text-lg font-bold">All Files</p>
          <div>
            <div className="w-3 h-3 border-t-3 border-t-white border-r-3 border-r-white rotate-135 arrow-bounce"></div>
            <div className="w-3 h-3 border-t-3 border-t-[#83E2F5] border-r-3 border-r-[#83E2F5] rotate-135 arrow-bounce"></div>
          </div>
        </div>
      </section>
      }
      {page === "settings" && <Settings />}
    </div>
  );
}

function Test() {
  return (
    <video src="http://localhost:8080/media/Saiyaara.mkv" className="w-screen h-screen" controls></video>
  )
}
