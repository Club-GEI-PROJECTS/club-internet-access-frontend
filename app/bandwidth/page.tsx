'use client'

import PrivateRoute from '@/components/PrivateRoute'
import Layout from '@/components/Layout'
import Bandwidth from '@/components/Bandwidth'

export default function BandwidthPage() {
  return (
    <PrivateRoute>
      <Layout>
        <Bandwidth />
      </Layout>
    </PrivateRoute>
  )
}
