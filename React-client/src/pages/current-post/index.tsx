import { useParams } from "react-router-dom"
import { useGetPostByIdQuery } from "../../app/services/postsApi"
import { Card } from "../../components/card"
import { CreateComment } from "../../components/create-comment"
import { GoBack } from "../../components/go-back"

export const CurrentPost = () => {
  const params = useParams<{ id: string }>()
  const { data } = useGetPostByIdQuery(params?.id ?? "")

  if (!data) {
    return <h2>Поста не существует</h2>
  }

  const {
    content,
    id,
    authorId,
    comments,
    likes,
    author,
    likedByUser,
    createdAt,
    images,
  } = data

  return (
    <>
      <GoBack />
      <Card
        cardFor="current-post"
        avatarUrl={author?.avatarUrl ?? ""}
        content={content}
        name={author?.name ?? ""}
        likesCount={likes.length}
        commentsCount={comments?.length}
        authorId={authorId}
        id={id}
        likedByUser={likedByUser}
        createdAt={createdAt}
        images={images}
      />
      <div className="mt-6">
        <CreateComment />
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">
          Комментарии {comments?.length ? `(${comments.length})` : ""}
        </h3>
        {data.comments && data.comments.length > 0 ? (
          <div className="space-y-4">
            {data.comments.map((comment) => (
              <Card
                cardFor="comment"
                key={comment.id}
                avatarUrl={comment.user.avatarUrl ?? ""}
                content={comment.content}
                name={comment.user.name ?? ""}
                authorId={comment.userId}
                commentId={comment.id}
                id={id}
              />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className="text-default-500">Пока нет комментариев</p>
              <p className="text-sm text-default-400 mt-1">Будьте первым, кто оставит комментарий!</p>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}