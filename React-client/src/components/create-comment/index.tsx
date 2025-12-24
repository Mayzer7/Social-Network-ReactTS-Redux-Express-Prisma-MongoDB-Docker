import { Button, Textarea, Card, CardBody } from "@heroui/react"
import { IoMdCreate } from "react-icons/io"
import { useForm, Controller } from "react-hook-form"
import { ErrorMessage } from "../error-message"
import { useCreateCommentMutation } from "../../app/services/commentsApi"
import { useParams } from "react-router-dom"

export const CreateComment = () => {
  const { id } = useParams<{ id: string }>()
  const [createComment, { isLoading }] = useCreateCommentMutation()

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm()

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (id) {
        await createComment({ content: data.comment, postId: id }).unwrap()
        reset()
      }
    } catch (error) {
      console.log("err", error)
    }
  })

  const error = errors?.comment?.message as string

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <Controller
            name="comment"
            control={control}
            defaultValue=""
            rules={{
              required: "Поле обязательно",
            }}
            render={({ field }) => (
              <Textarea
                {...field}
                labelPlacement="outside"
                placeholder="Напишите свой ответ"
                minRows={2}
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
              isLoading={isLoading}
              size="lg"
            >
              Ответить
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}