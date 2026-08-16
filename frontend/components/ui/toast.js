import React, { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '../../lib/utils'
import { XIcon } from 'lucide-react'

const ToastContext = createContext({})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'default', title, message, duration = 5000 }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, type, title, message }])
    if (duration) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 m-4 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function Toast({ type, title, message, onClose }) {
  const variants = {
    default: 'bg-background text-foreground',
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  }

  return (
    <div
      className={cn(
        'min-w-[300px] rounded-lg shadow-lg animate-in slide-in-from-right-full fade-in',
        variants[type]
      )}
    >
      <div className="flex items-start gap-2 p-4">
        <div className="flex-1">
          {title && (
            <div className="font-semibold">{title}</div>
          )}
          {message && (
            <div className="text-sm opacity-90">{message}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}