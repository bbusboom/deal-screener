import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"

// Deal School app: the Learn side only, installable to a phone's home screen.
if ("serviceWorker" in navigator && location.hostname !== "localhost") {
  addEventListener("load", () => { navigator.serviceWorker.register("/learn-sw.js", { scope: "/learn" }).catch(() => {}) })
}
createRoot(document.getElementById("root")!).render(<StrictMode><App learnOnly /></StrictMode>)
