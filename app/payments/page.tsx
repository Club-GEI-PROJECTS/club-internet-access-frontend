'use client'

import PrivateRoute from '@/components/PrivateRoute'
import Layout from '@/components/Layout'
import Payments from '@/components/Payments'

export default function PaymentsPage() {
  return (
    <PrivateRoute>
      <Layout>
        <Payments />
      </Layout>
    </PrivateRoute>
  )
}
