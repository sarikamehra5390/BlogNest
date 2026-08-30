
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
        px-6
        py-3
        rounded-xl
        ${bgColor}
        ${textColor}
        font-semibold
        shadow-sm shadow-indigo-500/25
        hover:shadow-md
        hover:-translate-y-0.5
        active:scale-95
        transition-all
        duration-300
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
