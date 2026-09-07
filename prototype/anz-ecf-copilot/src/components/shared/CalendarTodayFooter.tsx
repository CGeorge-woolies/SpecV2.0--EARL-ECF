import { Button } from '@/components/ui/button'

export function CalendarTodayFooter({ onClick }: { onClick: () => void }) {
  return (
    <div className="border-t p-1">
      <Button variant="ghost" size="sm" className="w-full justify-center" onClick={onClick}>
        Today
      </Button>
    </div>
  )
}
