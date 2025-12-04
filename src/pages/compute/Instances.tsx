import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Play, Square, Trash2, RefreshCw } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useAppStore } from '../../store'

interface VM {
  name: string
  namespace: string
  running: boolean
  status: string
  cpu: number
  memory: string
  ipAddress: string
  nodeName: string
  createdAt: string
}

export function Instances() {
  const { t } = useTranslation()
  const namespace = useAppStore((state) => state.namespace)
  const [vms, setVms] = useState<VM[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    cpu: '2',
    memory: '2Gi',
    diskSize: '20Gi',
    imageUrl: 'https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img',
    createDataVolume: true,
  })

  const fetchVms = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/compute/vms?namespace=${namespace}`)
      if (res.ok) {
        const data = await res.json()
        setVms(data)
      }
    } catch (error) {
      console.error('Failed to fetch VMs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVms()
  }, [namespace])

  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/compute/vms?namespace=${namespace}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cpu: parseInt(formData.cpu),
        }),
      })
      if (res.ok) {
        setShowCreateModal(false)
        setFormData({
          name: '',
          cpu: '2',
          memory: '2Gi',
          diskSize: '20Gi',
          imageUrl: 'https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img',
          createDataVolume: true,
        })
        fetchVms()
      }
    } catch (error) {
      console.error('Failed to create VM:', error)
    }
  }

  const handleStart = async (name: string) => {
    setActionLoading(name)
    try {
      await fetch(`/api/compute/vms/${name}/start?namespace=${namespace}`, { method: 'POST' })
      fetchVms()
    } finally {
      setActionLoading(null)
    }
  }

  const handleStop = async (name: string) => {
    setActionLoading(name)
    try {
      await fetch(`/api/compute/vms/${name}/stop?namespace=${namespace}`, { method: 'POST' })
      fetchVms()
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    setActionLoading(name)
    try {
      await fetch(`/api/compute/vms/${name}?namespace=${namespace}`, { method: 'DELETE' })
      fetchVms()
    } finally {
      setActionLoading(null)
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (vm: VM) => <span className="font-mono font-medium text-emerald-500">{vm.name}</span>,
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (vm: VM) => <StatusBadge status={vm.status} />,
    },
    {
      key: 'cpu',
      header: t('compute.cpu'),
      render: (vm: VM) => <span className="font-mono">{vm.cpu} cores</span>,
    },
    {
      key: 'memory',
      header: t('compute.memory'),
      render: (vm: VM) => <span className="font-mono">{vm.memory}</span>,
    },
    {
      key: 'ipAddress',
      header: t('compute.ipAddress'),
      render: (vm: VM) => (
        <span className="font-mono text-[var(--color-text-secondary)]">{vm.ipAddress}</span>
      ),
    },
    {
      key: 'nodeName',
      header: t('compute.nodeName'),
      render: (vm: VM) => (
        <span className="text-[var(--color-text-secondary)]">{vm.nodeName}</span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (vm: VM) => (
        <div className="flex items-center gap-1">
          {vm.running ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleStop(vm.name)
              }}
              loading={actionLoading === vm.name}
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleStart(vm.name)
              }}
              loading={actionLoading === vm.name}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(vm.name)
            }}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={t('compute.title')}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchVms}>
              <RefreshCw className="h-4 w-4" />
              {t('common.refresh')}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              {t('compute.createVm')}
            </Button>
          </div>
        }
      />

      <Table columns={columns} data={vms} loading={loading} emptyMessage={t('common.noData')} />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('compute.createVm')}
        size="lg"
      >
        <div className="grid gap-4">
          <Input
            label={t('compute.vmName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="my-vm"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('compute.cpu')}
              value={formData.cpu}
              onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
              options={[
                { value: '1', label: '1 Core' },
                { value: '2', label: '2 Cores' },
                { value: '4', label: '4 Cores' },
                { value: '8', label: '8 Cores' },
              ]}
            />
            <Select
              label={t('compute.memory')}
              value={formData.memory}
              onChange={(e) => setFormData({ ...formData, memory: e.target.value })}
              options={[
                { value: '1Gi', label: '1 GB' },
                { value: '2Gi', label: '2 GB' },
                { value: '4Gi', label: '4 GB' },
                { value: '8Gi', label: '8 GB' },
                { value: '16Gi', label: '16 GB' },
              ]}
            />
          </div>
          <Select
            label={t('compute.diskSize')}
            value={formData.diskSize}
            onChange={(e) => setFormData({ ...formData, diskSize: e.target.value })}
            options={[
              { value: '10Gi', label: '10 GB' },
              { value: '20Gi', label: '20 GB' },
              { value: '50Gi', label: '50 GB' },
              { value: '100Gi', label: '100 GB' },
            ]}
          />
          <Input
            label={t('compute.imageUrl')}
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
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

