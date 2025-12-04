import { Hono } from 'hono'
import { k8sClient } from '../k8s/client'

export const storageRoutes = new Hono()

// DataVolumes (Block Storage)
storageRoutes.get('/datavolumes', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  try {
    const dvs = await k8sClient.getDataVolumes(namespace)
    const result = dvs.map((dv: any) => ({
      name: dv.metadata?.name,
      namespace: dv.metadata?.namespace,
      status: dv.status?.phase || 'Unknown',
      progress: dv.status?.progress || '0%',
      size: dv.spec?.pvc?.resources?.requests?.storage || '-',
      source: dv.spec?.source ? Object.keys(dv.spec.source)[0] : '-',
      createdAt: dv.metadata?.creationTimestamp,
    }))
    return c.json(result)
  } catch (error) {
    console.error('Failed to list DataVolumes:', error)
    return c.json({ error: 'Failed to list DataVolumes' }, 500)
  }
})

storageRoutes.post('/datavolumes', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const body = await c.req.json()

  const dv = {
    apiVersion: 'cdi.kubevirt.io/v1beta1',
    kind: 'DataVolume',
    metadata: {
      name: body.name,
      namespace: namespace,
    },
    spec: {
      source: body.sourceType === 'http'
        ? { http: { url: body.sourceUrl } }
        : body.sourceType === 'blank'
          ? { blank: {} }
          : { pvc: { name: body.sourcePvc, namespace: body.sourcePvcNamespace || namespace } },
      pvc: {
        accessModes: [body.accessMode || 'ReadWriteOnce'],
        resources: {
          requests: {
            storage: body.size || '10Gi',
          },
        },
        storageClassName: body.storageClass || undefined,
      },
    },
  }

  try {
    const result = await k8sClient.createDataVolume(namespace, dv)
    return c.json(result, 201)
  } catch (error) {
    console.error('Failed to create DataVolume:', error)
    return c.json({ error: 'Failed to create DataVolume' }, 500)
  }
})

storageRoutes.delete('/datavolumes/:name', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const name = c.req.param('name')
  try {
    await k8sClient.deleteDataVolume(namespace, name)
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete DataVolume:', error)
    return c.json({ error: 'Failed to delete DataVolume' }, 500)
  }
})

// Volume Snapshots
storageRoutes.get('/snapshots', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  try {
    const snapshots = await k8sClient.getVolumeSnapshots(namespace)
    const result = snapshots.map((snap: any) => ({
      name: snap.metadata?.name,
      namespace: snap.metadata?.namespace,
      status: snap.status?.readyToUse ? 'Ready' : 'Pending',
      sourcePvc: snap.spec?.source?.persistentVolumeClaimName || '-',
      snapshotClass: snap.spec?.volumeSnapshotClassName || '-',
      restoreSize: snap.status?.restoreSize || '-',
      createdAt: snap.metadata?.creationTimestamp,
    }))
    return c.json(result)
  } catch (error) {
    console.error('Failed to list VolumeSnapshots:', error)
    return c.json({ error: 'Failed to list VolumeSnapshots' }, 500)
  }
})

storageRoutes.post('/snapshots', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const body = await c.req.json()

  const snapshot = {
    apiVersion: 'snapshot.storage.k8s.io/v1',
    kind: 'VolumeSnapshot',
    metadata: {
      name: body.name,
      namespace: namespace,
    },
    spec: {
      volumeSnapshotClassName: body.snapshotClass || undefined,
      source: {
        persistentVolumeClaimName: body.sourcePvc,
      },
    },
  }

  try {
    const result = await k8sClient.createVolumeSnapshot(namespace, snapshot)
    return c.json(result, 201)
  } catch (error) {
    console.error('Failed to create VolumeSnapshot:', error)
    return c.json({ error: 'Failed to create VolumeSnapshot' }, 500)
  }
})

storageRoutes.delete('/snapshots/:name', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const name = c.req.param('name')
  try {
    await k8sClient.deleteVolumeSnapshot(namespace, name)
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete VolumeSnapshot:', error)
    return c.json({ error: 'Failed to delete VolumeSnapshot' }, 500)
  }
})

// PVCs (Filesystem)
storageRoutes.get('/filesystems', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  try {
    const pvcs = await k8sClient.getPersistentVolumeClaims(namespace)
    const result = pvcs.map((pvc) => ({
      name: pvc.metadata?.name,
      namespace: pvc.metadata?.namespace,
      status: pvc.status?.phase || 'Unknown',
      size: pvc.spec?.resources?.requests?.storage || '-',
      accessModes: pvc.spec?.accessModes?.join(', ') || '-',
      storageClass: pvc.spec?.storageClassName || '-',
      volumeName: pvc.spec?.volumeName || '-',
      createdAt: pvc.metadata?.creationTimestamp,
    }))
    return c.json(result)
  } catch (error) {
    console.error('Failed to list PVCs:', error)
    return c.json({ error: 'Failed to list PVCs' }, 500)
  }
})

storageRoutes.post('/filesystems', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const body = await c.req.json()

  const pvc = {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
    metadata: {
      name: body.name,
      namespace: namespace,
    },
    spec: {
      accessModes: [body.accessMode || 'ReadWriteOnce'],
      resources: {
        requests: {
          storage: body.size || '10Gi',
        },
      },
      storageClassName: body.storageClass || undefined,
    },
  }

  try {
    const result = await k8sClient.createPersistentVolumeClaim(namespace, pvc as any)
    return c.json(result, 201)
  } catch (error) {
    console.error('Failed to create PVC:', error)
    return c.json({ error: 'Failed to create PVC' }, 500)
  }
})

storageRoutes.delete('/filesystems/:name', async (c) => {
  const namespace = c.req.query('namespace') || 'default'
  const name = c.req.param('name')
  try {
    await k8sClient.deletePersistentVolumeClaim(namespace, name)
    return c.json({ success: true })
  } catch (error) {
    console.error('Failed to delete PVC:', error)
    return c.json({ error: 'Failed to delete PVC' }, 500)
  }
})

