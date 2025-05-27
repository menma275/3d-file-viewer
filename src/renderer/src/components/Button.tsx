function Button({
  onClick,
  isFull = true,
  children
}: {
  onClick?: React.MouseEventHandler<HTMLElement>
  isFull?: boolean
  children: React.ReactNode
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`flex flex-row ${isFull ? 'w-full' : 'w-fit'}  justify-center items-center gap-1  text-xs px-3 py-2 bg-mg rounded-lg hover:bg-accent hover:border-mg hover:cursor-pointer duration-300 ease-in-out`}
    >
      {children}
    </button>
  )
}

export default Button
