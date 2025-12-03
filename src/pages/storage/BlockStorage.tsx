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

interface DataVolume {
  name: string
  namespace: string
  status: string
  progress: string
  size: string
  source: string
  createdAt: string
}

export function BlockStorage() {
  const { t } = useTranslation()
  const namespace = useAppStore((state) => state.namespace)
  const [dataVolumes, setDataVolumes] = useState<DataVolume[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    size: '10Gi',
    sourceType: 'blank',
    sourceUrl: '',
  })

  const fetchDataVolumes = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/storage/datavolumes?namespace=${namespace}`)
      if (res.ok) {
        const data = await res.json()
        setDataVolumes(data)
      }
    } catch (error) {
      console.error('Failed to fetch DataVolumes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDataVolumes()
  }, [namespace])

  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/storage/datavolumes?namespace=${namespace}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowCreateModal(false)
        setFormData({ name: '', size: '10Gi', sourceType: 'blank', sourceUrl: '' })
        fetchDataVolumes()
      }
    } catch (error) {
      console.error('Failed to create DataVolume:', error)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      await fetch(`/api/storage/datavolumes/${name}?namespace=${namespace}`, { method: 'DELETE' })
      fetchDataVolumes()
    } catch (error) {
      console.error('Failed to delete DataVolume:', error)
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (dv: DataVolume) => (
        <span className="font-mono font-medium text-emerald-500">{dv.name}</span>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (dv: DataVolume) => <StatusBadge status={dv.status} />,
    },
    {
      key: 'progress',
      header: t('storage.blockStorage.progress'),
      render: (dv: DataVolume) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: dv.progress }}
            />
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">{dv.progress}</span>
        </div>
      ),
    },
    {
      key: 'size',
      header: t('storage.blockStorage.size'),
      render: (dv: DataVolume) => <span className="font-mono">{dv.size}</span>,
    },
    {
      key: 'source',
      header: t('storage.blockStorage.source'),
      render: (dv: DataVolume) => (
        <span className="text-[var(--color-text-secondary)]">{dv.source}</span>
      ),
    },
    {
      key: 'createdAt',
      header: t('common.createdAt'),
      render: (dv: DataVolume) => (
        <span className="text-[var(--color-text-secondary)]">
          {new Date(dv.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (dv: DataVolume) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(dv.name)}
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
        title={t('storage.blockStorage.title')}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchDataVolumes}>
              <RefreshCw className="h-4 w-4" />
              {t('common.refresh')}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              {t('storage.blockStorage.create')}
            </Button>
          </div>
        }
      />

      <Table
        columns={columns}
        data={dataVolumes}
        loading={loading}
        emptyMessage={t('common.noData')}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('storage.blockStorage.create')}
      >
        <div className="grid gap-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="my-datavolume"
          />
          <Select
            label={t('storage.blockStorage.size')}
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            options={[
              { value: '5Gi', label: '5 GB' },
              { value: '10Gi', label: '10 GB' },
              { value: '20Gi', label: '20 GB' },
              { value: '50Gi', label: '50 GB' },
              { value: '100Gi', label: '100 GB' },
            ]}
          />
          <Select
            label={t('storage.blockStorage.sourceType')}
            value={formData.sourceType}
            onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
            options={[
              { value: 'blank', label: 'Blank (Empty)' },
              { value: 'http', label: 'HTTP URL' },
            ]}
          />
          {formData.sourceType === 'http' && (
            <Input
              label={t('storage.blockStorage.sourceUrl')}
              value={formData.sourceUrl}
              onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
              placeholder="https://..."
            />
          )}
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
