import { Hono } from 'hono'
import { k8sClient } from '../k8s/client'

export const computeRoutes = new Hono()

// List all VMs in a namespace
computeRoutes.get('/vms', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  try {
    const vms = await k8sClient.getVirtualMachines(namespace)
    const vmis = await k8sClient.getVirtualMachineInstances(namespace)

    // Merge VM and VMI status
    const result = vms.map((vm: any) => {
      const vmi = vmis.find((i: any) => i.metadata?.name === vm.metadata?.name)
      return {
        name: vm.metadata?.name,
        namespace: vm.metadata?.namespace,
        running: vm.spec?.running || false,
        status: vmi?.status?.phase || (vm.spec?.running ? 'Starting' : 'Stopped'),
        cpu: vm.spec?.template?.spec?.domain?.cpu?.cores || 1,
        memory: vm.spec?.template?.spec?.domain?.resources?.requests?.memory || '1Gi',
        createdAt: vm.metadata?.creationTimestamp,
        ipAddress: vmi?.status?.interfaces?.[0]?.ipAddress || '-',
        nodeName: vmi?.status?.nodeName || '-',
      }
    })

    return c.json(result)
  } catch (error) {
    console.error('Failed to list VMs:', error)
    return c.json({ error: 'Failed to list VMs' }, 500)
  }
})

// Get single VM
computeRoutes.get('/vms/:name', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const name = c.req.param('name')
  try {
    const vm = await k8sClient.getVirtualMachine(namespace, name)
    return c.json(vm)
  } catch (error) {
    console.error('Failed to get VM:', error)
    return c.json({ error: 'Failed to get VM' }, 500)
  }
})

// Create VM
computeRoutes.post('/vms', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const body = await c.req.json()

  const vm = {
    apiVersion: 'kubevirt.io/v1',
    kind: 'VirtualMachine',
    metadata: {
      name: body.name,
      namespace: namespace,
    },
    spec: {
      running: body.running ?? false,
      template: {
        metadata: {
          labels: {
            'kubevirt.io/vm': body.name,
          },
        },
        spec: {
          domain: {
            cpu: {
              cores: body.cpu || 1,
            },
            devices: {
              disks: [
                {
                  name: 'rootdisk',
                  disk: {
                    bus: 'virtio',
                  },
                },
                {
                  name: 'cloudinitdisk',
                  disk: {
                    bus: 'virtio',
                  },
                },
              ],
              interfaces: [
                {
                  name: 'default',
                  masquerade: {},
                },
              ],
            },
            resources: {
              requests: {
                memory: body.memory || '1Gi',
              },
            },
          },
          networks: [
            {
              name: 'default',
              pod: {},
            },
          ],
          volumes: [
            {
              name: 'rootdisk',
              dataVolume: {
                name: body.dataVolume || `${body.name}-rootdisk`,
              },
            },
            {
              name: 'cloudinitdisk',
              cloudInitNoCloud: {
                userData: body.cloudInit || '#cloud-config\npassword: changeme\nchpasswd: { expire: False }',
              },
            },
          ],
        },
      },
      dataVolumeTemplates: body.createDataVolume ? [
        {
          metadata: {
            name: `${body.name}-rootdisk`,
          },
          spec: {
            source: {
              http: {
                url: body.imageUrl || 'https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img',
              },
            },
            pvc: {
              accessModes: ['ReadWriteOnce'],
              resources: {
                requests: {
                  storage: body.diskSize || '10Gi',
                },
              },
            },
          },
        },
      ] : undefined,
    },
  }

  try {
    const result = await k8sClient.createVirtualMachine(namespace, vm)
    return c.json(result, 201)
  } catch (error) {
    console.error('Failed to create VM:', error)
    return c.json({ error: 'Failed to create VM' }, 500)
  }
})

// Delete VM
computeRoutes.delete('/vms/:name', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const name = c.req.param('name')
  try {
    await k8sClient.deleteVirtualMachine(namespace, name)
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete VM:', error)
    return c.json({ error: 'Failed to delete VM' }, 500)
  }
})

// Start VM
computeRoutes.post('/vms/:name/start', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const name = c.req.param('name')
  try {
    const result = await k8sClient.startVirtualMachine(namespace, name)
    return c.json(result)
  } catch (error) {
    console.error('Failed to start VM:', error)
    return c.json({ error: 'Failed to start VM' }, 500)
  }
})

// Stop VM
computeRoutes.post('/vms/:name/stop', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const name = c.req.param('name')
  try {
    const result = await k8sClient.stopVirtualMachine(namespace, name)
    return c.json(result)
  } catch (error) {
    console.error('Failed to stop VM:', error)
    return c.json({ error: 'Failed to stop VM' }, 500)
  }
})
