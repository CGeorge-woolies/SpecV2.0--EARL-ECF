import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { ChevronsLeft } from 'lucide-react'
import { StoreToggle } from '@/components/layout/StoreToggle'
import { useStore } from '@/context/StoreContext'
import { APP_NAME, APP_VERSION, VERSION_TIMESTAMP_LABEL } from '@/version'
import { UserMenu } from '@/components/layout/UserMenu'
import { findNavLabel } from '@/data/navigation'
import { findOrder, getPropositionDisplay } from '@/pages/order-summary/orderGroups'
import {
  ChevronLeftFilled,
  ChevronRightFilled,
  SettingsOutlined,
  SpeedOutlined,
  AnalyticsOutlined,
  SearchOutlined,
  ViewListOutlined,
} from '@/components/icons/material-icons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import tokens from '@/theme/tokens'
import wIcon from '@/assets/wicon-positive.svg'

export function Header() {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const [loadedAt] = useState(() => new Date())
  const { activeStoreType, activeCountry, isAU } = useStore()

  // The store/country picker (StoreRequired) renders in place of the page content at
  // this same route until both are selected — the header shouldn't show a page-specific
  // title/subline (Order Summary's date/time/refresh) while that picker is showing.
  const isStoreSelectorView = activeStoreType === null || activeCountry === null
  const pageTitle = isStoreSelectorView ? APP_NAME : (findNavLabel(pathname) ?? 'Order Summary')

  // Dash is a real-time monitoring page — its subline shows a "last refreshed" time
  // (defaulting to page-load time) with a Refresh link to bump it, instead of a static load time.
  const isDash = pathname === '/dash' && !isStoreSelectorView
  const [dashRefreshedAt, setDashRefreshedAt] = useState<Date | null>(null)
  const refreshedAt = dashRefreshedAt ?? loadedAt
  const refreshedAtLabel = refreshedAt.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })

  // Order Summary gets the same "time + Refresh" subline treatment as Dash — everywhere else
  // (Search, Reports, Settings) drops the subline entirely, since a static load time isn't
  // meaningful on those pages.
  const isOrderSummary = pathname === '/order-summary' && !isStoreSelectorView
  const [orderSummaryRefreshedAt, setOrderSummaryRefreshedAt] = useState<Date | null>(null)
  const orderSummaryRefreshedAtLabel = (() => {
    const at = orderSummaryRefreshedAt ?? loadedAt
    return `${at.toLocaleDateString()} ${at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
  })()

  // The order-line detail page shows the same order banner as Order Details, but the left
  // control is a single "back to order" link instead of prev/next-order stepping.
  const isLineDetail = pathname === '/order/detail/line'
  const orderNo = pathname === '/order/detail' || isLineDetail ? searchParams.get('id') : null
  const found = orderNo ? findOrder(orderNo) : null
  const proposition = found ? getPropositionDisplay(found.order, isAU) : null
  const prevOrder = found && found.index > 0 ? found.all[found.index - 1] : null
  const nextOrder = found && found.index < found.all.length - 1 ? found.all[found.index + 1] : null

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: tokens.headerHeight,
        backgroundColor: tokens.colorPrimaryDarkest,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="relative flex items-center h-full max-w-[1920px] mx-auto px-4">
      {/* Left — Logo + Store selectors */}
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger
            render={
              <Link to="/order-summary" className="flex items-center" />
            }
          >
            <img src={wIcon} width={32} height={32} alt="Woolworths" />
          </TooltipTrigger>
          <TooltipContent>Order Summary</TooltipContent>
        </Tooltip>
        <StoreToggle />
      </div>

      {/* Center — title + loaded-at subline (absolutely centered) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        {found ? (
          <div className="flex items-center gap-3">
            {isLineDetail ? (
              <Tooltip>
                <TooltipTrigger
                  render={<Link to={`/order/detail?id=${found.order.orderNo}`} className="flex items-center justify-center text-white transition-colors hover:text-white/70" />}
                >
                  <ChevronsLeft size={20} />
                </TooltipTrigger>
                <TooltipContent>Back to Order</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link
                      to={prevOrder ? `/order/detail?id=${prevOrder.orderNo}` : '#'}
                      aria-disabled={!prevOrder}
                      className={`flex items-center justify-center text-white transition-colors ${prevOrder ? 'hover:text-white/70' : 'pointer-events-none opacity-30'}`}
                    />
                  }
                >
                  <ChevronLeftFilled size={20} />
                </TooltipTrigger>
                <TooltipContent>Previous Order</TooltipContent>
              </Tooltip>
            )}
            <Link
              to={`/order/detail?id=${found.order.orderNo}`}
              className="flex flex-col items-center no-underline hover:opacity-80 transition-opacity"
            >
              <span className="text-white font-bold text-base leading-tight whitespace-nowrap">
                Order {found.order.orderNo}
              </span>
              {proposition && (
                <span className="flex items-center gap-1 text-white/70 text-xs leading-tight whitespace-nowrap">
                  <proposition.icon size={12} />
                  {proposition.subLabel ?? proposition.label}
                </span>
              )}
            </Link>
            {!isLineDetail && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link
                      to={nextOrder ? `/order/detail?id=${nextOrder.orderNo}` : '#'}
                      aria-disabled={!nextOrder}
                      className={`flex items-center justify-center text-white transition-colors ${nextOrder ? 'hover:text-white/70' : 'pointer-events-none opacity-30'}`}
                    />
                  }
                >
                  <ChevronRightFilled size={20} />
                </TooltipTrigger>
                <TooltipContent>Next Order</TooltipContent>
              </Tooltip>
            )}
          </div>
        ) : (
          <>
            <Link to="/order-summary" className="text-white font-bold text-base leading-tight whitespace-nowrap no-underline hover:text-white/80 transition-colors">
              {pageTitle}
            </Link>
            {isDash ? (
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-xs leading-tight whitespace-nowrap">
                  Last refreshed {refreshedAtLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setDashRefreshedAt(new Date())}
                  className="text-white/70 text-xs leading-tight whitespace-nowrap underline hover:text-white transition-colors"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Refresh
                </button>
              </div>
            ) : isOrderSummary ? (
              <div className="flex items-center gap-2">
                <span className="text-white/70 text-xs leading-tight whitespace-nowrap">{orderSummaryRefreshedAtLabel}</span>
                <button
                  type="button"
                  onClick={() => setOrderSummaryRefreshedAt(new Date())}
                  className="text-white/70 text-xs leading-tight whitespace-nowrap underline hover:text-white transition-colors"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Refresh
                </button>
              </div>
            ) : isStoreSelectorView ? (
              <span className="text-white/70 text-xs leading-tight whitespace-nowrap">
                Version {APP_VERSION} - as at {VERSION_TIMESTAMP_LABEL}
              </span>
            ) : null}
          </>
        )}
      </div>

      {/* Right — nav links + user menu */}
      <div className="flex items-center gap-3 ml-auto">
        <nav className="flex items-center gap-5">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  to="/order-summary"
                  className={`flex items-center justify-center transition-colors hover:text-white ${pathname === '/order-summary' ? 'text-white' : 'text-white/85'}`}
                />
              }
            >
              <ViewListOutlined size={20} />
            </TooltipTrigger>
            <TooltipContent>Order Summary</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  to="/settings"
                  className={`flex items-center justify-center transition-colors hover:text-white ${pathname === '/settings' ? 'text-white' : 'text-white/85'}`}
                />
              }
            >
              <SettingsOutlined size={20} />
            </TooltipTrigger>
            <TooltipContent>
              Settings/
              <br />
              Admin Console
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  to="/dash"
                  className={`flex items-center justify-center transition-colors hover:text-white ${pathname === '/dash' ? 'text-white' : 'text-white/85'}`}
                />
              }
            >
              <SpeedOutlined size={20} />
            </TooltipTrigger>
            <TooltipContent>Real Time Performance</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  to="/reports"
                  className={`flex items-center justify-center transition-colors hover:text-white ${pathname === '/reports' ? 'text-white' : 'text-white/85'}`}
                />
              }
            >
              <AnalyticsOutlined size={20} />
            </TooltipTrigger>
            <TooltipContent>Reports</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  to="/search-orders"
                  className={`flex items-center justify-center transition-colors hover:text-white ${pathname === '/search-orders' ? 'text-white' : 'text-white/85'}`}
                />
              }
            >
              <SearchOutlined size={20} />
            </TooltipTrigger>
            <TooltipContent>Search</TooltipContent>
          </Tooltip>
        </nav>
        <UserMenu />
      </div>
      </div>
    </header>
  )
}
