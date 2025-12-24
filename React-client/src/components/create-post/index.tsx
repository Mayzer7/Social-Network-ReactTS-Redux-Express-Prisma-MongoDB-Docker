import { Button, Textarea, Card, CardBody } from "@heroui/react"
import { IoMdCreate } from "react-icons/io"
import {
  useCreatePostMutation,
  useLazyGetAllPostsQuery,
} from "../../app/services/postsApi"
import { useForm, Controller } from "react-hook-form"
import { ErrorMessage } from "../error-message"

export const CreatePost = () => {
  const [createPost] = useCreatePostMutation()
  const [triggerGetAllPosts] = useLazyGetAllPostsQuery()
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm()

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createPost({ content: data.post }).unwrap()
      setValue("post", "")
      await triggerGetAllPosts().unwrap()
    } catch (error) {
      console.log("err", error)
    }
  })
  const error = errors?.post?.message as string

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <Controller
            name="post"
            control={control}
            defaultValue=""
            rules={{
              required: "Обязательное поле",
            }}
            render={({ field }) => (
              <Textarea
                {...field}
                labelPlacement="outside"
                placeholder="О чем думаете?"
                minRows={3}
                variant="bordered"
              />
            )}
          />
          {errors && <ErrorMessage error={error} />}
          <div className="flex justify-end">
            <Button
              color="primary"
              endContent={<IoMdCreate />}
              type="submit"
              size="lg"
            >
              Опубликовать
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}