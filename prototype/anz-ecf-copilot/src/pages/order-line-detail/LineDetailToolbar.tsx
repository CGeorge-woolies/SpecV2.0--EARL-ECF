import { Link } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsIndicator } from '@/components/ui/tabs'
import { ChevronLeftFilled, ChevronRightFilled } from '@/components/icons/material-icons'
import tokens from '@/theme/tokens'

export type LineDetailTab = 'details' | 'substitute'

const ALL_TABS: { key: LineDetailTab; label: string }[] = [
  { key: 'details', label: 'Details' },
  { key: 'substitute', label: 'Substitute' },
]

export function LineDetailToolbar({
  activeTab,
  onTabChange,
  showSubstituteTab,
  prevLineHref,
  nextLineHref,
}: {
  activeTab: LineDetailTab
  onTabChange: (tab: LineDetailTab) => void
  /** Manual subs ("Subs Allowed") disabled for this line — the Substitute tab doesn't apply. */
  showSubstituteTab: boolean
  /** null when there's no adjacent line to navigate to — renders the link disabled. */
  prevLineHref: string | null
  nextLineHref: string | null
}) {
  const tabs = showSubstituteTab ? ALL_TABS : ALL_TABS.filter((tab) => tab.key !== 'substitute')
  return (
    <div
      className="w-screen"
      style={{
        backgroundColor: tokens.colorBgTertiary,
        borderBottom: `1px solid ${tokens.colorBorderWeak}`,
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
      }}
    >
      <div className="relative flex items-center max-w-[1920px] mx-auto px-4 py-3">
        {/* h-9 matches OrderDetailToolbar's icon-lg quick-action buttons (size-9), so this toolbar
            is the same overall height even though this page has no left-side quick actions. */}
        <Link
          to={prevLineHref ?? '#'}
          aria-disabled={!prevLineHref}
          className={`h-9 flex items-center gap-1 text-sm font-medium transition-colors ${
            prevLineHref ? 'hover:opacity-80' : 'pointer-events-none opacity-30'
          }`}
          style={{ color: tokens.colorActionLinkDefault }}
        >
          <ChevronLeftFilled size={18} />
          Previous Line
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as LineDetailTab)}>
            <TabsList className="relative">
              {tabs.map(({ key, label }) => (
                <TabsTrigger key={key} value={key}>
                  {label}
                </TabsTrigger>
              ))}
              <TabsIndicator />
            </TabsList>
          </Tabs>
        </div>

        <Link
          to={nextLineHref ?? '#'}
          aria-disabled={!nextLineHref}
          className={`h-9 flex items-center gap-1 text-sm font-medium transition-colors ml-auto ${
            nextLineHref ? 'hover:opacity-80' : 'pointer-events-none opacity-30'
          }`}
          style={{ color: tokens.colorActionLinkDefault }}
        >
          Next Line
          <ChevronRightFilled size={18} />
        </Link>
      </div>
    </div>
  )
}
