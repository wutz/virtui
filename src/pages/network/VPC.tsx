import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, RefreshCw, Network } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'

interface VPCItem {
  name: string
  status: string
  defaultSubnet: string
  subnets: string[]
  subnetCount: number
  enableExternal: boolean
  createdAt: string
}

export function VPC() {
  const { t } = useTranslation()
  const [vpcs, setVpcs] = useState<VPCItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    enableExternal: false,
    namespaces: '',
  })

  const fetchVpcs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/network/vpcs')
      if (res.ok) {
        const data = await res.json()
        setVpcs(data)
      }
    } catch (error) {
      console.error('Failed to fetch VPCs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVpcs()
  }, [])

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/network/vpcs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          namespaces: formData.namespaces ? formData.namespaces.split(',').map((s) => s.trim()) : [],
        }),
      })
      if (res.ok) {
        setShowCreateModal(false)
        setFormData({ name: '', enableExternal: false, namespaces: '' })
        fetchVpcs()
      }
    } catch (error) {
      console.error('Failed to create VPC:', error)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      await fetch(`/api/network/vpcs/${name}`, { method: 'DELETE' })
      fetchVpcs()
    } catch (error) {
      console.error('Failed to delete VPC:', error)
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (vpc: VPCItem) => (
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-emerald-500" />
          <span className="font-mono font-medium text-emerald-500">{vpc.name}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (vpc: VPCItem) => <StatusBadge status={vpc.status} />,
    },
    {
      key: 'defaultSubnet',
      header: t('network.vpc.defaultSubnet'),
      render: (vpc: VPCItem) => <span className="font-mono">{vpc.defaultSubnet}</span>,
    },
    {
      key: 'subnetCount',
      header: t('network.vpc.subnetCount'),
      render: (vpc: VPCItem) => (
        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-medium">
          {vpc.subnetCount}
        </span>
      ),
    },
    {
      key: 'enableExternal',
      header: t('network.vpc.enableExternal'),
      render: (vpc: VPCItem) => (
        <span
          className={
            vpc.enableExternal ? 'text-emerald-500' : 'text-[var(--color-text-muted)]'
          }
        >
          {vpc.enableExternal ? '✓' : '✗'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: t('common.createdAt'),
      render: (vpc: VPCItem) => (
        <span className="text-[var(--color-text-secondary)]">
          {new Date(vpc.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (vpc: VPCItem) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(vpc.name)}
          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('network.vpc.title')}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchVpcs}>
              <RefreshCw className="h-4 w-4" />
              {t('common.refresh')}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              {t('network.vpc.create')}
            </Button>
          </div>
        }
      />

      <Table columns={columns} data={vpcs} loading={loading} emptyMessage={t('common.noData')} />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('network.vpc.create')}
      >
        <div className="grid gap-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="my-vpc"
          />
          <Input
            label={t('network.vpc.namespaces')}
            value={formData.namespaces}
            onChange={(e) => setFormData({ ...formData, namespaces: e.target.value })}
            placeholder="ns1, ns2, ns3 (comma separated)"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enableExternal}
              onChange={(e) => setFormData({ ...formData, enableExternal: e.target.checked })}
              className="h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-bg-primary)] text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-sm">{t('network.vpc.enableExternal')}</span>
          </label>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name}>
              {t('common.create')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

