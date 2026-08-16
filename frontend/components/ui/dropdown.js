import React, { useState, useRef, useEffect } from 'react'
import { cn } from '../../lib/utils'
import { ChevronDownIcon } from 'lucide-react'

export function Dropdown({
  trigger,
  children,
  className,
  align = 'bottom-left',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const alignmentClasses = {
    'bottom-left': 'top-full left-0',
    'bottom-right': 'top-full right-0',
    'top-left': 'bottom-full left-0',
    'top-right': 'bottom-full right-0',
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button className="flex items-center gap-1">
            Menu <ChevronDownIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95',
            alignmentClasses[align],
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

Dropdown.Item = function DropdownItem({
  children,
  className,
  onClick,
  disabled = false,
}) {
  return (
    <button
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

Dropdown.Separator = function DropdownSeparator({ className }) {
  return (
    <div className={cn('-mx-1 my-1 h-px bg-muted', className)} />
  )
}