import React, {useId} from 'react'

function Select({
    options,
    label,
    className = "",
    ...props
}, ref) {
    const id = useId()
  return (
    <div className='w-full '>
        {label && <label htmlFor={id}
className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
>
            {label}</label>}
        <select
        {...props}
        id={id}
        ref={ref}
        className={`
w-full
px-4
py-3
mt-1
rounded-xl
border
border-slate-200
dark:border-slate-600
bg-white
dark:bg-slate-800
text-slate-700
dark:text-white
shadow-sm
transition-all
duration-300
focus:border-indigo-500
focus:ring-4
focus:ring-indigo-500/15
focus:shadow-md
${className}
`}
        >
            {options?.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))  }
        </select>
    </div>
  )
}

export default React.forwardRef(Select)
