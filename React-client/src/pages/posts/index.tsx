import { Card } from "../../components/card"
import { CreatePost } from "../../components/create-post"
import { useGetAllPostsQuery } from "../../app/services/postsApi"

export const Posts = () => {
  const { data, isLoading } = useGetAllPostsQuery()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-default-500">Загрузка постов...</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 w-full">
        <CreatePost />
      </div>
      {data && data.length > 0 ? (
        data.map(
          ({
            content,
            author,
            id,
            authorId,
            comments,
            likes,
            likedByUser,
            createdAt,
          }) => (
            <Card
              key={id}
              avatarUrl={author.avatarUrl ?? ""}
              content={content}
              name={author.name ?? ""}
              likesCount={likes.length}
              commentsCount={comments.length}
              authorId={authorId}
              id={id}
              likedByUser={likedByUser}
              createdAt={createdAt}
              cardFor="post"
            />
          ),
        )
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-xl font-semibold text-default-500 mb-2">Пока нет постов</p>
            <p className="text-default-400">Создайте первый пост выше!</p>
          </div>
        </Card>
      )}
    </>
  )
}