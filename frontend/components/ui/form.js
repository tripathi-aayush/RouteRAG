import React from 'react'
import { cn } from '../../lib/utils'

export function Input({
  className,
  type = "text",
  error,
  ...props
}) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500",
        className
      )}
      {...props}
    />
  )
}

export function Label({
  className,
  children,
  required,
  error,
  ...props
}) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error && "text-red-500",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

export function Select({
  className,
  children,
  error,
  ...props
}) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({
  className,
  error,
  ...props
}) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error && "border-red-500",
        className
      )}
      {...props}
    />
  )
}

export function Checkbox({
  className,
  ...props
}) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-input bg-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export function FormGroup({
  className,
  error,
  children,
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}