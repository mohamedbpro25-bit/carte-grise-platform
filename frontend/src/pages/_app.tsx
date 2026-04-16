import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import Layout from '@/components/Layout/Layout'
import { authService } from '@/services/auth'
import '@/styles/globals.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const user = authService.getCurrentUser()
    const isAdmin = String(user?.role || '').toLowerCase() === 'admin'
    if (!isAdmin) return

    const path = router.pathname
    const allowedAdminPaths = ['/admin', '/admin.html', '/login']
    if (!allowedAdminPaths.includes(path)) {
      router.replace('/admin.html')
    }
  }, [router.pathname])

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster position="top-right" />
    </QueryClientProvider>
  )
}