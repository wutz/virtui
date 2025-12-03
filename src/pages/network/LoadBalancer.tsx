import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, RefreshCw, Scale } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { useAppStore } from '../../store'

interface LBItem {
  name: string
  namespace: string
  type: string
  clusterIP: string
  externalIP: string
  ports: string
  selector: string
  createdAt: string
}

export function LoadBalancer() {
  const { t } = useTranslation()
  const namespace = useAppStore((state) => state.namespace)
  const [lbs, setLbs] = useState<LBItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    port: '80',
    targetPort: '8080',
    protocol: 'TCP',
    vip: '',
    selectorKey: '',
    selectorValue: '',
  })

  const fetchLbs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/network/loadbalancers?namespace=${namespace}`)
      if (res.ok) {
        const data = await res.json()
        setLbs(data)
      }
    } catch (error) {
      console.error('Failed to fetch LoadBalancers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLbs()
  }, [namespace])

  const handleCreate = async () => {
    try {
      const res = await fetch(`/api/network/loadbalancers?namespace=${namespace}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          vip: formData.vip || undefined,
          selector: formData.selectorKey
            ? { [formData.selectorKey]: formData.selectorValue }
            : {},
          ports: [
            {
              port: parseInt(formData.port),
              targetPort: parseInt(formData.targetPort),
              protocol: formData.protocol,
            },
          ],
        }),
      })
      if (res.ok) {
        setShowCreateModal(false)
        setFormData({
          name: '',
          port: '80',
          targetPort: '8080',
          protocol: 'TCP',
          vip: '',
          selectorKey: '',
          selectorValue: '',
        })
        fetchLbs()
      }
    } catch (error) {
      console.error('Failed to create LoadBalancer:', error)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      await fetch(`/api/network/loadbalancers/${name}?namespace=${namespace}`, {
        method: 'DELETE',
      })
      fetchLbs()
    } catch (error) {
      console.error('Failed to delete LoadBalancer:', error)
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (lb: LBItem) => (
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-emerald-500" />
          <span className="font-mono font-medium text-emerald-500">{lb.name}</span>
        </div>
      ),
    },
    {
      key: 'clusterIP',
      header: t('network.lb.clusterIP'),
      render: (lb: LBItem) => (
        <span className="font-mono text-[var(--color-text-secondary)]">{lb.clusterIP}</span>
      ),
    },
    {
      key: 'externalIP',
      header: t('network.lb.externalIP'),
      render: (lb: LBItem) => (
        <span className="font-mono bg-[var(--color-bg-tertiary)] px-2 py-1 rounded">
          {lb.externalIP}
        </span>
      ),
    },
    {
      key: 'ports',
      header: t('network.lb.ports'),
      render: (lb: LBItem) => (
        <span className="font-mono text-sm text-[var(--color-text-secondary)]">{lb.ports}</span>
      ),
    },
    {
      key: 'selector',
      header: t('network.lb.selector'),
      render: (lb: LBItem) => (
        <span className="text-xs text-[var(--color-text-secondary)]">{lb.selector}</span>
      ),
    },
    {
      key: 'createdAt',
      header: t('common.createdAt'),
      render: (lb: LBItem) => (
        <span className="text-[var(--color-text-secondary)]">
          {new Date(lb.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (lb: LBItem) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(lb.name)}
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
        title={t('network.lb.title')}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchLbs}>
              <RefreshCw className="h-4 w-4" />
              {t('common.refresh')}
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              {t('network.lb.create')}
            </Button>
          </div>
        }
      />

      <Table columns={columns} data={lbs} loading={loading} emptyMessage={t('common.noData')} />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('network.lb.create')}
        size="lg"
      >
        <div className="grid gap-4">
          <Input
            label={t('common.name')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="my-loadbalancer"
          />
          <Input
            label={t('network.lb.vip')}
            value={formData.vip}
            onChange={(e) => setFormData({ ...formData, vip: e.target.value })}
            placeholder="10.0.0.100 (optional)"
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label={t('network.lb.port')}
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              placeholder="80"
            />
            <Input
              label={t('network.lb.targetPort')}
              value={formData.targetPort}
              onChange={(e) => setFormData({ ...formData, targetPort: e.target.value })}
              placeholder="8080"
            />
            <Select
              label="Protocol"
              value={formData.protocol}
              onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
              options={[
                { value: 'TCP', label: 'TCP' },
                { value: 'UDP', label: 'UDP' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Selector Key"
              value={formData.selectorKey}
              onChange={(e) => setFormData({ ...formData, selectorKey: e.target.value })}
              placeholder="app"
            />
            <Input
              label="Selector Value"
              value={formData.selectorValue}
              onChange={(e) => setFormData({ ...formData, selectorValue: e.target.value })}
              placeholder="my-app"
            />
          </div>
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
