export interface AuditRow {
  actionDate: string
  user: string
  action: string
  lineNo: string
  message: string
}

const NZ_AUDIT_LOG: AuditRow[] = [
  { actionDate: '11/07/2026 7:15:31 a.m.', user: 'ECFUserPBY', action: 'Package Type Changed', lineNo: '', message: 'Package type changed from Paper Bags to' },
  { actionDate: '11/07/2026 8:08:54 a.m.', user: 'ECFUserPBY', action: 'Locker allocated', lineNo: '', message: 'Order locker status changed to Allocated' },
  { actionDate: '11/07/2026 8:15:13 a.m.', user: 'Lockers', action: 'Loaded in locker', lineNo: '', message: 'Order is loaded in the locker' },
  { actionDate: '11/07/2026 8:28:55 a.m.', user: 'DPS', action: 'DPS Sent', lineNo: '', message: 'Digital Packing Slip sent to customeremail@mail.com' },
  { actionDate: '11/07/2026 10:20:32 a.m.', user: 'Lockers', action: 'Collected from locker', lineNo: '', message: 'Order is collected by the customer from locker' },
]

const AU_AUDIT_LOG: AuditRow[] = [
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit', lineNo: '', message: 'Order audit complete' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '27', message: '' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '26', message: '' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '25', message: '' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '24', message: '' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '23', message: '' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '22', message: '' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '21', message: '' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '20', message: '' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '19', message: '' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '18', message: '' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '17', message: '' },
  { actionDate: '07/07/2026 02:48:39 AM', user: '1268221', action: 'Order Audit Adjustments', lineNo: '16', message: '' },
]

export function getOrderAuditLog(_orderNo: string, isNZ: boolean): AuditRow[] {
  return isNZ ? NZ_AUDIT_LOG : AU_AUDIT_LOG
}
