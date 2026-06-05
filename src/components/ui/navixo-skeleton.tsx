import { cn } from "./utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'line' | 'card' | 'avatar' | 'ring' | 'chart';
  shimmer?: boolean;
}

/**
 * Enhanced Skeleton component for NAVIXO with shimmer animation
 * Variants: line, card, avatar, ring, chart
 */
export function NavixoSkeleton({ 
  className, 
  variant = 'line',
  shimmer = true,
  ...props 
}: SkeletonProps) {
  return (
    <div
      data-slot="navixo-skeleton"
      className={cn(
        "bg-white/5 rounded-lg relative overflow-hidden",
        shimmer && "animate-skeleton",
        variant === 'line' && "h-4 w-full",
        variant === 'card' && "h-32 w-full rounded-xl",
        variant === 'avatar' && "h-12 w-12 rounded-full",
        variant === 'ring' && "h-40 w-40 rounded-full",
        variant === 'chart' && "h-48 w-full rounded-xl",
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton for Stat Cards (Weekly Streak, metrics)
 */
export function SkeletonStatCard() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <NavixoSkeleton variant="avatar" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <NavixoSkeleton variant="line" className="h-3 w-24" />
          <NavixoSkeleton variant="line" className="h-5 w-16" />
        </div>
      </div>
      <NavixoSkeleton variant="line" className="h-2 w-full" />
    </div>
  );
}

/**
 * Skeleton for Progress Ring (Mastery indicator)
 */
export function SkeletonProgressRing() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <NavixoSkeleton variant="ring" className="w-32 h-32 lg:w-40 lg:h-40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <NavixoSkeleton variant="line" className="h-7 w-16 mb-1" />
          <NavixoSkeleton variant="line" className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Activity Feed Items
 */
export function SkeletonActivityItem() {
  return (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
      <NavixoSkeleton variant="avatar" className="w-8 h-8 mt-1" />
      <div className="flex-1 space-y-2">
        <NavixoSkeleton variant="line" className="h-3 w-3/4" />
        <NavixoSkeleton variant="line" className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Charts (Weekly Time, analytics)
 */
export function SkeletonChart() {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-2 h-32">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <NavixoSkeleton 
              variant="line" 
              className="w-full rounded-lg" 
              style={{ height: `${Math.random() * 60 + 40}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {[...Array(7)].map((_, i) => (
          <NavixoSkeleton key={i} variant="line" className="h-2 w-8" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Roadmap Progress Card
 */
export function SkeletonRoadmapCard() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <NavixoSkeleton variant="line" className="h-3 w-20" />
          <NavixoSkeleton variant="line" className="h-4 w-32" />
        </div>
        <div className="space-y-2 text-right">
          <NavixoSkeleton variant="line" className="h-3 w-16" />
          <NavixoSkeleton variant="line" className="h-4 w-20" />
        </div>
      </div>
      <NavixoSkeleton variant="line" className="h-2 w-full rounded-full" />
      <div className="flex gap-2 pt-2">
        <NavixoSkeleton variant="line" className="h-9 flex-1 rounded-lg" />
        <NavixoSkeleton variant="line" className="h-9 flex-1 rounded-lg" />
      </div>
    </div>
  );
}
