function Button({
  onClick,
  children
}: {
  onClick?: React.MouseEventHandler<HTMLElement>
  children: React.ReactNode
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="flex flex-row w-full justify-center items-center gap-1  text-xs px-3 py-2 bg-mg rounded-lg hover:bg-accent hover:border-mg hover:cursor-pointer duration-300 ease-in-out"
    >
      {children}
    </button>
  )
}

export default Button
