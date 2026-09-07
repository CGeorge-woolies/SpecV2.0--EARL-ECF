import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import tokens from '@/theme/tokens'
import { usePageTitle } from '@/hooks/usePageTitle'

export function AppShell() {
  usePageTitle()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main
        style={{
          marginTop: tokens.headerHeight,
          flex: 1,
          backgroundColor: tokens.colorBgPrimary,
          padding: '24px',
        }}
      >
        <div className="max-w-[1920px] mx-auto">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
