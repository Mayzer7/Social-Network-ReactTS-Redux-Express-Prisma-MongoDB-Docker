import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { HeroUIProvider } from "@heroui/react"
import { App } from "./App"
import { store } from "./app/store"
import "./index.css"

const container = document.getElementById("root")

if (container) {
  const root = createRoot(container)

  root.render(
    <StrictMode>
      <HeroUIProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </HeroUIProvider>
    </StrictMode>
  )
} else {
  throw new Error(
    "Root element with ID 'root' was not found in the document."
  )
}
