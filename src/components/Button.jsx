import React from "react";

function Button({
  children,
  type = "button",
  bgColor = "bg-gradient-to-r from-blue-600 to-indigo-600",
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
        shadow-md
        hover:shadow-lg
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