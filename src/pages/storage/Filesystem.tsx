import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, RefreshCw } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useAppStore } from '../../store'

interface PVC {
  name: string
  namespace: string
  status: string
  size: string
  accessModes: string
  storageClass: string
  volumeName: string
  createdAt: string
}

export function Filesystem() {
  const { t } = useTranslation()
  const namespace = useAppStore((state) => state.namespace)
  const [pvcs, setPvcs] = useState<PVC[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    size: '10Gi',
    accessMode: 'ReadWriteOnce',
    storageClass: '',
  })

  const fetchPvcs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/storage/filesystems?namespace=${namespace}`)
      if (res.ok) {
        const data = await res.json()
        setPvcs(data)
      }
    } catch (error) {
      console.error('Failed to fetch PVCs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPvcs()
  }, [namespace])

  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/storage/filesystems?namespace=${namespace}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowCreateModal(false)
        setFormData({ name: '', size: '10Gi', accessMode: 'ReadWriteOnce', storageClass: '' })
        fetchPvcs()
      }
    } catch (error) {
      console.error('Failed to create PVC:', error)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      await fetch(`/api/storage/filesystems/${name}?namespace=${namespace}`, { method: 'DELETE' })
      fetchPvcs()
    } catch (error) {
      console.error('Failed to delete PVC:', error)
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (pvc: PVC) => (
        <span className="font-mono font-medium text-emerald-500">{pvc.name}</span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (pvc: PVC) => <StatusBadge status={pvc.status} />,
    },
    {
      key: 'size',
      header: t('storage.filesystem.size'),
      render: (pvc: PVC) => <span className="font-mono">{pvc.size}</span>,
    },
    {
      key: 'accessModes',
      header: t('storage.filesystem.accessMode'),
      render: (pvc: PVC) => (
        <span className="text-[var(--color-text-secondary)]">{pvc.accessModes}</span>
      ),
    },
    {
      key: 'storageClass',
      header: t('storage.filesystem.storageClass'),
      render: (pvc: PVC) => (
        <span className="text-[var(--color-text-secondary)]">{pvc.storageClass}</span>
      ),
    },
    {
      key: 'volumeName',
      header: t('storage.filesystem.volumeName'),
      render: (pvc: PVC) => <span className="font-mono text-xs">{pvc.volumeName}</span>,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (pvc: PVC) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(pvc.name)}
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
        title={t('storage.filesystem.title')}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchPvcs}>
              <RefreshCw className="h-4 w-4" />
              {t('common.refresh')}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              {t('storage.filesystem.create')}
            </Button>
          </div>
        }
      />

      <Table columns={columns} data={pvcs} loading={loading} emptyMessage={t('common.noData')} />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('storage.filesystem.create')}
      >
        <div className="grid gap-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="my-pvc"
          />
          <Select
            label={t('storage.filesystem.size')}
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            options={[
              { value: '1Gi', label: '1 GB' },
              { value: '5Gi', label: '5 GB' },
              { value: '10Gi', label: '10 GB' },
              { value: '20Gi', label: '20 GB' },
              { value: '50Gi', label: '50 GB' },
            ]}
          />
          <Select
            label={t('storage.filesystem.accessMode')}
            value={formData.accessMode}
            onChange={(e) => setFormData({ ...formData, accessMode: e.target.value })}
            options={[
              { value: 'ReadWriteOnce', label: 'ReadWriteOnce (RWO)' },
              { value: 'ReadOnlyMany', label: 'ReadOnlyMany (ROX)' },
              { value: 'ReadWriteMany', label: 'ReadWriteMany (RWX)' },
            ]}
          />
          <Input
            label={t('storage.filesystem.storageClass')}
            value={formData.storageClass}
            onChange={(e) => setFormData({ ...formData, storageClass: e.target.value })}
            placeholder="local-path (optional)"
          />
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
