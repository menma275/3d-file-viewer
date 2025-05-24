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
      className="flex flex-row justify-center items-center gap-1 bg-mg/10  backdrop-blur-lg text-accent font-bold px-4 py-2 rounded-xl border border-[0.5px] border-bdr text-xs hover:cursor-pointer"
    >
      {children}
    </button>
  )
}

export default Button
