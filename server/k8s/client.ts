import * as k8s from '@kubernetes/client-node'

class K8sClient {
  private kc: k8s.KubeConfig
  private coreApi: k8s.CoreV1Api
  private customApi: k8s.CustomObjectsApi

  constructor() {
    this.kc = new k8s.KubeConfig()
    this.kc.loadFromDefault()
    this.coreApi = this.kc.makeApiClient(k8s.CoreV1Api)
    this.customApi = this.kc.makeApiClient(k8s.CustomObjectsApi)
  }

  async getNamespaces() {
    const res = await this.coreApi.listNamespace()
    return res.body.items.map((ns) => ({
      name: ns.metadata?.name || '',
      status: ns.status?.phase || 'Unknown',
      createdAt: ns.metadata?.creationTimestamp,
    }))
  }

  // KubeVirt VirtualMachines
  async getVirtualMachines(namespace: string) {
    try {
      const res = await this.customApi.listNamespacedCustomObject(
        'kubevirt.io',
        'v1',
        namespace,
        'virtualmachines'
      )
      return (res.body as any).items || []
    } catch (error) {
      console.error('Failed to get VMs:', error)
      return []
    }
  }

  async getVirtualMachine(namespace: string, name: string) {
    const res = await this.customApi.getNamespacedCustomObject(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachines',
      name
    )
    return res.body
  }

  async createVirtualMachine(namespace: string, vm: any) {
    const res = await this.customApi.createNamespacedCustomObject(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachines',
      vm
    )
    return res.body
  }

  async deleteVirtualMachine(namespace: string, name: string) {
    await this.customApi.deleteNamespacedCustomObject(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachines',
      name
    )
  }

  async startVirtualMachine(namespace: string, name: string) {
    const patch = { spec: { running: true } }
    const res = await this.customApi.patchNamespacedCustomObject(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachines',
      name,
      patch,
      undefined,
      undefined,
      undefined,
      { headers: { 'Content-Type': 'application/merge-patch+json' } }
    )
    return res.body
  }

  async stopVirtualMachine(namespace: string, name: string) {
    const patch = { spec: { running: false } }
    const res = await this.customApi.patchNamespacedCustomObject(
      'kubevirt.io',
      'v1',
      namespace,
      'virtualmachines',
      name,
      patch,
      undefined,
      undefined,
      undefined,
      { headers: { 'Content-Type': 'application/merge-patch+json' } }
    )
    return res.body
  }

  // VMI (VirtualMachineInstance) - Running instance
  async getVirtualMachineInstances(namespace: string) {
    try {
      const res = await this.customApi.listNamespacedCustomObject(
        'kubevirt.io',
        'v1',
        namespace,
        'virtualmachineinstances'
      )
      return (res.body as any).items || []
    } catch (error) {
      console.error('Failed to get VMIs:', error)
      return []
    }
  }

  // CDI DataVolumes (Block Storage)
  async getDataVolumes(namespace: string) {
    try {
      const res = await this.customApi.listNamespacedCustomObject(
        'cdi.kubevirt.io',
        'v1beta1',
        namespace,
        'datavolumes'
      )
      return (res.body as any).items || []
    } catch (error) {
      console.error('Failed to get DataVolumes:', error)
      return []
    }
  }

  async createDataVolume(namespace: string, dv: any) {
    const res = await this.customApi.createNamespacedCustomObject(
      'cdi.kubevirt.io',
      'v1beta1',
      namespace,
      'datavolumes',
      dv
    )
    return res.body
  }

  async deleteDataVolume(namespace: string, name: string) {
    await this.customApi.deleteNamespacedCustomObject(
      'cdi.kubevirt.io',
      'v1beta1',
      namespace,
      'datavolumes',
      name
    )
  }

  // VolumeSnapshots
  async getVolumeSnapshots(namespace: string) {
    try {
      const res = await this.customApi.listNamespacedCustomObject(
        'snapshot.storage.k8s.io',
        'v1',
        namespace,
        'volumesnapshots'
      )
      return (res.body as any).items || []
    } catch (error) {
      console.error('Failed to get VolumeSnapshots:', error)
      return []
    }
  }

  async createVolumeSnapshot(namespace: string, snapshot: any) {
    const res = await this.customApi.createNamespacedCustomObject(
      'snapshot.storage.k8s.io',
      'v1',
      namespace,
      'volumesnapshots',
      snapshot
    )
    return res.body
  }

  async deleteVolumeSnapshot(namespace: string, name: string) {
    await this.customApi.deleteNamespacedCustomObject(
      'snapshot.storage.k8s.io',
      'v1',
      namespace,
      'volumesnapshots',
      name
    )
  }

  // PVCs (Filesystem)
  async getPersistentVolumeClaims(namespace: string) {
    const res = await this.coreApi.listNamespacedPersistentVolumeClaim(namespace)
    return res.body.items
  }

  async createPersistentVolumeClaim(namespace: string, pvc: k8s.V1PersistentVolumeClaim) {
    const res = await this.coreApi.createNamespacedPersistentVolumeClaim(namespace, pvc)
    return res.body
  }

  async deletePersistentVolumeClaim(namespace: string, name: string) {
    await this.coreApi.deleteNamespacedPersistentVolumeClaim(name, namespace)
  }

  // Kube-OVN VPCs
  async getVpcs() {
    try {
      const res = await this.customApi.listClusterCustomObject(
        'kubeovn.io',
        'v1',
        'vpcs'
      )
      return (res.body as any).items || []
    } catch (error) {
      console.error('Failed to get VPCs:', error)
      return []
    }
  }

  async createVpc(vpc: any) {
    const res = await this.customApi.createClusterCustomObject(
      'kubeovn.io',
      'v1',
      'vpcs',
      vpc
    )
    return res.body
  }

  async deleteVpc(name: string) {
    await this.customApi.deleteClusterCustomObject(
      'kubeovn.io',
      'v1',
      'vpcs',
      name
    )
  }

  // Kube-OVN Subnets
  async getSubnets() {
    try {
      const res = await this.customApi.listClusterCustomObject(
        'kubeovn.io',
        'v1',
        'subnets'
      )
      return (res.body as any).items || []
    } catch (error) {
      console.error('Failed to get Subnets:', error)
      return []
    }
  }

  // Kube-OVN EIPs
  async getEips() {
    try {
      const res = await this.customApi.listClusterCustomObject(
        'kubeovn.io',
        'v1',
        'iptables-eips'
      )
      return (res.body as any).items || []
    } catch (error) {
      console.error('Failed to get EIPs:', error)
      return []
    }
  }

  async createEip(eip: any) {
    const res = await this.customApi.createClusterCustomObject(
      'kubeovn.io',
      'v1',
      'iptables-eips',
      eip
    )
    return res.body
  }

  async deleteEip(name: string) {
    await this.customApi.deleteClusterCustomObject(
      'kubeovn.io',
      'v1',
      'iptables-eips',
      name
    )
  }

  // Kube-OVN NAT Rules
  async getNatRules() {
    try {
      const snatRes = await this.customApi.listClusterCustomObject(
        'kubeovn.io',
        'v1',
        'iptables-snat-rules'
      )
      const dnatRes = await this.customApi.listClusterCustomObject(
        'kubeovn.io',
        'v1',
        'iptables-dnat-rules'
      )
      return {
        snat: (snatRes.body as any).items || [],
        dnat: (dnatRes.body as any).items || [],
      }
    } catch (error) {
      console.error('Failed to get NAT rules:', error)
      return { snat: [], dnat: [] }
    }
  }

  async createSnatRule(rule: any) {
    const res = await this.customApi.createClusterCustomObject(
      'kubeovn.io',
      'v1',
      'iptables-snat-rules',
      rule
    )
    return res.body
  }

  async createDnatRule(rule: any) {
    const res = await this.customApi.createClusterCustomObject(
      'kubeovn.io',
      'v1',
      'iptables-dnat-rules',
      rule
    )
    return res.body
  }

  async deleteSnatRule(name: string) {
    await this.customApi.deleteClusterCustomObject(
      'kubeovn.io',
      'v1',
      'iptables-snat-rules',
      name
    )
  }

  async deleteDnatRule(name: string) {
    await this.customApi.deleteClusterCustomObject(
      'kubeovn.io',
      'v1',
      'iptables-dnat-rules',
      name
    )
  }

  // Kube-OVN VIP (for LoadBalancer)
  async getVips() {
    try {
      const res = await this.customApi.listClusterCustomObject(
        'kubeovn.io',
        'v1',
        'vips'
      )
      return (res.body as any).items || []
    } catch (error) {
      console.error('Failed to get VIPs:', error)
      return []
    }
  }

  // Services (LoadBalancer type)
  async getLoadBalancers(namespace: string) {
    const res = await this.coreApi.listNamespacedService(namespace)
    return res.body.items.filter(
      (svc) => svc.spec?.type === 'LoadBalancer'
    )
  }

  async createLoadBalancer(namespace: string, lb: k8s.V1Service) {
    const res = await this.coreApi.createNamespacedService(namespace, lb)
    return res.body
  }

  async deleteLoadBalancer(namespace: string, name: string) {
    await this.coreApi.deleteNamespacedService(name, namespace)
  }
}

export const k8sClient = new K8sClient()

