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
      className="flex flex-row justify-start items-center gap-1  text-xs px-3 py-2 bg-bg rounded-lg hover:bg-mg hover:border-mg hover:cursor-pointer duration-75 ease-in-out"
    >
      {children}
    </button>
  )
}

export default Button
