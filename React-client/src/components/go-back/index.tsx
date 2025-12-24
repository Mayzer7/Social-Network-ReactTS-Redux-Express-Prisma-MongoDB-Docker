import React from "react"
import { FaRegArrowAltCircleLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

export const GoBack = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <button
      onClick={handleGoBack}
      className="text-default-500 flex items-center gap-2 mb-6 hover:text-primary transition-colors cursor-pointer"
      aria-label="Назад"
    >
      <FaRegArrowAltCircleLeft className="text-xl" />
      <span className="font-medium">Назад</span>
    </button>
  )
}