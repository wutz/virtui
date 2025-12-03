import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from './components/Layout'
import { Instances } from './pages/compute/Instances'
import { BlockStorage } from './pages/storage/BlockStorage'
import { Snapshots } from './pages/storage/Snapshots'
import { Filesystem } from './pages/storage/Filesystem'
import { VPC } from './pages/network/VPC'
import { EIP } from './pages/network/EIP'
import { NAT } from './pages/network/NAT'
import { LoadBalancer } from './pages/network/LoadBalancer'
import { useAppStore } from './store'

function App() {
  const theme = useAppStore((state) => state.theme)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/compute/instances" replace />} />
        <Route path="/compute/instances" element={<Instances />} />
        <Route path="/storage/block" element={<BlockStorage />} />
        <Route path="/storage/snapshots" element={<Snapshots />} />
        <Route path="/storage/filesystem" element={<Filesystem />} />
        <Route path="/network/vpc" element={<VPC />} />
        <Route path="/network/eip" element={<EIP />} />
        <Route path="/network/nat" element={<NAT />} />
        <Route path="/network/lb" element={<LoadBalancer />} />
      </Routes>
    </Layout>
  )
}

export default App
