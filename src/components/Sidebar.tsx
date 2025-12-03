import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Server,
  HardDrive,
  Camera,
  FolderOpen,
  Network,
  Globe,
  ArrowLeftRight,
  Scale,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { useAppStore } from '../store'
import clsx from 'clsx'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  path: string
}

interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export function Sidebar() {
  const { t } = useTranslation()
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)

  const navGroups: NavGroup[] = [
    {
      id: 'compute',
      label: t('nav.compute'),
      items: [{ icon: Server, label: t('nav.instances'), path: '/compute/instances' }],
    },
    {
      id: 'storage',
      label: t('nav.storage'),
      items: [
        { icon: HardDrive, label: t('nav.blockStorage'), path: '/storage/block' },
        { icon: Camera, label: t('nav.snapshots'), path: '/storage/snapshots' },
        { icon: FolderOpen, label: t('nav.filesystem'), path: '/storage/filesystem' },
      ],
    },
    {
      id: 'network',
      label: t('nav.network'),
      items: [
        { icon: Network, label: t('nav.vpc'), path: '/network/vpc' },
        { icon: Globe, label: t('nav.eip'), path: '/network/eip' },
        { icon: ArrowLeftRight, label: t('nav.nat'), path: '/network/nat' },
        { icon: Scale, label: t('nav.loadbalancer'), path: '/network/lb' },
      ],
    },
  ]

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 z-40 h-screen border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]/95 backdrop-blur-xl shadow-lg transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold text-sm">
              V
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              VirtUI
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2 overflow-y-auto h-[calc(100vh-4rem)]">
        {navGroups.map((group) => (
          <div key={group.id} className="mb-4">
            {/* Group Header - 仅作为分类标题 */}
            {!sidebarCollapsed && (
              <div className="px-3 py-2 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)]">
                  {group.label}
                </span>
              </div>
            )}

            {/* Group Items */}
            <div className={clsx('flex flex-col gap-1', !sidebarCollapsed && 'ml-0')}>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center rounded-lg text-sm transition-all duration-200',
                      sidebarCollapsed
                        ? 'justify-center px-3 py-2'
                        : 'gap-3 px-3 py-2',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-500 font-medium'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                    )
                  }
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className={clsx('flex-shrink-0', sidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
