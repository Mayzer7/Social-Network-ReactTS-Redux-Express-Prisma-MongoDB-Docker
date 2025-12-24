import React from "react"
import { IconType } from "react-icons"

type Props = {
  count: number
  Icon: IconType
}

export const MetaInfo: React.FC<Props> = ({ count, Icon }) => {
  return (
    <div className="flex items-center gap-2 cursor-pointer group">
      {count > 0 && (
        <p className="font-semibold text-default-500 text-sm group-hover:text-primary transition-colors">
          {count}
        </p>
      )}
      <div className="text-default-400 text-xl group-hover:text-primary group-hover:scale-110 transition-all duration-200">
        <Icon />
      </div>
    </div>
  )
}