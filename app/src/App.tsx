import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import Settings from "./components/Settings";
import { ToastContainer, Bounce } from "react-toastify";

export default function App() {
  const [page, setPage] = useState<"home" | "settings">("home");

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
    <div className="w-screen h-screen grid grid-cols-[300px_1fr] grid-rows-[80px_1fr] bg-purple-900">
      <Navbar />
      <Sidebar setPage={setPage} />
      {page === "home" && <Home />}
      {page === "settings" && <Settings />}
    </div>
    </>
  );
}
