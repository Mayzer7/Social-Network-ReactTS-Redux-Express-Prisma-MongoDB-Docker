import { useSelector } from "react-redux"
import { selectIsAuthenticated } from "../features/user/userSlice"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export const useAuthGuard = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const navigate = useNavigate()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    // Если пользователь уже авторизован или есть токен — не даем попасть на страницу /auth
    if (isAuthenticated || token) {
      navigate("/", { replace: true })
    }
  }, [isAuthenticated, token, navigate])
}