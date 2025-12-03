import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from '@hono/node-server/serve-static'
import { k8sClient } from './k8s/client'
import { computeRoutes } from './routes/compute'
import { storageRoutes } from './routes/storage'
import { networkRoutes } from './routes/network'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('/api/*', cors())

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// Namespaces
app.get('/api/namespaces', async (c) => {
  try {
    const namespaces = await k8sClient.getNamespaces()
    return c.json(namespaces)
  } catch (error) {
    console.error('Failed to get namespaces:', error)
    return c.json({ error: 'Failed to get namespaces' }, 500)
  }
})

// Mount routes
app.route('/api/compute', computeRoutes)
app.route('/api/storage', storageRoutes)
app.route('/api/network', networkRoutes)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './dist' }))
}

const port = parseInt(process.env.PORT || '3000')

console.log(`🚀 VirtUI Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
