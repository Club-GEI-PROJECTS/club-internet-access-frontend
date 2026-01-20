'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiRequest } from '@/lib/api'

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * Hook personnalisé pour les appels API
 * Gère automatiquement le chargement et les erreurs
 */
export function useApi<T>(
  endpoint: string,
  options?: RequestInit,
  immediate: boolean = true
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiRequest<T>(endpoint, options)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur inconnue'))
    } finally {
      setLoading(false)
    }
  }, [endpoint, options])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [fetchData, immediate])

  return { data, loading, error, refetch: fetchData }
}

/**
 * Hook pour les mutations (POST, PUT, DELETE)
 */
export function useApiMutation<T, P = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const mutate = useCallback(async (
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
    body?: P
  ) => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiRequest<T>(endpoint, {
        method,
        ...(body !== undefined && { body: body as any }),
      } as RequestInit)
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erreur inconnue')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return { mutate, loading, error, data }
}
