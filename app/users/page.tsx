'use client'

import PrivateRoute from '@/components/PrivateRoute'
import Layout from '@/components/Layout'
import Users from '@/components/Users'

export default function UsersPage() {
  return (
    <PrivateRoute>
      <Layout>
        <Users />
      </Layout>
    </PrivateRoute>
  )
}
