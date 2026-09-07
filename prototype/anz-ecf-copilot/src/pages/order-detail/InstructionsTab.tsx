import { type ReactNode } from 'react'
import { Users, Headset, Truck } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import tokens from '@/theme/tokens'
import SaveDiscardBar, { SAVE_BAR_HEIGHT } from '@/components/shared/SaveDiscardBar'
import { getOrderInstructions } from './instructionsData'
import { OrderSummaryCard } from './OrderSummaryCard'
import type { EditableField } from './useEditableField'
import type { OrderRow } from '../order-summary/orderGroups'

const MAX_LENGTH = 2000

interface InstructionsTabFields {
  personalShopperInstructions: EditableField<string>
  customerCareInstructions: EditableField<string>
}

interface InstructionsTabProps {
  orderNo: string
  customerName: string
  statusLabel: string
  suppliedStatus: OrderRow['suppliedStatus']
  fields: InstructionsTabFields
  isDirty: boolean
  onSave: () => void
  onDiscard: () => void
}

function InstructionsCard({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <span style={{ color: tokens.colorIconMedium }}>{icon}</span>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function ReadOnlyInstructions({ icon, label, text, emptyText }: { icon: ReactNode; label: string; text: string; emptyText: string }) {
  return (
    <InstructionsCard icon={icon} label={label}>
      {text ? (
        <p style={{ fontSize: tokens.fontSizeBodySm, color: tokens.colorTextStrong }}>{text}</p>
      ) : (
        <p style={{ fontSize: tokens.fontSizeBodySm, color: tokens.colorTextMedium }}>{emptyText}</p>
      )}
    </InstructionsCard>
  )
}

export function InstructionsTab({ orderNo, customerName, statusLabel, suppliedStatus, fields, isDirty, onSave, onDiscard }: InstructionsTabProps) {
  const initial = getOrderInstructions(orderNo)
  const isEditable = suppliedStatus === 'notStarted' || suppliedStatus === 'picking'

  return (
    <div className="min-h-full" style={{ paddingBottom: isEditable && isDirty ? SAVE_BAR_HEIGHT + 24 : 0 }}>
      <div className="flex flex-col p-6" style={{ gap: tokens.spaceContentSmall }}>
      <OrderSummaryCard orderNo={orderNo} customerName={customerName} statusLabel={statusLabel} />
      <div className="grid grid-cols-3" style={{ gap: tokens.spaceContentSmall }}>
        {isEditable ? (
          <>
            <InstructionsCard icon={<Users className="size-4" />} label="Personal Shopper Instructions">
              <Textarea
                value={fields.personalShopperInstructions.value}
                onChange={(e) => fields.personalShopperInstructions.setValue(e.target.value.slice(0, MAX_LENGTH))}
                maxLength={MAX_LENGTH}
                className="min-h-[180px]"
                style={{
                  backgroundColor: fields.personalShopperInstructions.isDirty ? tokens.colorStatusTentativeBgWeak : undefined,
                }}
              />
              <span className="self-end" style={{ fontSize: tokens.fontSizeBodySm, color: tokens.colorTextMedium }}>
                {fields.personalShopperInstructions.value.length}/{MAX_LENGTH}
              </span>
            </InstructionsCard>

            <InstructionsCard icon={<Headset className="size-4" />} label="Customer Care Instructions">
              <Textarea
                value={fields.customerCareInstructions.value}
                onChange={(e) => fields.customerCareInstructions.setValue(e.target.value.slice(0, MAX_LENGTH))}
                maxLength={MAX_LENGTH}
                className="min-h-[180px]"
                style={{
                  backgroundColor: fields.customerCareInstructions.isDirty ? tokens.colorStatusTentativeBgWeak : undefined,
                }}
              />
              <span className="self-end" style={{ fontSize: tokens.fontSizeBodySm, color: tokens.colorTextMedium }}>
                {fields.customerCareInstructions.value.length}/{MAX_LENGTH}
              </span>
            </InstructionsCard>
          </>
        ) : (
          <>
            <ReadOnlyInstructions
              icon={<Users className="size-4" />}
              label="Personal Shopper Instructions"
              text={fields.personalShopperInstructions.value}
              emptyText="No personal shopper instructions"
            />
            <ReadOnlyInstructions
              icon={<Headset className="size-4" />}
              label="Customer Care Instructions"
              text={fields.customerCareInstructions.value}
              emptyText="No customer care instructions"
            />
          </>
        )}

        <ReadOnlyInstructions
          icon={<Truck className="size-4" />}
          label="Delivery Instructions"
          text={initial.deliveryInstructions}
          emptyText="No delivery instructions"
        />
      </div>
      </div>

      {isEditable && (
        <SaveDiscardBar
          isDirty={isDirty}
          message="You have unsaved changes to Instructions."
          onSave={onSave}
          onDiscard={onDiscard}
        />
      )}
    </div>
  )
}
