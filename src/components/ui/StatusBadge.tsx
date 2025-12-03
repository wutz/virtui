import clsx from 'clsx'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const statusVariants: Record<string, StatusBadgeProps['variant']> = {
  Running: 'success',
  Active: 'success',
  Ready: 'success',
  Bound: 'success',
  Succeeded: 'success',
  Stopped: 'default',
  Pending: 'warning',
  Starting: 'warning',
  Provisioning: 'warning',
  'In Progress': 'warning',
  Failed: 'danger',
  Error: 'danger',
  Terminating: 'danger',
  Unknown: 'info',
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const resolvedVariant = variant || statusVariants[status] || 'default'

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        {
          'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]':
            resolvedVariant === 'default',
          'bg-emerald-500/15 text-emerald-500': resolvedVariant === 'success',
          'bg-yellow-500/15 text-yellow-500': resolvedVariant === 'warning',
          'bg-red-500/15 text-red-500': resolvedVariant === 'danger',
          'bg-blue-500/15 text-blue-500': resolvedVariant === 'info',
        }
      )}
    >
      <span
        className={clsx('h-1.5 w-1.5 rounded-full', {
          'bg-[var(--color-text-muted)]': resolvedVariant === 'default',
          'bg-emerald-500 animate-pulse': resolvedVariant === 'success',
          'bg-yellow-500 animate-pulse': resolvedVariant === 'warning',
          'bg-red-500': resolvedVariant === 'danger',
          'bg-blue-500': resolvedVariant === 'info',
        })}
      />
      {status}
    </span>
  )
}
