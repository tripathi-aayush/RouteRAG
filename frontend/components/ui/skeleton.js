import { cn } from "../../lib/utils"

export function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

export function SkeletonText({
  className,
  ...props
}) {
  return (
    <Skeleton
      className={cn("h-4 w-[200px]", className)}
      {...props}
    />
  )
}

export function SkeletonCard({
  className,
  ...props
}) {
  return (
    <Skeleton
      className={cn("h-[200px] w-full", className)}
      {...props}
    />
  )
}

export function SkeletonAvatar({
  className,
  ...props
}) {
  return (
    <Skeleton
      className={cn("h-12 w-12 rounded-full", className)}
      {...props}
    />
  )
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="grid grid-cols-4 gap-4 py-4">
        {Array(columns).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-8" />
        ))}
      </div>
      {Array(rows).fill(0).map((_, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-4 gap-4 py-4">
          {Array(columns).fill(0).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-6" />
          ))}
        </div>
      ))}
    </div>
  )
}