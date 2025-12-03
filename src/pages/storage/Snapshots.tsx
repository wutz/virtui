import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { useAppStore } from '../../store'

interface Snapshot {
  name: string
  namespace: string
  status: string
  sourcePvc: string
  snapshotClass: string
  restoreSize: string
  createdAt: string
}

export function Snapshots() {
  const { t } = useTranslation()
  const namespace = useAppStore((state) => state.namespace)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    sourcePvc: '',
    snapshotClass: '',
  })

  const fetchSnapshots = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/storage/snapshots?namespace=${namespace}`)
      if (res.ok) {
        const data = await res.json()
        setSnapshots(data)
      }
    } catch (error) {
      console.error('Failed to fetch snapshots:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSnapshots()
  }, [namespace])

  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/storage/snapshots?namespace=${namespace}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowCreateModal(false)
        setFormData({ name: '', sourcePvc: '', snapshotClass: '' })
        fetchSnapshots()
      }
    } catch (error) {
      console.error('Failed to create snapshot:', error)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      await fetch(`/api/storage/snapshots/${name}?namespace=${namespace}`, { method: 'DELETE' })
      fetchSnapshots()
    } catch (error) {
      console.error('Failed to delete snapshot:', error)
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (snap: Snapshot) => (
        <span className="font-mono font-medium text-emerald-500">{snap.name}</span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (snap: Snapshot) => <StatusBadge status={snap.status} />,
    },
    {
      key: 'sourcePvc',
      header: t('storage.snapshots.sourcePvc'),
      render: (snap: Snapshot) => <span className="font-mono">{snap.sourcePvc}</span>,
    },
    {
      key: 'snapshotClass',
      header: t('storage.snapshots.snapshotClass'),
      render: (snap: Snapshot) => (
        <span className="text-[var(--color-text-secondary)]">{snap.snapshotClass}</span>
      ),
    },
    {
      key: 'restoreSize',
      header: t('storage.snapshots.restoreSize'),
      render: (snap: Snapshot) => <span className="font-mono">{snap.restoreSize}</span>,
    },
    {
      key: 'createdAt',
      header: t('common.createdAt'),
      render: (snap: Snapshot) => (
        <span className="text-[var(--color-text-secondary)]">
          {new Date(snap.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (snap: Snapshot) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(snap.name)}
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
        title={t('storage.snapshots.title')}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchSnapshots}>
              <RefreshCw className="h-4 w-4" />
              {t('common.refresh')}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              {t('storage.snapshots.create')}
            </Button>
          </div>
        }
      />

      <Table
        columns={columns}
        data={snapshots}
        loading={loading}
        emptyMessage={t('common.noData')}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('storage.snapshots.create')}
      >
        <div className="grid gap-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="my-snapshot"
          />
          <Input
            label={t('storage.snapshots.sourcePvc')}
            value={formData.sourcePvc}
            onChange={(e) => setFormData({ ...formData, sourcePvc: e.target.value })}
            placeholder="my-pvc"
          />
          <Input
            label={t('storage.snapshots.snapshotClass')}
            value={formData.snapshotClass}
            onChange={(e) => setFormData({ ...formData, snapshotClass: e.target.value })}
            placeholder="csi-snapshot-class (optional)"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.sourcePvc}>
              {t('common.create')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
