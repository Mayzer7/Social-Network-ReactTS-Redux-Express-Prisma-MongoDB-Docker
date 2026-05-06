import { Button, Textarea, Card, CardBody } from "@heroui/react"
import { IoMdCreate } from "react-icons/io"
import { MdImage } from "react-icons/md"
import { IoClose } from "react-icons/io5"
import {
  useCreatePostMutation,
  useLazyGetAllPostsQuery,
} from "../../app/services/postsApi"
import { useForm, Controller } from "react-hook-form"
import { ErrorMessage } from "../error-message"
import React, { useCallback, useRef, useState } from "react"

export const CreatePost = () => {
  const [createPost] = useCreatePostMutation()
  const [triggerGetAllPosts] = useLazyGetAllPostsQuery()
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((newFiles: File[]) => {
    setSelectedFiles((prev) => {
      const remaining = 5 - prev.length
      return [...prev, ...newFiles.slice(0, remaining)]
    })
    setPreviews((prev) => {
      const remaining = 5 - prev.length
      return [...prev, ...newFiles.slice(0, remaining).map((f) => URL.createObjectURL(f))]
    })
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLFormElement>) => {
      if (selectedFiles.length >= 5) return
      const items = Array.from(e.clipboardData.items) as DataTransferItem[]
      const imageFiles = items
        .filter((item) => item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null)
      if (imageFiles.length > 0) addFiles(imageFiles)
    },
    [selectedFiles.length, addFiles],
  )

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData()
      formData.append("content", data.post)
      selectedFiles.forEach((file) => formData.append("images", file))

      await createPost(formData).unwrap()

      setValue("post", "")
      previews.forEach((url) => URL.revokeObjectURL(url))
      setSelectedFiles([])
      setPreviews([])

      await triggerGetAllPosts().unwrap()
    } catch (error) {
      console.log("err", error)
    }
  })

  const error = errors?.post?.message as string

  return (
    <Card className="w-full">
      <CardBody className="p-4">
        <form className="flex flex-col gap-4" onSubmit={onSubmit} onPaste={handlePaste}>
          <Controller
            name="post"
            control={control}
            defaultValue=""
            rules={{ required: "Обязательное поле" }}
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
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {previews.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`preview-${index}`}
                    className="w-24 h-24 object-cover rounded-lg border border-default-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-danger text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-danger-600"
                  >
                    <IoClose size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors && <ErrorMessage error={error} />}
          <div className="flex justify-between items-center">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="flat"
                color="primary"
                size="sm"
                isDisabled={selectedFiles.length >= 5}
                onClick={() => fileInputRef.current?.click()}
                startContent={<MdImage className="text-lg" />}
              >
                {selectedFiles.length > 0
                  ? `Фото (${selectedFiles.length}/5)`
                  : "Добавить фото"}
              </Button>
            </div>
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