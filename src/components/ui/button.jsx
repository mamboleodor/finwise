import * as React from "react"

const Button = React.forwardRef(({ className, ...props }, ref) => (
  <button
    className={`inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 ${className}`}
    ref={ref}
    {...props}
  />
))
Button.displayName = "Button"

export { Button }