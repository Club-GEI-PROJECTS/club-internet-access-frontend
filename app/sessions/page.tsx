'use client'

import PrivateRoute from '@/components/PrivateRoute'
import Layout from '@/components/Layout'
import Sessions from '@/components/Sessions'

export default function SessionsPage() {
  return (
    <PrivateRoute>
      <Layout>
        <Sessions />
      </Layout>
    </PrivateRoute>
  )
}
