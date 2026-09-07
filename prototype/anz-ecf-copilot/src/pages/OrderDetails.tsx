import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { OrderDetailToolbar, type OrderDetailTab } from './order-detail/OrderDetailToolbar'
import { ManualPickingDialog } from './order-detail/ManualPickingDialog'
import { PrintOrderListDialog } from './order-detail/PrintOrderListDialog'
import { PrintInvoiceDialog } from './order-detail/PrintInvoiceDialog'
import { DemoBcpManualPickingToggle } from './order-detail/DemoBcpManualPickingToggle'
import { ArticlesTab } from './order-detail/ArticlesTab'
import { DetailsTab } from './order-detail/DetailsTab'
import { InstructionsTab } from './order-detail/InstructionsTab'
import { SamplesTab } from './order-detail/SamplesTab'
import { AuditTab } from './order-detail/AuditTab'
import { LabelsTab } from './order-detail/LabelsTab'
import { useEditableField } from './order-detail/useEditableField'
import { useNavigationGuard } from '@/hooks/useNavigationGuard'
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog'
import { getOrderDetailInfo, mapOrderStatusToPickStatus, type PickStatus } from './order-detail/orderDetailData'
import { getOrderInstructions } from './order-detail/instructionsData'
import { getOrderArticles } from './order-detail/articlesData'
import { findOrder } from './order-summary/orderGroups'

const TAB_LABEL: Record<OrderDetailTab, string> = {
  articles: 'Articles',
  details: 'Details',
  instructions: 'Instructions',
  labels: 'Labels',
  samples: 'Samples',
  audit: 'Audit',
}

type OpenDialog = 'manual-picking' | 'print-order-list' | 'print-invoice' | 'move-order' | 'move-line' | null

export default function OrderDetails() {
  const [searchParams] = useSearchParams()
  const orderNo = searchParams.get('id')
  const found = orderNo ? findOrder(orderNo) : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [orderNo])

  const [activeTab, setActiveTab] = useState<OrderDetailTab>('articles')
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const [bcpManualPicking, setBcpManualPicking] = useState(false)
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  // Articles' inline Supplied-edit state lives inside ArticlesTab itself (not lifted here like
  // Details/Instructions) — it only needs to report a dirty boolean up so the page-leave guard
  // and in-page tab-switch confirmation can see it.
  const [isArticlesDirty, setIsArticlesDirty] = useState(false)
  // eStore only: how many Articles-tab lines are selected, so the toolbar's "Move Line from OSR
  // to Shop Floor" quick action knows whether to enable itself. Selection itself stays inside
  // ArticlesTab (same reasoning as isArticlesDirty above) — only the count is reported up.
  const [selectedLineCount, setSelectedLineCount] = useState(0)

  // Details tab form state lives here (not in DetailsTab) so the toolbar's Edit Details/Cancel
  // button and the tab's Save/Discard bar can share a single isDirty across the whole tab.
  const info = getOrderDetailInfo(orderNo ?? '')
  // Status and customer name are seeded from the row the user clicked in Order Summary,
  // rather than the (otherwise-canonical) orderDetailData mock, so they match what was shown there.
  const detailsFields = {
    pickStatus: useEditableField<PickStatus>(found ? mapOrderStatusToPickStatus(found.order.status) : info.pickStatus),
    onHold: useEditableField(found?.order.onHold ?? info.onHold),
    priorityOrder: useEditableField(info.priorityOrder),
    ignoreTransit: useEditableField(info.ignoreTransit),
    ignoreFraudStatus: useEditableField(info.ignoreFraudStatus),
    customerName: useEditableField(found?.order.customer ?? info.customerName),
    mobileNumber: useEditableField(info.mobileNumber),
    phoneNumber: useEditableField(info.phoneNumber),
    workNumber: useEditableField(info.workNumber),
    addressLine1: useEditableField(info.deliveryAddressLines[0]),
    addressLine2: useEditableField(info.deliveryAddressLines[1]),
    addressLine3: useEditableField(info.deliveryAddressLines[2]),
    deliveryDate: useEditableField(info.deliveryDate),
    deliveryWindow: useEditableField(info.deliveryWindow),
    fulfilmentFee: useEditableField(info.fulfilmentFee),
  }

  const isDetailsDirty = Object.values(detailsFields).some((field) => field.isDirty)

  // Instructions tab form state lives here too (not in InstructionsTab), for the same reason —
  // it lets the page-level guard know when the Instructions tab specifically is dirty, so
  // switching away from a dirty tab (not just leaving the page) can be intercepted.
  const instructions = getOrderInstructions(found?.order.orderNo ?? orderNo ?? '')
  const articles = getOrderArticles(found?.order.orderNo ?? orderNo ?? '', found?.order.status ?? '')
  const instructionsFields = {
    personalShopperInstructions: useEditableField(instructions.personalShopperInstructions),
    customerCareInstructions: useEditableField(instructions.customerCareInstructions),
  }

  const isInstructionsDirty = Object.values(instructionsFields).some((field) => field.isDirty)

  const isPageDirty = isDetailsDirty || isInstructionsDirty || isArticlesDirty
  const { isBlocked, confirm, cancel } = useNavigationGuard(isPageDirty)

  const handleSaveDetails = () => {
    // Writes back onto the shared OrderRow object (same reference Order Summary reads), so the
    // hold-highlighting there reflects this edit immediately for the rest of the session.
    if (found) found.order.onHold = detailsFields.onHold.value
    Object.values(detailsFields).forEach((field) => field.commit())
    setIsEditingDetails(false)
  }

  const handleDiscardDetails = () => {
    Object.values(detailsFields).forEach((field) => field.revert())
    setIsEditingDetails(false)
  }

  // Toolbar's "Cancel" button exits edit mode. If fields were changed, that's a discard —
  // confirm it first rather than silently reverting (same guard pattern as tab-switch/leave-page).
  const [showCancelEditConfirm, setShowCancelEditConfirm] = useState(false)

  const handleCancelEditingDetails = () => {
    if (isDetailsDirty) {
      setShowCancelEditConfirm(true)
      return
    }
    setIsEditingDetails(false)
  }

  const confirmCancelEditingDetails = () => {
    handleDiscardDetails()
    setShowCancelEditConfirm(false)
  }

  const dismissCancelEditingDetailsConfirm = () => setShowCancelEditConfirm(false)

  const handleSaveInstructions = () => {
    Object.values(instructionsFields).forEach((field) => field.commit())
  }

  const handleDiscardInstructions = () => {
    Object.values(instructionsFields).forEach((field) => field.revert())
  }

  // Switching tabs isn't a router navigation, so useNavigationGuard/useBlocker doesn't see it —
  // intercept it here and reuse the same confirmation dialog (PRD §8 pattern).
  const [pendingTab, setPendingTab] = useState<OrderDetailTab | null>(null)
  const activeTabIsDirty =
    activeTab === 'details'
      ? isDetailsDirty
      : activeTab === 'instructions'
        ? isInstructionsDirty
        : activeTab === 'articles'
          ? isArticlesDirty
          : false

  const handleTabChange = (tab: OrderDetailTab) => {
    if (tab === activeTab) return
    if (activeTabIsDirty) {
      setPendingTab(tab)
      return
    }
    setActiveTab(tab)
  }

  const confirmTabSwitch = () => {
    if (activeTab === 'details') handleDiscardDetails()
    else if (activeTab === 'instructions') handleDiscardInstructions()
    setActiveTab(pendingTab!)
    setPendingTab(null)
  }

  const cancelTabSwitch = () => setPendingTab(null)

  if (!found) {
    return (
      <div className="min-h-full -m-6 flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">Order not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-full -m-6">
      <OrderDetailToolbar
        order={found.order}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedLineCount={selectedLineCount}
        showManualPicking={bcpManualPicking}
        onOpenManualPicking={() => setOpenDialog('manual-picking')}
        onOpenPrintOrderList={() => setOpenDialog('print-order-list')}
        onOpenPrintInvoice={() => setOpenDialog('print-invoice')}
        onOpenMoveOrder={() => setOpenDialog('move-order')}
        onOpenMoveLine={() => setOpenDialog('move-line')}
        isEditingDetails={isEditingDetails}
        onStartEditingDetails={() => setIsEditingDetails(true)}
        onCancelEditingDetails={handleCancelEditingDetails}
      />

      {activeTab === 'articles' ? (
        <ArticlesTab
          orderNo={found.order.orderNo}
          customerName={found.order.customer}
          statusLabel={found.order.status}
          onDirtyChange={setIsArticlesDirty}
          onSelectedLineCountChange={setSelectedLineCount}
          moveLineDialogOpen={openDialog === 'move-line'}
          onCloseMoveLineDialog={() => setOpenDialog(null)}
          moveOrderDialogOpen={openDialog === 'move-order'}
          onCloseMoveOrderDialog={() => setOpenDialog(null)}
        />
      ) : activeTab === 'details' ? (
          <DetailsTab
            order={found.order}
            orderNo={found.order.orderNo}
            customerName={found.order.customer}
            statusLabel={found.order.status}
            info={info}
            fields={detailsFields}
            isEditingDetails={isEditingDetails}
            isDirty={isDetailsDirty}
            onSave={handleSaveDetails}
            onDiscard={handleDiscardDetails}
          />
        ) : activeTab === 'instructions' ? (
          <InstructionsTab
            orderNo={found.order.orderNo}
            customerName={found.order.customer}
            statusLabel={found.order.status}
            suppliedStatus={found.order.suppliedStatus}
            fields={instructionsFields}
            isDirty={isInstructionsDirty}
            onSave={handleSaveInstructions}
            onDiscard={handleDiscardInstructions}
          />
        ) : activeTab === 'samples' ? (
          <SamplesTab orderNo={found.order.orderNo} customerName={found.order.customer} statusLabel={found.order.status} />
        ) : activeTab === 'audit' ? (
          <AuditTab orderNo={found.order.orderNo} customerName={found.order.customer} statusLabel={found.order.status} />
        ) : (
          <LabelsTab orderNo={found.order.orderNo} customerName={found.order.customer} statusLabel={found.order.status} />
        )}

      <ManualPickingDialog
        open={openDialog === 'manual-picking'}
        onClose={() => setOpenDialog(null)}
        order={found.order}
        info={info}
        instructions={instructions}
        articles={articles}
      />

      <PrintOrderListDialog
        open={openDialog === 'print-order-list'}
        onClose={() => setOpenDialog(null)}
        order={found.order}
        info={info}
        instructions={instructions}
        articles={articles}
      />

      <PrintInvoiceDialog
        open={openDialog === 'print-invoice'}
        onClose={() => setOpenDialog(null)}
      />

      <DemoBcpManualPickingToggle value={bcpManualPicking} onChange={setBcpManualPicking} />

      <UnsavedChangesDialog open={isBlocked} onConfirm={confirm} onCancel={cancel} />
      <UnsavedChangesDialog
        open={pendingTab !== null}
        onConfirm={confirmTabSwitch}
        onCancel={cancelTabSwitch}
        description={`You have unsaved changes on the ${TAB_LABEL[activeTab]} tab. Switching to ${pendingTab ? TAB_LABEL[pendingTab] : ''} will discard them — this can't be undone.`}
        confirmLabel="Discard and switch"
      />
      <UnsavedChangesDialog
        open={showCancelEditConfirm}
        onConfirm={confirmCancelEditingDetails}
        onCancel={dismissCancelEditingDetailsConfirm}
        description="You have unsaved changes on the Details tab. Discarding will revert them to their last saved values — this can't be undone."
        confirmLabel="Discard changes"
      />
    </div>
  )
}
