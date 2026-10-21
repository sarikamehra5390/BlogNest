
function Button({
  children,
  type = "button",
  bgColor = "bg-indigo-600 hover:bg-indigo-700",
  textColor = "text-white",
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`
        inline-flex min-h-11 items-center justify-center gap-2
        px-5 py-2.5 rounded-md
        ${bgColor}
        ${textColor}
        font-semibold
        active:scale-95
        transition-colors
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
