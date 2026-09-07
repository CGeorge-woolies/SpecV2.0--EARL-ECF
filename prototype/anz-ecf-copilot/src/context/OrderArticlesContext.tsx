import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { getOrderArticles, type ArticleRow } from '@/pages/order-detail/articlesData'

type ArticlesUpdater = ArticleRow[] | ((prev: ArticleRow[]) => ArticleRow[])

interface OrderArticlesContextValue {
  getArticles: (orderNo: string, statusLabel: string) => ArticleRow[]
  setArticles: (orderNo: string, updater: ArticlesUpdater) => void
}

const OrderArticlesContext = createContext<OrderArticlesContextValue | null>(null)

/**
 * In-memory (no localStorage) store of order-line edits, keyed by order number. Mounted once at
 * the app root so it survives navigation between the Order Details page and the order-line
 * detail page — edits made on one are visible on the other for the rest of the session, but
 * reset on refresh like every other hardcoded-data edit in this prototype.
 */
export function OrderArticlesContextProvider({ children }: { children: ReactNode }) {
  const [articlesByOrder, setArticlesByOrder] = useState<Record<string, ArticleRow[]>>({})
  // Avoids re-seeding from getOrderArticles on every render before the state update above lands.
  const seededRef = useRef<Record<string, ArticleRow[]>>({})

  const getArticles = useCallback(
    (orderNo: string, statusLabel: string) => {
      if (articlesByOrder[orderNo]) return articlesByOrder[orderNo]
      if (!seededRef.current[orderNo]) {
        seededRef.current[orderNo] = getOrderArticles(orderNo, statusLabel)
      }
      return seededRef.current[orderNo]
    },
    [articlesByOrder]
  )

  const setArticles = useCallback((orderNo: string, updater: ArticlesUpdater) => {
    setArticlesByOrder((prev) => {
      const current = prev[orderNo] ?? seededRef.current[orderNo] ?? []
      const next = typeof updater === 'function' ? updater(current) : updater
      return { ...prev, [orderNo]: next }
    })
  }, [])

  return <OrderArticlesContext.Provider value={{ getArticles, setArticles }}>{children}</OrderArticlesContext.Provider>
}

export function useOrderArticles(orderNo: string, statusLabel: string): [ArticleRow[], (updater: ArticlesUpdater) => void] {
  const ctx = useContext(OrderArticlesContext)
  if (!ctx) throw new Error('useOrderArticles must be used within an OrderArticlesContextProvider')
  const articles = ctx.getArticles(orderNo, statusLabel)
  const setArticles = useCallback((updater: ArticlesUpdater) => ctx.setArticles(orderNo, updater), [ctx, orderNo])
  return [articles, setArticles]
}
