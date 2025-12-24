import { useEffect } from "react"
import { Container } from "../container"
import { NavBar } from "../nav-bar"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { Profile } from "../profile"
import { useSelector } from "react-redux"
import {
  selectUser,
  selectIsAuthenticated,
} from "../../features/user/userSlice"
import { Header } from "../header"

export const Layout = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth")
    }
  }, [])

  return (
    <>
      <Header />
      <Container>
        {/* Левое меню - показывается только на больших экранах (lg+) */}
        <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            <NavBar />
          </div>
        </aside>
        
        {/* Основной контент */}
        <main className="flex-1 min-w-0 max-w-2xl mx-auto w-full px-2 sm:px-0">
          <Outlet />
        </main>
        
        {/* Правый сайдбар с профилем - показывается только на очень больших экранах (xl+) */}
        <aside className="hidden xl:block xl:w-72 flex-shrink-0">
          <div className="sticky top-20">
            {!user && <Profile />}
          </div>
        </aside>
      </Container>
    </>
  )
}