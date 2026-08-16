import React from 'react'
import { cn } from '../../lib/utils'
import { XIcon } from 'lucide-react'

export function Modal({
  children,
  open,
  onClose,
  className,
  showCloseButton = true,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={cn(
            "relative w-full max-w-lg rounded-lg bg-background p-6 shadow-lg",
            "animate-in fade-in zoom-in duration-300",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

Modal.Header = function ModalHeader({ children, className }) {
  return (
    <div className={cn("mb-4 text-lg font-semibold", className)}>
      {children}
    </div>
  )
}

Modal.Body = function ModalBody({ children, className }) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

Modal.Footer = function ModalFooter({ children, className }) {
  return (
    <div className={cn("mt-6 flex justify-end space-x-4", className)}>
      {children}
    </div>
  )
}