import { useState } from 'react'
import { Briefcase, CalendarIcon, ChevronDown, CreditCard, Package, Phone, Smartphone, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar as DatePickerCalendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectTrigger, SelectIcon, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useStore } from '@/context/StoreContext'
import tokens from '@/theme/tokens'
import SaveDiscardBar, { SAVE_BAR_HEIGHT } from '@/components/shared/SaveDiscardBar'
import { LocationIdChip } from '@/components/shared/LocationIdChip'
import { CalendarTodayFooter } from '@/components/shared/CalendarTodayFooter'
import { FlagMilestoneOrder } from '@/components/icons/material-icons'
import { DetailRow } from './DetailRow'
import { OrderSummaryCard } from './OrderSummaryCard'
import type { EditableField } from './useEditableField'
import { getMilestoneOrderDisplay, getRoutingDisplay, type OrderRow } from '../order-summary/orderGroups'
import { DELIVERY_WINDOW_OPTIONS, PICK_STATUS_LABEL, formatDetailDate, type OrderDetailInfo, type PickStatus } from './orderDetailData'

interface DetailsTabFields {
  pickStatus: EditableField<PickStatus>
  onHold: EditableField<boolean>
  priorityOrder: EditableField<boolean>
  ignoreTransit: EditableField<boolean>
  ignoreFraudStatus: EditableField<boolean>
  customerName: EditableField<string>
  mobileNumber: EditableField<string>
  phoneNumber: EditableField<string>
  workNumber: EditableField<string>
  addressLine1: EditableField<string>
  addressLine2: EditableField<string>
  addressLine3: EditableField<string>
  deliveryDate: EditableField<Date>
  deliveryWindow: EditableField<string>
  fulfilmentFee: EditableField<number>
}

interface DetailsTabProps {
  order: OrderRow
  orderNo: string
  customerName: string
  statusLabel: string
  info: OrderDetailInfo
  fields: DetailsTabFields
  isEditingDetails: boolean
  isDirty: boolean
  onSave: () => void
  onDiscard: () => void
}

const PICK_STATUS_OPTIONS = Object.keys(PICK_STATUS_LABEL) as PickStatus[]

export function DetailsTab({ order, orderNo, customerName, statusLabel, info, fields, isEditingDetails, isDirty, onSave, onDiscard }: DetailsTabProps) {
  const [deliveryDatePopoverOpen, setDeliveryDatePopoverOpen] = useState(false)
  const { isNZ } = useStore()
  const milestone = getMilestoneOrderDisplay(order)

  return (
    <div className="min-h-full" style={{ paddingBottom: isDirty ? SAVE_BAR_HEIGHT + 24 : 0 }}>
      <div className="flex flex-col p-6" style={{ gap: tokens.spaceContentSmall }}>
      <OrderSummaryCard orderNo={orderNo} customerName={customerName} statusLabel={statusLabel} />
      <div className="grid grid-cols-3" style={{ gap: tokens.spaceContentSmall }}>
        {/* Column 1 — Fulfilment */}
        <Card>
          <CardHeader className="gap-2">
            <Package className="size-4" style={{ color: tokens.colorIconMedium }} />
            <CardTitle>Fulfilment</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow label="Status" dirty={fields.pickStatus.isDirty}>
              <Select value={fields.pickStatus.value} onValueChange={(value) => fields.pickStatus.setValue(value as PickStatus)}>
                <SelectTrigger className="gap-0">
                  <Badge
                    variant="outline"
                    className="h-auto gap-1 px-2.5 py-1"
                    style={{
                      borderColor: tokens.colorBorderHighlightWeak,
                      backgroundColor: tokens.colorBgHighlightWeakest,
                      color: tokens.colorTextHighlight,
                    }}
                  >
                    <SelectValue>{PICK_STATUS_LABEL[fields.pickStatus.value]}</SelectValue>
                    <SelectIcon>
                      <ChevronDown className="size-3" />
                    </SelectIcon>
                  </Badge>
                </SelectTrigger>
                <SelectContent>
                  {PICK_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {PICK_STATUS_LABEL[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </DetailRow>
            {isNZ && <DetailRow label="Confirmation Number" value={info.confirmationNumber} />}
            <DetailRow label="Routing">
              <span className="inline-flex items-center gap-1.5">
                {(() => {
                  const routing = getRoutingDisplay(order, isNZ)
                  if (routing.kind === 'locationId') return <LocationIdChip id={routing.value} />
                  if (routing.kind === 'code') return routing.value
                  return null
                })()}
              </span>
            </DetailRow>

            <Separator />

            <DetailRow label="On Hold" dirty={fields.onHold.isDirty}>
              <Checkbox checked={fields.onHold.value} onCheckedChange={(checked) => fields.onHold.setValue(checked === true)} />
            </DetailRow>
            <DetailRow label="Priority Order" dirty={fields.priorityOrder.isDirty}>
              <Checkbox checked={fields.priorityOrder.value} onCheckedChange={(checked) => fields.priorityOrder.setValue(checked === true)} />
            </DetailRow>

            <Separator />

            <DetailRow label="Order Created" value={info.orderCreated} />
            <DetailRow label="Pick Date" value={info.pickDate} />
            <DetailRow label="Delivery Date" dirty={fields.deliveryDate.isDirty}>
              {isEditingDetails ? (
                <Popover open={deliveryDatePopoverOpen} onOpenChange={setDeliveryDatePopoverOpen}>
                  <PopoverTrigger
                    render={<Button variant="outline" size="sm" className="h-7 justify-start gap-1.5 font-normal" />}
                  >
                    <CalendarIcon className="size-3.5" style={{ color: tokens.colorIconMedium }} />
                    {formatDetailDate(fields.deliveryDate.value)}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <DatePickerCalendar
                      mode="single"
                      selected={fields.deliveryDate.value}
                      onSelect={(date) => date && fields.deliveryDate.setValue(date)}
                    />
                    <CalendarTodayFooter
                      onClick={() => {
                        fields.deliveryDate.setValue(new Date())
                        setDeliveryDatePopoverOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                formatDetailDate(fields.deliveryDate.value)
              )}
            </DetailRow>
            <DetailRow label="Delivery Window" dirty={fields.deliveryWindow.isDirty}>
              {isEditingDetails ? (
                <Select value={fields.deliveryWindow.value} onValueChange={fields.deliveryWindow.setValue}>
                  <SelectTrigger className="h-7 w-full justify-between gap-1.5 rounded-lg border border-input px-2.5 text-sm">
                    <SelectValue />
                    <SelectIcon>
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </SelectIcon>
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_WINDOW_OPTIONS.map((window) => (
                      <SelectItem key={window} value={window}>
                        {window}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                fields.deliveryWindow.value
              )}
            </DetailRow>

            <Separator />

            <DetailRow label="Delivery ETA" value={info.deliveryEta} />
            <DetailRow label="Transit Status" value={info.transitStatus} />
            <DetailRow label="Ignore Transit" dirty={fields.ignoreTransit.isDirty}>
              <Checkbox checked={fields.ignoreTransit.value} onCheckedChange={(checked) => fields.ignoreTransit.setValue(checked === true)} />
            </DetailRow>
          </CardContent>
        </Card>

        {/* Column 2 — Customer */}
        <Card>
          <CardHeader className="gap-2">
            {order.isB2B ? (
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex cursor-default" />}>
                  <Briefcase className="size-4" style={{ color: tokens.colorIconMedium }} />
                </TooltipTrigger>
                <TooltipContent>B2B Customer</TooltipContent>
              </Tooltip>
            ) : (
              <User className="size-4" style={{ color: tokens.colorIconMedium }} />
            )}
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow label="Customer Number" value={info.customerNumber} />
            <DetailRow label="Name" dirty={fields.customerName.isDirty}>
              {isEditingDetails ? (
                <Input value={fields.customerName.value} onChange={(e) => fields.customerName.setValue(e.target.value)} className="h-7" />
              ) : (
                fields.customerName.value
              )}
            </DetailRow>
            <DetailRow label="Total Orders">
              <span className="inline-flex items-center gap-1.5">
                {order.orders}
                {milestone && (
                  <Tooltip>
                    <TooltipTrigger render={<span className="inline-flex align-text-bottom cursor-default" />}>
                      <FlagMilestoneOrder
                        size={14}
                        className={milestone.isFirstOrder ? undefined : 'text-foreground'}
                        style={milestone.isFirstOrder ? { color: tokens.colorAlertInfoIcon } : undefined}
                      />
                    </TooltipTrigger>
                    <TooltipContent>{milestone.label}</TooltipContent>
                  </Tooltip>
                )}
              </span>
            </DetailRow>

            <Separator />

            <DetailRow label="Mobile Number" dirty={fields.mobileNumber.isDirty}>
              {isEditingDetails ? (
                <Input value={fields.mobileNumber.value} onChange={(e) => fields.mobileNumber.setValue(e.target.value)} className="h-7" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <Smartphone className="size-3.5" style={{ color: tokens.colorIconMedium }} />
                  {fields.mobileNumber.value}
                </span>
              )}
            </DetailRow>
            <DetailRow label="Phone Number" dirty={fields.phoneNumber.isDirty}>
              {isEditingDetails ? (
                <Input value={fields.phoneNumber.value} onChange={(e) => fields.phoneNumber.setValue(e.target.value)} className="h-7" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" style={{ color: tokens.colorIconMedium }} />
                  {fields.phoneNumber.value}
                </span>
              )}
            </DetailRow>
            <DetailRow label="Work Number" dirty={fields.workNumber.isDirty}>
              {isEditingDetails ? (
                <Input value={fields.workNumber.value} onChange={(e) => fields.workNumber.setValue(e.target.value)} className="h-7" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="size-3.5" style={{ color: tokens.colorIconMedium }} />
                  {fields.workNumber.value}
                </span>
              )}
            </DetailRow>

            <Separator />

            <DetailRow label="Delivery Address 1" dirty={fields.addressLine1.isDirty}>
              {isEditingDetails ? (
                <Input value={fields.addressLine1.value} onChange={(e) => fields.addressLine1.setValue(e.target.value)} className="h-7" />
              ) : (
                fields.addressLine1.value
              )}
            </DetailRow>
            <DetailRow label="Delivery Address 2" dirty={fields.addressLine2.isDirty}>
              {isEditingDetails ? (
                <Input value={fields.addressLine2.value} onChange={(e) => fields.addressLine2.setValue(e.target.value)} className="h-7" />
              ) : (
                fields.addressLine2.value
              )}
            </DetailRow>
            <DetailRow label="Delivery Address 3" dirty={fields.addressLine3.isDirty}>
              {isEditingDetails ? (
                <Input value={fields.addressLine3.value} onChange={(e) => fields.addressLine3.setValue(e.target.value)} className="h-7" />
              ) : (
                fields.addressLine3.value
              )}
            </DetailRow>
          </CardContent>
        </Card>

        {/* Column 3 — Payment & Fraud */}
        <Card>
          <CardHeader className="gap-2">
            <CreditCard className="size-4" style={{ color: tokens.colorIconMedium }} />
            <CardTitle>Payment &amp; Fraud</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow
              label="Order Discount"
              value={`$${info.orderDiscountAmount.toFixed(2)} / ${info.orderDiscountPercent}%`}
            />
            <DetailRow label="Fulfilment Fee" dirty={fields.fulfilmentFee.isDirty}>
              {isEditingDetails ? (
                <Input
                  type="number"
                  step="0.01"
                  value={fields.fulfilmentFee.value}
                  onChange={(e) => fields.fulfilmentFee.setValue(Number(e.target.value))}
                  className="h-7 w-24"
                />
              ) : (
                `$${fields.fulfilmentFee.value.toFixed(2)}`
              )}
            </DetailRow>
            <DetailRow label="Order incl GST" value={`$${info.orderInclGst.toFixed(2)}`} />

            <Separator />

            <DetailRow label="Fraud Status" value={info.fraudStatus} />
            <DetailRow label="Ignore Fraud Status" dirty={fields.ignoreFraudStatus.isDirty}>
              <Checkbox checked={fields.ignoreFraudStatus.value} onCheckedChange={(checked) => fields.ignoreFraudStatus.setValue(checked === true)} />
            </DetailRow>
            <DetailRow label="Fraud Status Ref" value={info.fraudStatusRef} />
          </CardContent>
        </Card>
      </div>
      </div>

      <SaveDiscardBar
        isDirty={isDirty}
        message="You have unsaved changes to Order Details."
        onSave={onSave}
        onDiscard={onDiscard}
      />
    </div>
  )
}
