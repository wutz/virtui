import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, RefreshCw, Globe } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'

interface EIPItem {
  name: string
  status: string
  ip: string
  v6ip: string
  natGw: string
  qosPolicy: string
  createdAt: string
}

export function EIP() {
  const { t } = useTranslation()
  const [eips, setEips] = useState<EIPItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    v4ip: '',
    v6ip: '',
    natGw: '',
    qosPolicy: '',
  })

  const fetchEips = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/network/eips')
      if (res.ok) {
        const data = await res.json()
        setEips(data)
      }
    } catch (error) {
      console.error('Failed to fetch EIPs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEips()
  }, [])

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/network/eips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowCreateModal(false)
        setFormData({ name: '', v4ip: '', v6ip: '', natGw: '', qosPolicy: '' })
        fetchEips()
      }
    } catch (error) {
      console.error('Failed to create EIP:', error)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      await fetch(`/api/network/eips/${name}`, { method: 'DELETE' })
      fetchEips()
    } catch (error) {
      console.error('Failed to delete EIP:', error)
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (eip: EIPItem) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-500" />
          <span className="font-mono font-medium text-emerald-500">{eip.name}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (eip: EIPItem) => <StatusBadge status={eip.status} />,
    },
    {
      key: 'ip',
      header: t('network.eip.ip'),
      render: (eip: EIPItem) => (
        <span className="font-mono bg-[var(--color-bg-tertiary)] px-2 py-1 rounded">
          {eip.ip}
        </span>
      ),
    },
    {
      key: 'v6ip',
      header: t('network.eip.v6ip'),
      render: (eip: EIPItem) => (
        <span className="font-mono text-[var(--color-text-secondary)]">{eip.v6ip}</span>
      ),
    },
    {
      key: 'natGw',
      header: t('network.eip.natGw'),
      render: (eip: EIPItem) => (
        <span className="text-[var(--color-text-secondary)]">{eip.natGw}</span>
      ),
    },
    {
      key: 'createdAt',
      header: t('common.createdAt'),
      render: (eip: EIPItem) => (
        <span className="text-[var(--color-text-secondary)]">
          {new Date(eip.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (eip: EIPItem) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(eip.name)}
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
        title={t('network.eip.title')}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchEips}>
              <RefreshCw className="h-4 w-4" />
              {t('common.refresh')}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              {t('network.eip.create')}
            </Button>
          </div>
        }
      />

      <Table columns={columns} data={eips} loading={loading} emptyMessage={t('common.noData')} />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('network.eip.create')}
      >
        <div className="grid gap-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="my-eip"
          />
          <Input
            label={t('network.eip.ip')}
            value={formData.v4ip}
            onChange={(e) => setFormData({ ...formData, v4ip: e.target.value })}
            placeholder="10.0.0.1 (optional, auto-assign if empty)"
          />
          <Input
            label={t('network.eip.natGw')}
            value={formData.natGw}
            onChange={(e) => setFormData({ ...formData, natGw: e.target.value })}
            placeholder="vpc-nat-gw"
          />
          <Input
            label={t('network.eip.qosPolicy')}
            value={formData.qosPolicy}
            onChange={(e) => setFormData({ ...formData, qosPolicy: e.target.value })}
            placeholder="qos-policy (optional)"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.natGw}>
              {t('common.create')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

