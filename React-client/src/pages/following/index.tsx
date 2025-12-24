import { useSelector } from "react-redux"
import { selectCurrent } from "../../features/user/userSlice"
import { Link } from "react-router-dom"
import { Card, CardBody } from "@heroui/react"
import { User } from "../../components/user"

export const Following = () => {
  const currentUser = useSelector(selectCurrent)

  if (!currentUser) {
    return null
  }

  return currentUser.following.length > 0 ? (
    <div className="gap-4 flex flex-col">
      {currentUser.following.map((user) => (
        <Link to={`/users/${user.following.id}`} key={user.following.id}>
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="p-4">
              <User
                name={user.following.name ?? ""}
                avatarUrl={user.following.avatarUrl ?? ""}
                description={user.following.email ?? ""}
              />
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  ) : (
    <Card>
      <CardBody className="text-center py-12">
        <h2 className="text-xl font-semibold text-default-500">Вы не подписаны ни на кого</h2>
        <p className="text-default-400 mt-2">Начните подписываться на пользователей, чтобы видеть их посты</p>
      </CardBody>
    </Card>
  )
}