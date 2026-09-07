import { CornerDownRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import tokens from '@/theme/tokens'
import type { ArticleRow } from '@/pages/order-detail/articlesData'
import { DetailRow } from '@/pages/order-detail/DetailRow'
import { accent, TypeBadge } from '@/pages/order-detail/lineAccents'
import { SuppliedInput, SaveButton, DisabledSuppliedInput, type CellEditState } from '@/pages/order-detail/SuppliedInput'

function SuppliedRow({
  label,
  cell,
  committed,
  maxAllowed,
  onChange,
  onFocus,
  onBlur,
  onSave,
}: {
  label: string
  cell: CellEditState
  committed: number
  maxAllowed?: number
  onChange: (v: number) => void
  onFocus: () => void
  onBlur: () => void
  onSave: () => void
}) {
  return (
    <DetailRow label={label} dirty={cell.dirty}>
      <div className="flex items-center gap-1">
        <SuppliedInput
          committed={committed}
          draft={cell.draft}
          dirty={cell.dirty}
          maxAllowed={maxAllowed}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <SaveButton visible={!cell.dirty && cell.draft !== committed} disabled={maxAllowed !== undefined && cell.draft > maxAllowed} onClick={onSave} />
      </div>
    </DetailRow>
  )
}

export function DetailsTab({
  row,
  isEditable,
  mainCell,
  onMainChange,
  onMainFocus,
  onMainBlur,
  onMainSave,
  onAddWeight,
  onRemoveWeight,
  silentSubCell,
  onSilentSubChange,
  onSilentSubFocus,
  onSilentSubBlur,
  onSilentSubSave,
}: {
  row: ArticleRow
  isEditable: boolean
  mainCell: CellEditState
  onMainChange: (v: number) => void
  onMainFocus: () => void
  onMainBlur: () => void
  onMainSave: () => void
  onAddWeight: () => void
  onRemoveWeight: (index: number) => void
  silentSubCell: CellEditState
  onSilentSubChange: (v: number) => void
  onSilentSubFocus: () => void
  onSilentSubBlur: () => void
  onSilentSubSave: () => void
}) {
  const hasWeights = !!row.weights

  return (
    <div className="flex flex-col" style={{ gap: tokens.spaceContentSmall }}>
      <Card>
        <CardHeader className="gap-2">
          <CardTitle>{row.description}</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailRow label="Article Number" value={row.articleNo} />
          <DetailRow label="Unit of Measure (UOM)" value="<UnitOfMeasure>" />
          <DetailRow label="Volume Size" value={row.volume} />

          <Separator />

          <DetailRow label="Ordered Quantity" value={row.ordered} />
          {hasWeights ? (
            <DetailRow label="Supplied Quantity" value={<DisabledSuppliedInput value={row.supplied} />} />
          ) : isEditable ? (
            <SuppliedRow
              label="Supplied Quantity"
              cell={mainCell}
              committed={row.supplied}
              maxAllowed={row.ordered}
              onChange={onMainChange}
              onFocus={onMainFocus}
              onBlur={onMainBlur}
              onSave={onMainSave}
            />
          ) : (
            <DetailRow label="Supplied Quantity" value={row.supplied} />
          )}

          {hasWeights && (
            <>
              <Separator />
              <DetailRow label="Actual Weight Supplied" labelWidth="180px">
                <div className="flex flex-col" style={{ gap: tokens.spaceInternalMedium }}>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="text-left px-2 py-1.5 border-b font-medium" style={{ borderColor: tokens.colorBorderWeak, color: tokens.colorTextMedium }}>
                          No.
                        </th>
                        <th className="text-left px-2 py-1.5 border-b font-medium" style={{ borderColor: tokens.colorBorderWeak, color: tokens.colorTextMedium }}>
                          Weight (g)
                        </th>
                        {isEditable && (
                          <th className="border-b" style={{ borderColor: tokens.colorBorderWeak }} aria-hidden />
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {row.weights!.map((w, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1.5 border-b" style={{ borderColor: tokens.colorBorderWeak }}>
                            {i + 1}
                          </td>
                          <td className="px-2 py-1.5 border-b" style={{ borderColor: tokens.colorBorderWeak }}>
                            {w.toLocaleString()}g
                          </td>
                          {isEditable && (
                            <td className="px-2 py-1.5 border-b text-right" style={{ borderColor: tokens.colorBorderWeak }}>
                              <Button
                                type="button"
                                variant="link"
                                size="xs"
                                onClick={() => onRemoveWeight(i)}
                                className="h-auto p-0"
                              >
                                Remove
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {isEditable && (
                    <Button onClick={onAddWeight} className="self-start">
                      + Add Weight
                    </Button>
                  )}
                </div>
              </DetailRow>
            </>
          )}

          <Separator />

          <DetailRow label="Personal Shopper Notes" value="<PersonalShopperNotes>" />
        </CardContent>
      </Card>

      {row.silentSub && (
        <div className="flex items-start" style={{ gap: tokens.spaceInternalMedium }}>
          <CornerDownRight className="size-5 shrink-0 mt-4" style={{ color: accent.slt.text }} />
          <Card className="flex-1">
            <CardHeader className="gap-2">
              <TypeBadge label="SILENT SUB" bg={accent.slt.bg} border={accent.slt.border} text={accent.slt.text} />
              <CardTitle>{row.silentSub.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow label="Article Number" value={row.silentSub.articleNo} />
              <DetailRow label="Unit of Measure (UOM)" value="<UnitOfMeasure>" />

              <Separator />

              {isEditable ? (
                <SuppliedRow
                  label="Supplied Quantity"
                  cell={silentSubCell}
                  committed={row.silentSub.supplied}
                  onChange={onSilentSubChange}
                  onFocus={onSilentSubFocus}
                  onBlur={onSilentSubBlur}
                  onSave={onSilentSubSave}
                />
              ) : (
                <DetailRow label="Supplied Quantity" value={row.silentSub.supplied} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
