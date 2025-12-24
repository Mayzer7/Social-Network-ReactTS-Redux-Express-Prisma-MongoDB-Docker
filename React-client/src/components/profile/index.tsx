import { Card, CardHeader, CardBody, Image } from "@heroui/react"
import { useSelector } from "react-redux"
import { selectCurrent } from "../../features/user/userSlice"
import { MdAlternateEmail } from "react-icons/md"
import { BASE_URL } from "../../constants"
import { Link } from "react-router-dom"

export const Profile = () => {
  const current = useSelector(selectCurrent)

  if (!current) {
    return null
  }

  const { name, email, avatarUrl, id } = current

  return (
    <Card className="w-full">
      <CardHeader className="pb-0 pt-4 px-4 flex-col items-center">
        <Image
          alt="Profile avatar"
          className="object-cover rounded-full"
          src={`${BASE_URL}${avatarUrl}`}
          width={120}
          height={120}
          radius="full"
        />
      </CardHeader>
      <CardBody className="overflow-visible py-4 px-4">
        <Link to={`/users/${id}`} className="block text-center">
          <h4 className="font-bold text-lg mb-2 hover:text-primary transition-colors">{name}</h4>
        </Link>
        <p className="text-default-500 flex items-center justify-center gap-2 text-sm">
          <MdAlternateEmail />
          <span className="truncate">{email}</span>
        </p>
      </CardBody>
    </Card>
  )
}