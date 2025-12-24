import React from 'react'

type Props = {
  title: string;
  info?: string;
}

export const ProfileInfo: React.FC<Props> = ({
  title,
  info,
}) => {

  if (!info) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 py-2">
      <span className="text-default-500 font-medium text-sm min-w-[140px]">{title}</span>
      <span className="text-default-900 font-semibold break-words">{info}</span>
    </div>
  )
}