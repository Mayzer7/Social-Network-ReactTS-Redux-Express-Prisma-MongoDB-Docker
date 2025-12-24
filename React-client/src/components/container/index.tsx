import React from 'react'

type Props = {
    children: React.ReactElement[] | React.ReactElement
}

export const Container: React.FC<Props> = ({ children }) => {
  return (
    <div className='flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 lg:mt-10 gap-4 lg:gap-6'>
      {children}
    </div>
  )
}
