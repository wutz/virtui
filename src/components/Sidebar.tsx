import { NavLink, useLocation } from 'react-router-dom'
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
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Cpu,
  Database,
  Wifi,
} from 'lucide-react'
import { useAppStore } from '../store'
import clsx from 'clsx'
import { useState } from 'react'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  path: string
}

interface NavGroup {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  items: NavItem[]
}

export function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)

  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    'compute',
    'storage',
    'network',
  ])

  const navGroups: NavGroup[] = [
    {
      id: 'compute',
      icon: Cpu,
      label: t('nav.compute'),
      items: [{ icon: Server, label: t('nav.instances'), path: '/compute/instances' }],
    },
    {
      id: 'storage',
      icon: Database,
      label: t('nav.storage'),
      items: [
        { icon: HardDrive, label: t('nav.blockStorage'), path: '/storage/block' },
        { icon: Camera, label: t('nav.snapshots'), path: '/storage/snapshots' },
        { icon: FolderOpen, label: t('nav.filesystem'), path: '/storage/filesystem' },
      ],
    },
    {
      id: 'network',
      icon: Wifi,
      label: t('nav.network'),
      items: [
        { icon: Network, label: t('nav.vpc'), path: '/network/vpc' },
        { icon: Globe, label: t('nav.eip'), path: '/network/eip' },
        { icon: ArrowLeftRight, label: t('nav.nat'), path: '/network/nat' },
        { icon: Scale, label: t('nav.loadbalancer'), path: '/network/lb' },
      ],
    },
  ]

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    )
  }

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => location.pathname === item.path)
  }

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
          <div key={group.id} className="mb-1">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.id)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isGroupActive(group)
                  ? 'text-emerald-500'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
                'hover:bg-[var(--color-bg-tertiary)]'
              )}
            >
              <group.icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{group.label}</span>
                  {expandedGroups.includes(group.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </>
              )}
            </button>

            {/* Group Items */}
            {!sidebarCollapsed && expandedGroups.includes(group.id) && (
              <div className="ml-4 mt-1 flex flex-col gap-1 border-l border-[var(--color-border)] pl-4 animate-slide-in">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-500 font-medium'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
