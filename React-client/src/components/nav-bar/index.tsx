import React from "react"
import { BsPostcard } from "react-icons/bs"
import { FaUsers } from "react-icons/fa"
import { FiUsers } from "react-icons/fi"
import { NavButton } from "../nav-button"

export const NavBar: React.FC = () => {
  return (
    <nav className="w-full">
      <ul className="flex flex-col gap-2">
        <li>
          <NavButton href="/" icon={<BsPostcard />}>
            Посты
          </NavButton>
        </li>
        <li>
          <NavButton href="/following" icon={<FiUsers />}>
            Подписки
          </NavButton>
        </li>
        <li>
          <NavButton href="/followers" icon={<FaUsers />}>
            Подписчики
          </NavButton>
        </li>
      </ul>
    </nav>
  )
}