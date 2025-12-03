# VirtUI - KubeVirt & Kube-OVN Console

A modern web console for managing KubeVirt virtual machines and Kube-OVN network resources.

## Features

- **Compute Management**
  - Virtual Machine lifecycle (create, start, stop, delete)
  - VM monitoring and status

- **Storage Management**
  - Block Storage (DataVolumes)
  - Volume Snapshots
  - Filesystem (PVCs)

- **Network Management**
  - VPC management
  - Elastic IP (EIP)
  - NAT rules (SNAT/DNAT)
  - Load Balancers

- **Multi-language Support**
  - English
  - 中文 (Chinese)

- **Dark/Light Theme**

## Prerequisites

- Node.js 18+
- Access to a Kubernetes cluster with:
  - KubeVirt installed
  - Kube-OVN installed
  - CDI (Containerized Data Importer)
- Valid kubeconfig file (`~/.kube/config`)

## Installation

```bash
npm install
```

## Development

Start both the backend server and frontend dev server:

```bash
npm run dev
```

This will start:
- Backend API server on `http://localhost:3000`
- Frontend dev server on `http://localhost:5173`

## Production Build

```bash
npm run build
npm start
```

## Project Structure

```
virtui/
├── server/                 # Backend (Hono)
│   ├── index.ts           # Server entry point
│   ├── k8s/
│   │   └── client.ts      # Kubernetes client wrapper
│   └── routes/
│       ├── compute.ts     # VM management APIs
│       ├── storage.ts     # Storage management APIs
│       └── network.ts     # Network management APIs
├── src/                    # Frontend (React)
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── store/            # Zustand state management
│   └── i18n/             # Internationalization
└── public/               # Static assets
```

## API Endpoints

### Namespaces
- `GET /api/namespaces` - List all namespaces

### Compute
- `GET /api/compute/vms` - List virtual machines
- `POST /api/compute/vms` - Create virtual machine
- `DELETE /api/compute/vms/:name` - Delete virtual machine
- `POST /api/compute/vms/:name/start` - Start VM
- `POST /api/compute/vms/:name/stop` - Stop VM

### Storage
- `GET /api/storage/datavolumes` - List DataVolumes
- `POST /api/storage/datavolumes` - Create DataVolume
- `DELETE /api/storage/datavolumes/:name` - Delete DataVolume
- `GET /api/storage/snapshots` - List VolumeSnapshots
- `POST /api/storage/snapshots` - Create VolumeSnapshot
- `DELETE /api/storage/snapshots/:name` - Delete VolumeSnapshot
- `GET /api/storage/filesystems` - List PVCs
- `POST /api/storage/filesystems` - Create PVC
- `DELETE /api/storage/filesystems/:name` - Delete PVC

### Network
- `GET /api/network/vpcs` - List VPCs
- `POST /api/network/vpcs` - Create VPC
- `DELETE /api/network/vpcs/:name` - Delete VPC
- `GET /api/network/eips` - List EIPs
- `POST /api/network/eips` - Create EIP
- `DELETE /api/network/eips/:name` - Delete EIP
- `GET /api/network/nat` - List NAT rules
- `POST /api/network/nat/snat` - Create SNAT rule
- `POST /api/network/nat/dnat` - Create DNAT rule
- `DELETE /api/network/nat/snat/:name` - Delete SNAT rule
- `DELETE /api/network/nat/dnat/:name` - Delete DNAT rule
- `GET /api/network/loadbalancers` - List LoadBalancers
- `POST /api/network/loadbalancers` - Create LoadBalancer
- `DELETE /api/network/loadbalancers/:name` - Delete LoadBalancer

## License

MIT
