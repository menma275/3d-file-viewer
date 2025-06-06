function Button({
  onClick,
  isFull = true,
  isFill = true,
  children
}: {
  onClick?: React.MouseEventHandler<HTMLElement>
  isFull?: boolean
  isFill?: boolean
  children: React.ReactNode
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`flex flex-row ${isFull ? 'w-full' : 'w-fit'}  ${isFill ? 'bg-mg hover:bg-accent hover:text-bg hover:border-mg ' : 'bg-transparent text-bg hover:bg-mg hover:text-secondary'} px-3 py-2 justify-center items-center gap-1 text-xs  rounded-lg  hover:cursor-pointer duration-300 ease-in-out`}
    >
      {children}
    </button>
  )
}

export default Button
