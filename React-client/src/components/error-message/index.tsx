import React from "react"
import { Chip } from "@heroui/react"
import { IoCloseCircle } from "react-icons/io5"

export const ErrorMessage = ({ error = "" }: { error: string }) => {
  if (!error) return null
  
  return (
    <Chip
      color="danger"
      variant="flat"
      startContent={<IoCloseCircle />}
      className="mt-2"
    >
      {error}
    </Chip>
  )
}