'use client'

import PrivateRoute from '@/components/PrivateRoute'
import Layout from '@/components/Layout'
import TicketManagement from '@/components/TicketManagement'

export default function AdminTicketsPage() {
  return (
    <PrivateRoute>
      <Layout>
        <TicketManagement />
      </Layout>
    </PrivateRoute>
  )
}
