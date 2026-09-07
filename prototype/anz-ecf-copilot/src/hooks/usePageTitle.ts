import { useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { findNavLabel } from '@/data/navigation'

const SITE_NAME = 'ANZ ECF Order Management'

export function usePageTitle() {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const orderNo = pathname === '/order/detail' ? searchParams.get('id') : null

  useEffect(() => {
    if (orderNo) {
      document.title = `${orderNo} - ${SITE_NAME}`
      return
    }
    const label = findNavLabel(pathname)
    document.title = label ? `${label} - ${SITE_NAME}` : SITE_NAME
  }, [pathname, orderNo])
}
