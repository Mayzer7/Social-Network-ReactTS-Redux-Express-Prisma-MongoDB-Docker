import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@heroui/react"

type Props = {
  children: React.ReactNode
  icon: React.ReactNode
  href: string
}

export const NavButton: React.FC<Props> = ({ children, icon, href }) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const isActive = href === "/" 
    ? location.pathname === "/"
    : location.pathname === href || location.pathname.startsWith(href + "/")
  
  const handleClick = () => {
    navigate(href, { replace: false })
  }
  
  return (
    <Button
      className="w-full justify-start"
      variant={isActive ? "solid" : "light"}
      color={isActive ? "primary" : "default"}
      startContent={icon}
      size="lg"
      onClick={handleClick}
      type="button"
    >
      {children}
    </Button>
  )
}