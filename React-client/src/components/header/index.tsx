import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Avatar,
} from "@heroui/react"
import { LuSunMedium } from "react-icons/lu"
import { FaRegMoon } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { CiLogout } from "react-icons/ci"
import { logout, selectIsAuthenticated, selectCurrent } from "../../features/user/userSlice"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useContext, useState } from "react"
import { ThemeContext } from "../theme-provider"
import { BsPostcard } from "react-icons/bs"
import { FiUsers } from "react-icons/fi"
import { FaUsers } from "react-icons/fa"
import { BASE_URL } from "../../constants"

export const Header = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const currentUser = useSelector(selectCurrent)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const hadleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('token')
    navigate("/auth")
  }

  const menuItems = [
    { name: "Посты", href: "/", icon: <BsPostcard /> },
    { name: "Подписки", href: "/following", icon: <FiUsers /> },
    { name: "Подписчики", href: "/followers", icon: <FaUsers /> },
  ]

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} isMenuOpen={isMenuOpen} isBordered>
      <NavbarContent>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden relative w-7 h-7 min-w-[28px] p-0 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
        >
          <span
            className={`absolute left-1/2 block w-5 h-0.5 bg-foreground transition-all duration-300 ease-in-out ${
              isMenuOpen 
                ? "top-1/2 rotate-45 -translate-x-1/2 -translate-y-1/2" 
                : "top-[8px] -translate-x-1/2"
            }`}
          />
          <span
            className={`absolute left-1/2 top-1/2 block w-5 h-0.5 bg-foreground transition-all duration-300 ease-in-out -translate-x-1/2 -translate-y-1/2 ${
              isMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-1/2 block w-5 h-0.5 bg-foreground transition-all duration-300 ease-in-out ${
              isMenuOpen 
                ? "top-1/2 -rotate-45 -translate-x-1/2 -translate-y-1/2" 
                : "top-[20px] -translate-x-1/2"
            }`}
          />
        </button>
        <NavbarBrand className="max-w-[calc(100vw-140px)]">
          <Link to="/" className="font-bold text-base sm:text-xl truncate">
            Social Network
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {isAuthenticated && (
        <NavbarContent className="hidden md:flex lg:hidden gap-2" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.href} isActive={location.pathname === item.href}>
              <Link
                to={item.href}
                className={`text-sm px-3 py-1 rounded-md transition-colors ${
                  location.pathname === item.href
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-default-600 hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
      )}

      <NavbarContent justify="end" className="gap-1 sm:gap-2 min-w-0">
        {isAuthenticated && currentUser && (
          <NavbarItem className="flex xl:hidden">
            <Link 
              to={`/users/${currentUser.id}`}
              className="flex items-center gap-1.5 sm:gap-2 px-1 sm:px-2 py-1 rounded-lg hover:bg-default-100 transition-colors"
            >
              <Avatar
                src={currentUser.avatarUrl ? `${BASE_URL}${currentUser.avatarUrl}` : undefined}
                name={currentUser.name || currentUser.email}
                size="sm"
                className="cursor-pointer w-7 h-7 sm:w-8 sm:h-8"
              />
              <span className="hidden md:inline text-sm font-medium text-default-700">
                {currentUser.name || "Профиль"}
              </span>
            </Link>
          </NavbarItem>
        )}
        
        <NavbarItem className="flex-shrink-0">
          <button
            className="text-xl sm:text-2xl cursor-pointer hover:opacity-70 transition-opacity p-1"
            onClick={() => toggleTheme()}
            aria-label="Переключить тему"
          >
            {theme === "light" ? <FaRegMoon /> : <LuSunMedium />}
          </button>
        </NavbarItem>
        
        {isAuthenticated && (
          <NavbarItem className="flex-shrink-0">
            <Button
              color="default"
              variant="flat"
              className="gap-1 sm:gap-2 min-w-0 px-2 sm:px-3"
              onClick={hadleLogout}
              size="sm"
            >
              <CiLogout className="text-lg sm:text-xl" /> 
              <span className="hidden min-[380px]:inline">Выйти</span>
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>

      {isAuthenticated && (
        <NavbarMenu className="max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-4 py-2">
            {menuItems.map((item, index) => (
              <NavbarMenuItem key={`${item.href}-${index}`}>
                <Link
                  to={item.href}
                  className={`w-full flex items-center gap-3 py-3 px-3 rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? "text-primary font-semibold bg-primary/10"
                      : "text-foreground hover:bg-default-100 dark:hover:bg-default-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </NavbarMenuItem>
            ))}
            
            {currentUser && (
              <>
                <NavbarMenuItem className="border-t border-divider mt-2 pt-4">
                  <Link
                    to={`/users/${currentUser.id}`}
                    className={`w-full flex items-center gap-3 py-3 px-3 rounded-lg transition-colors ${
                      location.pathname === `/users/${currentUser.id}`
                        ? "text-primary font-semibold bg-primary/10"
                        : "text-foreground hover:bg-default-100 dark:hover:bg-default-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Avatar
                      src={currentUser.avatarUrl ? `${BASE_URL}${currentUser.avatarUrl}` : undefined}
                      name={currentUser.name || currentUser.email}
                      size="sm"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold">{currentUser.name || "Профиль"}</span>
                      <span className="text-xs text-default-500">Мой профиль</span>
                    </div>
                  </Link>
                </NavbarMenuItem>
              </>
            )}
          </div>
        </NavbarMenu>
      )}
    </Navbar>
  )
}