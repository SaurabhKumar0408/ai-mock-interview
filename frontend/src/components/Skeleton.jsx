const SkeletonBox = ({ className }) => (
    <div className={`bg-gray-800 animate-pulse rounded-xl ${className}`} />
)

// ── Dashboard Skeleton ──
export const DashboardSkeleton = () => (
    <div className="max-w-5xl mx-auto px-6 py-10">

        {/* banner skeleton */}
        <SkeletonBox className="h-32 mb-10" />

        {/* stats row skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-10">
            <SkeletonBox className="h-24" />
            <SkeletonBox className="h-24" />
            <SkeletonBox className="h-24" />
        </div>

        {/* past sessions skeleton */}
        <SkeletonBox className="h-6 w-40 mb-4" />
        <div className="space-y-3">
            <SkeletonBox className="h-20" />
            <SkeletonBox className="h-20" />
            <SkeletonBox className="h-20" />
        </div>
    </div>
)

// ── Feedback Report Skeleton ──
export const FeedbackSkeleton = () => (
    <div className="max-w-3xl mx-auto px-6 py-10">

        {/* header skeleton */}
        <SkeletonBox className="h-8 w-48 mb-2" />
        <SkeletonBox className="h-4 w-72 mb-8" />

        {/* overall score skeleton */}
        <SkeletonBox className="h-48 mb-8" />

        {/* questions skeleton */}
        <SkeletonBox className="h-6 w-48 mb-4" />
        <div className="space-y-4">
            <SkeletonBox className="h-64" />
            <SkeletonBox className="h-64" />
            <SkeletonBox className="h-64" />
        </div>
    </div>
)