import React, { useEffect } from "react"
import { useCurrentQuery } from "../../app/services/userApi"
import { Spinner } from "@heroui/react"
import { useNavigate } from "react-router-dom"

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const { isLoading, isError } = useCurrentQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    // Если нет токена или запрос /current вернулся с ошибкой — отправляем на /auth
    if (!token || isError) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
      }
      navigate("/auth", { replace: true })
    }
  }, [token, isError, navigate])

  if (!token || isLoading) {
    return <Spinner />
  }

  return children
}