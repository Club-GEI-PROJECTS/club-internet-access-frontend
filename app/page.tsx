'use client'

import PrivateRoute from '@/components/PrivateRoute'
import Layout from '@/components/Layout'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <PrivateRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </PrivateRoute>
  )
}
