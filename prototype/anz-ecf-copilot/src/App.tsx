import { createBrowserRouter, createHashRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import { LucideProvider } from 'lucide-react'
import { PersonaContextProvider } from '@/context/PersonaContext'
import { StoreContextProvider } from '@/context/StoreContext'
import { OrderArticlesContextProvider } from '@/context/OrderArticlesContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AppShell } from '@/components/layout/AppShell'
import { StoreRequired } from '@/components/layout/StoreRequired'
import OrderSummary from '@/pages/OrderSummary'
import OrderDetails from '@/pages/OrderDetails'
import OrderLineDetail from '@/pages/OrderLineDetail'
import SearchOrders from '@/pages/SearchOrders'
import Dash from '@/pages/Dash'
import Settings from '@/pages/Settings'
import Reports from '@/pages/Reports'

// RootLayout provides all context to the route tree.
// Must be defined outside App() so it's never re-created on re-render.
function RootLayout() {
  return (
    <LucideProvider strokeWidth={2.75}>
      <PersonaContextProvider>
        <StoreContextProvider>
          <OrderArticlesContextProvider>
            <TooltipProvider>
              <Outlet />
              <Toaster position="top-center" />
            </TooltipProvider>
          </OrderArticlesContextProvider>
        </StoreContextProvider>
      </PersonaContextProvider>
    </LucideProvider>
  )
}

// 'share' builds (npm run build:share) use hash routing so the app works when opened
// directly via file:// (no server) — useBlocker still works, both are data routers.
const createRouter = import.meta.env.VITE_SHARE_BUILD === 'true' ? createHashRouter : createBrowserRouter

// router must be at module scope — re-creating it inside App() wipes history state on every render.
const router = createRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/order-summary" replace /> },
          {
            element: <StoreRequired />,
            children: [
              { path: 'order-summary', element: <OrderSummary /> },
              { path: 'order/detail', element: <OrderDetails /> },
              { path: 'order/detail/line', element: <OrderLineDetail /> },
              { path: 'search-orders', element: <SearchOrders /> },
              { path: 'dash', element: <Dash /> },
              { path: 'settings', element: <Settings /> },
              { path: 'reports', element: <Reports /> },
            ],
          },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
