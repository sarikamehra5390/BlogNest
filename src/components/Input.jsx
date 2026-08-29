import React, { useId, useState } from "react";

const Input = React.forwardRef(function Input(
  {
    label,
    type = "text",
    className = "",
    ...props
  },
  ref
) {
  const id = useId();
  const [fileName, setFileName] = useState("");

  // Styles for normal inputs
  const inputStyle = `
    w-full
    px-4
    py-3
    mt-1
    rounded-xl
    border
    border-slate-300
    bg-white
    dark:bg-slate-800
    text-slate-800
    dark:text-white
    placeholder:text-slate-400
    dark: placeholder:text-slate-500
    shadow-sm
    transition-all
    duration-300
    focus:border-blue-500
    focus:ring-4
    focus:ring-blue-100
    focus:shadow-md
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      {type === "file" ? (
        <label
          htmlFor={id}
          className="
            flex
            flex-col
            items-center
            justify-center
            w-full
            h-52
            border-2
            border-dashed
            border-slate-300
            rounded-2xl
            bg-slate-50
            cursor-pointer
            hover:border-blue-500
            hover:bg-blue-50
            transition-all
            duration-300
          "
        >
          {/* Upload Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-14 h-14 text-blue-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 014-4h1l2-3h4l2 3h1a4 4 0 014 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z"
            />
          </svg>

          <p className="text-lg font-semibold text-slate-700">
            Upload Featured Image
          </p>

          <p className="text-sm text-slate-500 mt-2">
            {fileName || "PNG, JPG, JPEG or GIF"}
          </p>

          <input
            id={id}
            type={type}
            className="hidden"
            ref={ref}
            {...props}
            onChange={(e) => {
              setFileName(e.target.files?.[0]?.name || "");

              // Keep React Hook Form working
              if (props.onChange) {
                props.onChange(e);
              }
            }}
          />
        </label>
      ) : (
        <input
          id={id}
          type={type}
          className={inputStyle}
          ref={ref}
          {...props}
        />
      )}
    </div>
  );
});

export default Input;