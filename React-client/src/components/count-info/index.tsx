import React from 'react'
import { Card, CardBody } from "@heroui/react"

type Props = {
  count: number;
  title: string;
}

export const CountInfo: React.FC<Props> = ({
  count,
  title,
}) => {
  return (
    <Card className="flex-1">
      <CardBody className="flex flex-col items-center justify-center gap-2 p-4">
        <span className="text-3xl font-bold text-primary">{count}</span>
        <span className="text-sm text-default-500 font-medium">{title}</span>
      </CardBody>
    </Card>
  )
}