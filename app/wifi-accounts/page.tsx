'use client'

import PrivateRoute from '@/components/PrivateRoute'
import Layout from '@/components/Layout'
import WiFiAccounts from '@/components/WiFiAccounts'

export default function WiFiAccountsPage() {
  return (
    <PrivateRoute>
      <Layout>
        <WiFiAccounts />
      </Layout>
    </PrivateRoute>
  )
}
