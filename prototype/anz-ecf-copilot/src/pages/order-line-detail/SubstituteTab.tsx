import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import tokens from '@/theme/tokens'
import type { ArticleSubRow } from '@/pages/order-detail/articlesData'
import { DetailRow } from '@/pages/order-detail/DetailRow'
import { accent, TypeBadge } from '@/pages/order-detail/lineAccents'
import { SuppliedInput, SaveButton, type CellEditState } from '@/pages/order-detail/SuppliedInput'

function formatMoney(value: number | undefined) {
  if (value === undefined) return ''
  return `$${value.toFixed(2)}`
}

function SubstituteCard({
  substitute,
  isEditable,
  cell,
  onChange,
  onFocus,
  onBlur,
  onSave,
  onDelete,
}: {
  substitute: ArticleSubRow
  isEditable: boolean
  cell: CellEditState
  onChange: (v: number) => void
  onFocus: () => void
  onBlur: () => void
  onSave: () => void
  onDelete: () => void
}) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <TypeBadge label="SUBSTITUTE" bg={accent.sub.bg} border={accent.sub.border} text={accent.sub.text} />
        <CardTitle className="flex-1">{substitute.description}</CardTitle>
        <Button variant="link" size="sm" onClick={onDelete}>
          Delete
        </Button>
      </CardHeader>
      <CardContent>
        <DetailRow label="Article Number" value={substitute.articleNo} />
        <DetailRow label="Unit of Measure (UOM)" value="<UnitOfMeasure>" />
        <DetailRow label="Volume Size" value={substitute.volume} />

        <Separator />

        <DetailRow label="Ordered Quantity" value={substitute.ordered} />
        {isEditable ? (
          <DetailRow label="Supplied Quantity" dirty={cell.dirty}>
            <div className="flex items-center gap-1">
              <SuppliedInput committed={substitute.supplied} draft={cell.draft} dirty={cell.dirty} onChange={onChange} onFocus={onFocus} onBlur={onBlur} />
              <SaveButton visible={!cell.dirty && cell.draft !== substitute.supplied} onClick={onSave} />
            </div>
          </DetailRow>
        ) : (
          <DetailRow label="Supplied Quantity" value={substitute.supplied} />
        )}

        <Separator />

        <DetailRow label="Supplied Price" value={formatMoney(substitute.price)} />
        <DetailRow label="Invoice Line Amount" value={formatMoney(substitute.amount)} />
      </CardContent>
    </Card>
  )
}

export function SubstituteTab({
  substitutes,
  isEditable,
  cellFor,
  onSubstituteChange,
  onSubstituteFocus,
  onSubstituteBlur,
  onSubstituteSave,
  onDeleteSubstitute,
  onOpenSearch,
}: {
  substitutes: ArticleSubRow[]
  isEditable: boolean
  cellFor: (articleNo: string, committed: number) => CellEditState
  onSubstituteChange: (articleNo: string, v: number) => void
  onSubstituteFocus: (articleNo: string) => void
  onSubstituteBlur: (articleNo: string, committed: number) => void
  onSubstituteSave: (articleNo: string) => void
  onDeleteSubstitute: (articleNo: string) => void
  onOpenSearch: () => void
}) {
  return (
    <div className="flex flex-col" style={{ gap: tokens.spaceContentSmall }}>
      {isEditable && (
        <Button onClick={onOpenSearch} className="self-start">
          + Add Substitute
        </Button>
      )}

      {substitutes.length === 0 && !isEditable && (
        <p style={{ fontSize: tokens.fontSizeBodySm, color: tokens.colorTextMedium }}>No substitute was supplied for this line.</p>
      )}

      {substitutes.map((substitute) => (
        <SubstituteCard
          key={substitute.articleNo}
          substitute={substitute}
          isEditable={isEditable}
          cell={cellFor(substitute.articleNo, substitute.supplied)}
          onChange={(v) => onSubstituteChange(substitute.articleNo, v)}
          onFocus={() => onSubstituteFocus(substitute.articleNo)}
          onBlur={() => onSubstituteBlur(substitute.articleNo, substitute.supplied)}
          onSave={() => onSubstituteSave(substitute.articleNo)}
          onDelete={() => onDeleteSubstitute(substitute.articleNo)}
        />
      ))}
    </div>
  )
}
