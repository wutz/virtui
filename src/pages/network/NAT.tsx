import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'

interface NATRule {
  name: string
  type: 'SNAT' | 'DNAT'
  status: string
  eip: string
  internalCidr?: string
  externalPort?: string
  internalIp?: string
  internalPort?: string
  protocol?: string
  natGw: string
  createdAt: string
}

export function NAT() {
  const { t } = useTranslation()
  const [natRules, setNatRules] = useState<NATRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showSnatModal, setShowSnatModal] = useState(false)
  const [showDnatModal, setShowDnatModal] = useState(false)

  const [snatForm, setSnatForm] = useState({
    name: '',
    eip: '',
    internalCidr: '',
    natGw: '',
  })

  const [dnatForm, setDnatForm] = useState({
    name: '',
    eip: '',
    externalPort: '',
    internalIp: '',
    internalPort: '',
    protocol: 'tcp',
    natGw: '',
  })

  const fetchNatRules = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/network/nat')
      if (res.ok) {
        const data = await res.json()
        setNatRules(data)
      }
    } catch (error) {
      console.error('Failed to fetch NAT rules:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNatRules()
  }, [])

  const handleCreateSnat = async () => {
    try {
      const res = await fetch('/api/network/nat/snat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snatForm),
      })
      if (res.ok) {
        setShowSnatModal(false)
        setSnatForm({ name: '', eip: '', internalCidr: '', natGw: '' })
        fetchNatRules()
      }
    } catch (error) {
      console.error('Failed to create SNAT rule:', error)
    }
  }

  const handleCreateDnat = async () => {
    try {
      const res = await fetch('/api/network/nat/dnat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dnatForm),
      })
      if (res.ok) {
        setShowDnatModal(false)
        setDnatForm({
          name: '',
          eip: '',
          externalPort: '',
          internalIp: '',
          internalPort: '',
          protocol: 'tcp',
          natGw: '',
        })
        fetchNatRules()
      }
    } catch (error) {
      console.error('Failed to create DNAT rule:', error)
    }
  }

  const handleDelete = async (rule: NATRule) => {
    if (!confirm(t('common.confirmDelete'))) return
    try {
      const endpoint = rule.type === 'SNAT' ? 'snat' : 'dnat'
      await fetch(`/api/network/nat/${endpoint}/${rule.name}`, { method: 'DELETE' })
      fetchNatRules()
    } catch (error) {
      console.error('Failed to delete NAT rule:', error)
    }
  }

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (rule: NATRule) => (
        <span className="font-mono font-medium text-emerald-500">{rule.name}</span>
      ),
    },
    {
      key: 'type',
      header: t('network.nat.type'),
      render: (rule: NATRule) => (
        <div className="flex items-center gap-1.5">
          {rule.type === 'SNAT' ? (
            <ArrowRight className="h-4 w-4 text-blue-500" />
          ) : (
            <ArrowLeft className="h-4 w-4 text-purple-500" />
          )}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${rule.type === 'SNAT'
                ? 'bg-blue-500/15 text-blue-500'
                : 'bg-purple-500/15 text-purple-500'
              }`}
          >
            {rule.type}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('common.status'),
      render: (rule: NATRule) => <StatusBadge status={rule.status} />,
    },
    {
      key: 'eip',
      header: t('network.nat.eip'),
      render: (rule: NATRule) => <span className="font-mono">{rule.eip}</span>,
    },
    {
      key: 'mapping',
      header: 'Mapping',
      render: (rule: NATRule) => (
        <span className="font-mono text-sm text-[var(--color-text-secondary)]">
          {rule.type === 'SNAT' ? (
            rule.internalCidr
          ) : (
            <>
              {rule.externalPort} → {rule.internalIp}:{rule.internalPort}
            </>
          )}
        </span>
      ),
    },
    {
      key: 'natGw',
      header: t('network.nat.natGw'),
      render: (rule: NATRule) => (
        <span className="text-[var(--color-text-secondary)]">{rule.natGw}</span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (rule: NATRule) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(rule)}
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
        title={t('network.nat.title')}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={fetchNatRules}>
              <RefreshCw className="h-4 w-4" />
              {t('common.refresh')}
            </Button>
            <Button variant="secondary" onClick={() => setShowSnatModal(true)}>
              <Plus className="h-4 w-4" />
              {t('network.nat.createSnat')}
            </Button>
            <Button onClick={() => setShowDnatModal(true)}>
              <Plus className="h-4 w-4" />
              {t('network.nat.createDnat')}
            </Button>
          </div>
        }
      />

      <Table
        columns={columns}
        data={natRules}
        loading={loading}
        emptyMessage={t('common.noData')}
      />

      {/* SNAT Modal */}
      <Modal
        isOpen={showSnatModal}
        onClose={() => setShowSnatModal(false)}
        title={t('network.nat.createSnat')}
      >
        <div className="grid gap-4">
          <Input
            label={t('common.name')}
            value={snatForm.name}
            onChange={(e) => setSnatForm({ ...snatForm, name: e.target.value })}
            placeholder="my-snat-rule"
          />
          <Input
            label={t('network.nat.eip')}
            value={snatForm.eip}
            onChange={(e) => setSnatForm({ ...snatForm, eip: e.target.value })}
            placeholder="my-eip"
          />
          <Input
            label={t('network.nat.internalCidr')}
            value={snatForm.internalCidr}
            onChange={(e) => setSnatForm({ ...snatForm, internalCidr: e.target.value })}
            placeholder="10.0.0.0/24"
          />
          <Input
            label={t('network.nat.natGw')}
            value={snatForm.natGw}
            onChange={(e) => setSnatForm({ ...snatForm, natGw: e.target.value })}
            placeholder="vpc-nat-gw"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowSnatModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateSnat}
              disabled={!snatForm.name || !snatForm.eip || !snatForm.internalCidr || !snatForm.natGw}
            >
              {t('common.create')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* DNAT Modal */}
      <Modal
        isOpen={showDnatModal}
        onClose={() => setShowDnatModal(false)}
        title={t('network.nat.createDnat')}
      >
        <div className="grid gap-4">
          <Input
            label={t('common.name')}
            value={dnatForm.name}
            onChange={(e) => setDnatForm({ ...dnatForm, name: e.target.value })}
            placeholder="my-dnat-rule"
          />
          <Input
            label={t('network.nat.eip')}
            value={dnatForm.eip}
            onChange={(e) => setDnatForm({ ...dnatForm, eip: e.target.value })}
            placeholder="my-eip"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('network.nat.externalPort')}
              value={dnatForm.externalPort}
              onChange={(e) => setDnatForm({ ...dnatForm, externalPort: e.target.value })}
              placeholder="80"
            />
            <Select
              label={t('network.nat.protocol')}
              value={dnatForm.protocol}
              onChange={(e) => setDnatForm({ ...dnatForm, protocol: e.target.value })}
              options={[
                { value: 'tcp', label: 'TCP' },
                { value: 'udp', label: 'UDP' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('network.nat.internalIp')}
              value={dnatForm.internalIp}
              onChange={(e) => setDnatForm({ ...dnatForm, internalIp: e.target.value })}
              placeholder="10.0.0.10"
            />
            <Input
              label={t('network.nat.internalPort')}
              value={dnatForm.internalPort}
              onChange={(e) => setDnatForm({ ...dnatForm, internalPort: e.target.value })}
              placeholder="8080"
            />
          </div>
          <Input
            label={t('network.nat.natGw')}
            value={dnatForm.natGw}
            onChange={(e) => setDnatForm({ ...dnatForm, natGw: e.target.value })}
            placeholder="vpc-nat-gw"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => setShowDnatModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateDnat}
              disabled={
                !dnatForm.name ||
                !dnatForm.eip ||
                !dnatForm.externalPort ||
                !dnatForm.internalIp ||
                !dnatForm.internalPort ||
                !dnatForm.natGw
              }
            >
              {t('common.create')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

