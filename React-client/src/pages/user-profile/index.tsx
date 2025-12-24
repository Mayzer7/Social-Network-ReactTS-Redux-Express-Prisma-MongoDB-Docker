import { useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  useGetUserByIdQuery,
  useLazyCurrentQuery,
  useLazyGetUserByIdQuery,
} from "../../app/services/userApi"
import { useDispatch, useSelector } from "react-redux"
import { resetUser, selectCurrent } from "../../features/user/userSlice"
import { Button, Card, Image } from "@heroui/react"
import { MdOutlinePersonAddAlt1 } from "react-icons/md"
import { MdOutlinePersonAddDisabled } from "react-icons/md"
import { useDisclosure } from "@heroui/react"
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "../../app/services/followApi"
import { GoBack } from "../../components/go-back"
import { BASE_URL } from "../../constants"
import { CiEdit } from "react-icons/ci"
import { EditProfile } from "../../components/edit-profile"
import { formatToClientDate } from "../../utils/format-to-client-date"
import { ProfileInfo } from "../../components/profile-info"
import { CountInfo } from "../../components/count-info"

export const UserProfile = () => {
  const { id } = useParams<{ id: string }>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const currentUser = useSelector(selectCurrent)
  const { data } = useGetUserByIdQuery(id ?? "")
  const [followUser] = useFollowUserMutation()
  const [unfolowUser] = useUnfollowUserMutation()
  const [triggerGetUserByIdQuery] = useLazyGetUserByIdQuery()
  const [triggerCurrentQuery] = useLazyCurrentQuery()

  const dispatch = useDispatch()

  useEffect(
    () => () => {
      dispatch(resetUser())
    },
    [],
  )

  const handleFollow = async () => {
    try {
      if (id) {
        data?.isFollowing
          ? await unfolowUser(id).unwrap()
          : await followUser({ followingId: id }).unwrap()

        await triggerGetUserByIdQuery(id)

        await triggerCurrentQuery()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleClose = async () => {
    try {
      if (id) {
        await triggerGetUserByIdQuery(id)
        await triggerCurrentQuery()
        onClose()
      }
    } catch (err) {
      console.log(err)
    }
  }

  if (!data) {
    return null
  }

  return (
    <>
      <GoBack />
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <Card className="flex flex-col items-center text-center gap-4 p-6 w-full lg:w-auto lg:min-w-[280px]">
          <div className="relative">
            <Image
              src={`${BASE_URL}${data.avatarUrl}`}
              alt={data.name}
              width={180}
              height={180}
              className="object-cover rounded-full border-4 border-default-200"
              radius="full"
            />
          </div>
          <div className="flex flex-col gap-3 items-center w-full">
            <h2 className="text-2xl font-bold">{data.name}</h2>
            {currentUser?.id !== id ? (
              <Button
                color={data?.isFollowing ? "default" : "primary"}
                variant={data?.isFollowing ? "bordered" : "solid"}
                className="gap-2 w-full sm:w-auto"
                onClick={handleFollow}
                endContent={
                  data?.isFollowing ? (
                    <MdOutlinePersonAddDisabled />
                  ) : (
                    <MdOutlinePersonAddAlt1 />
                  )
                }
              >
                {data?.isFollowing ? 'Отписаться' : 'Подписаться'}
              </Button>
            ) : (
              <Button
                color="primary"
                variant="flat"
                className="gap-2 w-full sm:w-auto"
                endContent={<CiEdit />}
                onClick={() => onOpen()}
              >
                Редактировать
              </Button>
            )}
          </div>
        </Card>
        
        <div className="flex flex-col gap-4 flex-1">
          <Card className="p-6">
            <div className="flex flex-col gap-4">
              <ProfileInfo title="Почта:" info={data.email} />
              <ProfileInfo title="Местоположение:" info={data.location} />
              <ProfileInfo title="Дата рождения:" info={formatToClientDate(data.dateOfBirth)} />
              <ProfileInfo title="Обо мне:" info={data.bio} />
            </div>
          </Card>
          
          <div className="flex gap-3">
            <CountInfo count={data.followers.length} title="Подписчики"/>
            <CountInfo count={data.following.length} title="Подписки"/>
          </div>
        </div>
      </div>
      <EditProfile isOpen={isOpen} onClose={handleClose} user={data} />
    </>
  )
}