import {
  Card as NextUiCard,
  CardHeader,
  CardBody,
  CardFooter,
} from "@heroui/react"
import { MetaInfo } from "../meta-info"
import { Typography } from "../typography"
import { User } from "../user"
import { Link, useNavigate } from "react-router-dom"
import { FaRegComment } from "react-icons/fa6"
import {
  useUnlikePostMutation,
  useLikePostMutation,
} from "../../app/services/likesApi"
import {
  useDeletePostMutation,
  useLazyGetAllPostsQuery,
  useLazyGetPostByIdQuery,
} from "../../app/services/postsApi"
import { FcDislike } from "react-icons/fc"
import { MdOutlineFavoriteBorder } from "react-icons/md"
import { formatToClientDate } from "../../utils/format-to-client-date"
import { RiDeleteBinLine } from "react-icons/ri"
import { useSelector } from "react-redux"
import { selectCurrent } from "../../features/user/userSlice"
import { useDeleteCommentMutation } from "../../app/services/commentsApi"
import { Spinner } from "@heroui/react"
import { ErrorMessage } from "../error-message"
import { useState } from "react"
import { hasErrorField } from "../../utils/has-error-field"
import { PostImage } from "../../app/types"
import { BASE_URL } from "../../constants"
import { ImageViewer } from "../image-viewer"

type Props = {
  avatarUrl: string
  name: string
  authorId: string
  content: string
  commentId?: string
  likesCount?: number
  commentsCount?: number
  createdAt?: Date
  id?: string
  cardFor: "comment" | "post" | "current-post"
  likedByUser?: boolean
  images?: PostImage[]
}

export const Card = ({
  avatarUrl = "",
  name = "",
  content = "",
  authorId = "",
  id = "",
  likesCount = 0,
  commentsCount = 0,
  cardFor = "post",
  likedByUser = false,
  createdAt,
  commentId = "",
  images = [],
}: Props) => {
  const [likePost] = useLikePostMutation()
  const [unlikePost] = useUnlikePostMutation()
  const [triggerGetAllPosts] = useLazyGetAllPostsQuery()
  const [triggerGetPostById] = useLazyGetPostByIdQuery()
  const [deletePost, deletePostStatus] = useDeletePostMutation()
  const [deleteComment, deleteCommentStatus] = useDeleteCommentMutation()
  const [error, setError] = useState("")
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrent)

  const openViewer = (index: number) => {
    setViewerIndex(index)
    setViewerOpen(true)
  }

  const refetchPosts = async () => {
    switch (cardFor) {
      case "post":
        await triggerGetAllPosts().unwrap()
        break
      case "current-post":
        await triggerGetPostById(id).unwrap()
        break
      case "comment":
        await triggerGetPostById(id).unwrap()
        break
      default:
        throw new Error("Неверный аргумент cardFor")
    }
  }

  const handleClick = async () => {
    setError("")
    
    try {
      likedByUser
        ? await unlikePost(id).unwrap()
        : await likePost({ postId: id }).unwrap()
    } catch (err) {
      if (hasErrorField(err)) {
        setError(err.data.error)
        setTimeout(() => setError(""), 3000)
      } else {
        setError("Произошла ошибка при обработке лайка")
        setTimeout(() => setError(""), 3000)
      }
    }
  }

  const handleDelete = async () => {
    try {
      switch (cardFor) {
        case "post":
          await deletePost(id).unwrap()
          await refetchPosts()
          break
        case "current-post":
          await deletePost(id).unwrap()
          navigate('/')
          break
        case "comment":
          await deleteComment(commentId).unwrap()
          await refetchPosts()
          break
        default:
          throw new Error("Неверный аргумент cardFor")
      }

    } catch (err) {
      console.log(err)
      if (hasErrorField(err)) {
        setError(err.data.error)
      } else {
        setError(err as string)
      }
    }
  }

  return (
    <NextUiCard className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="justify-between items-start gap-2 pb-2">
        <Link to={`/users/${authorId}`} className="flex-1 min-w-0">
          <User
            name={name}
            className="text-small font-semibold leading-none text-default-600 hover:text-primary transition-colors"
            avatarUrl={avatarUrl}
            description={createdAt && formatToClientDate(createdAt)}
          />
        </Link>
        {authorId === currentUser?.id && (
          <button
            className="cursor-pointer text-default-400 hover:text-danger transition-colors p-1"
            onClick={handleDelete}
            aria-label="Удалить"
          >
            {deletePostStatus.isLoading || deleteCommentStatus.isLoading ? (
              <Spinner size="sm" />
            ) : (
              <RiDeleteBinLine className="text-xl" />
            )}
          </button>
        )}
      </CardHeader>
      <CardBody className="px-4 py-3 flex flex-col gap-3">
        <Typography>{content}</Typography>
        {images.length > 0 && (
          <div
            className={`grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          >
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => openViewer(index)}
                className="overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <img
                  src={`${BASE_URL}${image.url}`}
                  alt="post image"
                  className="w-full object-cover max-h-72 hover:opacity-90 transition-opacity"
                />
              </button>
            ))}
          </div>
        )}
        {images.length > 0 && (
          <ImageViewer
            images={images}
            initialIndex={viewerIndex}
            isOpen={viewerOpen}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </CardBody>
      {cardFor !== "comment" && (
        <CardFooter className="gap-3 pt-2">
          <div className="flex gap-6 items-center">
            <button
              onClick={handleClick}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
              aria-label={likedByUser ? "Убрать лайк" : "Поставить лайк"}
            >
              <MetaInfo
                count={likesCount}
                Icon={likedByUser ? FcDislike : MdOutlineFavoriteBorder}
              />
            </button>
            <Link
              to={`/posts/${id}`}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <MetaInfo count={commentsCount} Icon={FaRegComment} />
            </Link>
          </div>
          <ErrorMessage error={error} />
        </CardFooter>
      )}
    </NextUiCard>
  )
}