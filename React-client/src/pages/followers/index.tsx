import { useSelector } from "react-redux"
import { selectCurrent } from "../../features/user/userSlice"
import { Link } from "react-router-dom"
import { Card, CardBody } from "@heroui/react"
import { User } from "../../components/user"

export const Followers = () => {
  const currentUser = useSelector(selectCurrent)

  if (!currentUser) {
    return null
  }

  return currentUser.followers.length > 0 ? (
    <div className="gap-4 flex flex-col">
      {currentUser.followers.map((user) => (
        <Link to={`/users/${user.follower.id}`} key={user.follower.id}>
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="p-4">
              <User
                name={user.follower.name ?? ""}
                avatarUrl={user.follower.avatarUrl ?? ""}
                description={user.follower.email ?? ""}
              />
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  ) : (
    <Card>
      <CardBody className="text-center py-12">
        <h2 className="text-xl font-semibold text-default-500">У вас нет подписчиков</h2>
        <p className="text-default-400 mt-2">Когда на вас подпишутся, они появятся здесь</p>
      </CardBody>
    </Card>
  )
}