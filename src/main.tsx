import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import { SharedDeal } from "./components/SharedDeal"

const shared = location.hash.startsWith("#share=")
createRoot(document.getElementById("root")!).render(<StrictMode>{shared ? <SharedDeal /> : <App />}</StrictMode>)
