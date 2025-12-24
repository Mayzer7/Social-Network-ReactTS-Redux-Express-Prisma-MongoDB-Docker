import React from "react"
import { Control, useController } from "react-hook-form"
import { Input as NextInput } from "@heroui/react"

type Props = {
    name: string
    label: string
    placeholder?: string
    type?: string
    control: Control<any>
    required?: string
    endContent?: React.ReactNode
}

export const Input: React.FC<Props> = ({
    name,
    label,
    placeholder,
    type,
    control,
    required = "",
    endContent,
}) => {
    const {
        field,
        fieldState: { invalid },
        formState: { errors },
    } = useController({
        name,
        control,
        rules: { required },
    })

    return (
        <NextInput
            id={name}
            label={label}
            type={type}
            placeholder={placeholder}
            value={field.value}
            name={field.name}
            isInvalid={invalid}
            onChange={field.onChange}
            onBlur={field.onBlur}
            errorMessage={`${errors[name]?.message ?? ""}`}
            endContent={endContent}
        />
    )
}