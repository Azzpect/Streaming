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
        </Routes>
      </MediaContextProvider>
    </>
  );
}

function MainContent() {
  const [page, setPage] = useState<"home" | "settings">("home");

  return (
    <div className="w-screen grid grid-rows-[8vh_1fr]">
      <Navbar setPage={setPage} />
      {page === "home" && <Home />}
      {page === "settings" && <Settings />}
    </div>
  );
}
