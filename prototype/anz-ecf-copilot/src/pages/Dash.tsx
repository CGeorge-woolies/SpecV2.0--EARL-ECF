import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsIndicator } from '@/components/ui/tabs'
import tokens from '@/theme/tokens'
import { IndicatorsTab } from './dash/IndicatorsTab'
import { TimelineTab } from './dash/TimelineTab'

type DashTab = 'indicators' | 'timeline'

const TABS: { key: DashTab; label: string }[] = [
  { key: 'indicators', label: 'Indicators' },
  { key: 'timeline', label: 'Timeline' },
]

export default function Dash() {
  const [activeTab, setActiveTab] = useState<DashTab>('indicators')

  return (
    <div className="min-h-full -m-6">
      <div
        className="w-screen"
        style={{
          backgroundColor: tokens.colorBgTertiary,
          borderBottom: `1px solid ${tokens.colorBorderWeak}`,
          marginLeft: 'calc(50% - 50vw)',
          marginRight: 'calc(50% - 50vw)',
        }}
      >
        <div className="relative flex items-center justify-center max-w-[1920px] mx-auto px-4 py-3">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DashTab)}>
            <TabsList className="relative">
              {TABS.map(({ key, label }) => (
                <TabsTrigger key={key} value={key}>
                  {label}
                </TabsTrigger>
              ))}
              <TabsIndicator />
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto">
        {activeTab === 'indicators' ? <IndicatorsTab /> : <TimelineTab />}
      </div>
    </div>
  )
}
