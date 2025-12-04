import { Hono } from 'hono'
import { k8sClient } from '../k8s/client'

export const networkRoutes = new Hono()

// VPCs
networkRoutes.get('/vpcs', async (c) => {
  try {
    const vpcs = await k8sClient.getVpcs()
    const subnets = await k8sClient.getSubnets()

    const result = vpcs.map((vpc: any) => {
      const vpcSubnets = subnets.filter((s: any) => s.spec?.vpc === vpc.metadata?.name)
      return {
        name: vpc.metadata?.name,
        status: vpc.status?.standby ? 'Standby' : 'Active',
        defaultSubnet: vpc.spec?.defaultSubnet || '-',
        subnets: vpcSubnets.map((s: any) => s.metadata?.name),
        subnetCount: vpcSubnets.length,
        enableExternal: vpc.spec?.enableExternal || false,
        createdAt: vpc.metadata?.creationTimestamp,
      }
    })
    return c.json(result)
  } catch (error) {
    console.error('Failed to list VPCs:', error)
    return c.json({ error: 'Failed to list VPCs' }, 500)
  }
})

networkRoutes.post('/vpcs', async (c) => {
  const body = await c.req.json()

  const vpc = {
    apiVersion: 'kubeovn.io/v1',
    kind: 'Vpc',
    metadata: {
      name: body.name,
    },
    spec: {
      namespaces: body.namespaces || [],
      enableExternal: body.enableExternal || false,
    },
  }

  try {
    const result = await k8sClient.createVpc(vpc)
    return c.json(result, 201)
  } catch (error) {
    console.error('Failed to create VPC:', error)
    return c.json({ error: 'Failed to create VPC' }, 500)
  }
})

networkRoutes.delete('/vpcs/:name', async (c) => {
  const name = c.req.param('name')
  try {
    await k8sClient.deleteVpc(name)
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete VPC:', error)
    return c.json({ error: 'Failed to delete VPC' }, 500)
  }
})

// EIPs
networkRoutes.get('/eips', async (c) => {
  try {
    const eips = await k8sClient.getEips()
    const result = eips.map((eip: any) => ({
      name: eip.metadata?.name,
      status: eip.status?.ready ? 'Ready' : 'Pending',
      ip: eip.status?.ip || eip.spec?.v4ip || '-',
      v6ip: eip.status?.v6ip || eip.spec?.v6ip || '-',
      natGw: eip.spec?.natGwDp || '-',
      qosPolicy: eip.spec?.qosPolicy || '-',
      createdAt: eip.metadata?.creationTimestamp,
    }))
    return c.json(result)
  } catch (error) {
    console.error('Failed to list EIPs:', error)
    return c.json({ error: 'Failed to list EIPs' }, 500)
  }
})

networkRoutes.post('/eips', async (c) => {
  const body = await c.req.json()

  const eip = {
    apiVersion: 'kubeovn.io/v1',
    kind: 'IptablesEIP',
    metadata: {
      name: body.name,
    },
    spec: {
      v4ip: body.v4ip || undefined,
      v6ip: body.v6ip || undefined,
      natGwDp: body.natGw,
      qosPolicy: body.qosPolicy || undefined,
    },
  }

  try {
    const result = await k8sClient.createEip(eip)
    return c.json(result, 201)
  } catch (error) {
    console.error('Failed to create EIP:', error)
    return c.json({ error: 'Failed to create EIP' }, 500)
  }
})

networkRoutes.delete('/eips/:name', async (c) => {
  const name = c.req.param('name')
  try {
    await k8sClient.deleteEip(name)
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete EIP:', error)
    return c.json({ error: 'Failed to delete EIP' }, 500)
  }
})

// NAT Rules
networkRoutes.get('/nat', async (c) => {
  try {
    const natRules = await k8sClient.getNatRules()

    const snatResult = natRules.snat.map((rule: any) => ({
      name: rule.metadata?.name,
      type: 'SNAT',
      status: rule.status?.ready ? 'Ready' : 'Pending',
      eip: rule.spec?.eip || '-',
      internalCidr: rule.spec?.internalCIDR || '-',
      natGw: rule.spec?.natGwDp || '-',
      createdAt: rule.metadata?.creationTimestamp,
    }))

    const dnatResult = natRules.dnat.map((rule: any) => ({
      name: rule.metadata?.name,
      type: 'DNAT',
      status: rule.status?.ready ? 'Ready' : 'Pending',
      eip: rule.spec?.eip || '-',
      externalPort: rule.spec?.externalPort || '-',
      internalIp: rule.spec?.internalIp || '-',
      internalPort: rule.spec?.internalPort || '-',
      protocol: rule.spec?.protocol || 'tcp',
      natGw: rule.spec?.natGwDp || '-',
      createdAt: rule.metadata?.creationTimestamp,
    }))

    return c.json([...snatResult, ...dnatResult])
  } catch (error) {
    console.error('Failed to list NAT rules:', error)
    return c.json({ error: 'Failed to list NAT rules' }, 500)
  }
})

networkRoutes.post('/nat/snat', async (c) => {
  const body = await c.req.json()

  const snatRule = {
    apiVersion: 'kubeovn.io/v1',
    kind: 'IptablesSnatRule',
    metadata: {
      name: body.name,
    },
    spec: {
      eip: body.eip,
      internalCIDR: body.internalCidr,
      natGwDp: body.natGw,
    },
  }

  try {
    const result = await k8sClient.createSnatRule(snatRule)
    return c.json(result, 201)
  } catch (error) {
    console.error('Failed to create SNAT rule:', error)
    return c.json({ error: 'Failed to create SNAT rule' }, 500)
  }
})

networkRoutes.post('/nat/dnat', async (c) => {
  const body = await c.req.json()

  const dnatRule = {
    apiVersion: 'kubeovn.io/v1',
    kind: 'IptablesDnatRule',
    metadata: {
      name: body.name,
    },
    spec: {
      eip: body.eip,
      externalPort: body.externalPort,
      internalIp: body.internalIp,
      internalPort: body.internalPort,
      protocol: body.protocol || 'tcp',
      natGwDp: body.natGw,
    },
  }

  try {
    const result = await k8sClient.createDnatRule(dnatRule)
    return c.json(result, 201)
  } catch (error) {
    console.error('Failed to create DNAT rule:', error)
    return c.json({ error: 'Failed to create DNAT rule' }, 500)
  }
})

networkRoutes.delete('/nat/snat/:name', async (c) => {
  const name = c.req.param('name')
  try {
    await k8sClient.deleteSnatRule(name)
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete SNAT rule:', error)
    return c.json({ error: 'Failed to delete SNAT rule' }, 500)
  }
})

networkRoutes.delete('/nat/dnat/:name', async (c) => {
  const name = c.req.param('name')
  try {
    await k8sClient.deleteDnatRule(name)
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete DNAT rule:', error)
    return c.json({ error: 'Failed to delete DNAT rule' }, 500)
  }
})

// Load Balancers
networkRoutes.get('/loadbalancers', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  try {
    const lbs = await k8sClient.getLoadBalancers(namespace)
    const vips = await k8sClient.getVips()

    const result = lbs.map((lb) => ({
      name: lb.metadata?.name,
      namespace: lb.metadata?.namespace,
      type: lb.spec?.type,
      clusterIP: lb.spec?.clusterIP || '-',
      externalIP: lb.status?.loadBalancer?.ingress?.[0]?.ip || '-',
      ports: lb.spec?.ports?.map((p) => `${p.port}:${p.targetPort}/${p.protocol}`).join(', ') || '-',
      selector: lb.spec?.selector ? Object.entries(lb.spec.selector).map(([k, v]) => `${k}=${v}`).join(', ') : '-',
      createdAt: lb.metadata?.creationTimestamp,
    }))

    return c.json(result)
  } catch (error) {
    console.error('Failed to list LoadBalancers:', error)
    return c.json({ error: 'Failed to list LoadBalancers' }, 500)
  }
})

networkRoutes.post('/loadbalancers', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const body = await c.req.json()

  const lb = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: body.name,
      namespace: namespace,
      annotations: body.vip ? {
        'ovn.kubernetes.io/vip': body.vip,
      } : undefined,
    },
    spec: {
      type: 'LoadBalancer',
      selector: body.selector || {},
      ports: body.ports?.map((p: any) => ({
        name: p.name || `port-${p.port}`,
        port: p.port,
        targetPort: p.targetPort || p.port,
        protocol: p.protocol || 'TCP',
      })) || [],
    },
  }

  try {
    const result = await k8sClient.createLoadBalancer(namespace, lb as any)
    return c.json(result, 201)
  } catch (error) {
    console.error('Failed to create LoadBalancer:', error)
    return c.json({ error: 'Failed to create LoadBalancer' }, 500)
  }
})

networkRoutes.delete('/loadbalancers/:name', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const name = c.req.param('name')
  try {
    await k8sClient.deleteLoadBalancer(namespace, name)
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete LoadBalancer:', error)
    return c.json({ error: 'Failed to delete LoadBalancer' }, 500)
  }
})

