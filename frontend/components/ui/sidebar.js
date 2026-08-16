import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { cn } from '../../lib/utils'
import { HomeIcon, MessageCircleIcon, BarChart2Icon, ClockIcon, FlaskConicalIcon } from 'lucide-react'

const navigation = [
  { name: 'Home',       href: '/',           icon: HomeIcon },
  { name: 'Chat',       href: '/chat',        icon: MessageCircleIcon },
  { name: 'Analytics',  href: '/analytics',   icon: BarChart2Icon },
  { name: 'Evaluation', href: '/evaluation',  icon: FlaskConicalIcon },
  { name: 'History',    href: '/history',     icon: ClockIcon },
]

export function Sidebar() {
  const router = useRouter()

  return (
    <div className="flex h-screen flex-col border-r border-border bg-background w-[220px] shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-6 border-b border-border">
        <span className="text-sm font-semibold tracking-tight">RouteRAG</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-foreground text-background font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}>
                <item.icon className="h-3.5 w-3.5 shrink-0" />
                {item.name}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-[11px] text-muted-foreground">RouteRAG © 2026</p>
      </div>
    </div>
  )
}
