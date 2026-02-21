// ═══════════════════════════════════════════════════════════════════
// ENHANCED SALES MODULE DATA
// Complete workflow: WO Upload → Hold → Challan → Invoice → Stock Update
// PO Creation → Vendor Invoice → Stock Addition
// ═══════════════════════════════════════════════════════════════════

// WORK ORDERS with complete status flow
export const WORK_ORDERS_ENHANCED = [
  {
    id: "WO-2024-001",
    woNumber: "WO-2024-001",
    customer: "ABC Industries Ltd",
    customerContact: "John Smith",
    customerPhone: "+91 98765 43210",
    date: "2024-02-15",
    deliveryDate: "2024-02-25",
    priority: "High",
    status: "material_hold", // material_hold → ready → challan_created → dispatched
    items: [
      { productCode: "PCH-50-10", description: "PPCH-FR COMPOSITE PIPE PN10 50MM", quantity: 100, unit: "m", available: 700, needed: 100 },
      { productCode: "BV-32", description: "BRASS BALL VALVE 32MM", quantity: 20, unit: "pcs", available: 10, needed: 20 },
    ],
    createdBy: "John Doe",
    createdDate: "2024-02-15 09:30 AM",
    totalValue: 75000,
    notes: "Urgent delivery required",
    excelFile: "WO-2024-001.xlsx",
    challanNo: null,
    invoiceNo: null,
    dispatchDate: null,
  },
  {
    id: "WO-2024-002",
    woNumber: "WO-2024-002",
    customer: "XYZ Corporation",
    customerContact: "Sarah Johnson",
    customerPhone: "+91 98765 43211",
    date: "2024-02-16",
    deliveryDate: "2024-02-28",
    priority: "Medium",
    status: "ready", // Store has prepared
    items: [
      { productCode: "FCH-20-1", description: "PPCH COUPLER 20MM", quantity: 50, unit: "pcs", available: 500, needed: 50 },
      { productCode: "GC-110", description: "GRIDER CLAMP 110MM", quantity: 30, unit: "pcs", available: 100, needed: 30 },
    ],
    createdBy: "Mike Johnson",
    createdDate: "2024-02-16 10:15 AM",
    totalValue: 45000,
    notes: "Standard delivery",
    excelFile: "WO-2024-002.xlsx",
    challanNo: null,
    invoiceNo: null,
    dispatchDate: null,
  },
  {
    id: "WO-2024-003",
    woNumber: "WO-2024-003",
    customer: "DEF Enterprises",
    customerContact: "Mike Wilson",
    customerPhone: "+91 98765 43212",
    date: "2024-02-17",
    deliveryDate: "2024-03-01",
    priority: "Low",
    status: "dispatched",
    items: [
      { productCode: "PCH-50-10", description: "PPCH-FR COMPOSITE PIPE PN10 50MM", quantity: 100, unit: "m", available: 600, needed: 100 },
    ],
    createdBy: "John Doe",
    createdDate: "2024-02-17 11:20 AM",
    totalValue: 50000,
    notes: "Regular order",
    excelFile: "WO-2024-003.xlsx",
    challanNo: "CH-2024-001",
    invoiceNo: "INV-2024-001",
    dispatchDate: "2024-02-20",
  },
];

// CHALLANS
export const CHALLANS_ENHANCED = [
  {
    id: "CH-2024-001",
    challanNo: "CH-2024-001",
    workOrderId: "WO-2024-003",
    woNumber: "WO-2024-003",
    customer: "DEF Enterprises",
    date: "2024-02-20",
    dispatchDate: "2024-02-20",
    vehicleNo: "GJ-01-AB-1234",
    driverName: "Rajesh Kumar",
    driverPhone: "+91 98765 00001",
    items: [
      { productCode: "PCH-50-10", description: "PPCH-FR COMPOSITE PIPE PN10 50MM", quantity: 100, unit: "m" },
    ],
    status: "delivered",
    invoiceNo: "INV-2024-001",
    invoiceDate: "2024-02-20",
    createdBy: "John Doe",
    createdDate: "2024-02-20 09:00 AM",
  },
  {
    id: "CH-2024-002",
    challanNo: "CH-2024-002",
    workOrderId: "WO-2024-002",
    woNumber: "WO-2024-002",
    customer: "XYZ Corporation",
    date: "2024-02-19",
    dispatchDate: "2024-02-19",
    vehicleNo: "GJ-02-CD-5678",
    driverName: "Amit Patel",
    driverPhone: "+91 98765 00002",
    items: [
      { productCode: "FCH-20-1", description: "PPCH COUPLER 20MM", quantity: 50, unit: "pcs" },
      { productCode: "GC-110", description: "GRIDER CLAMP 110MM", quantity: 30, unit: "pcs" },
    ],
    status: "in_transit",
    invoiceNo: null,
    invoiceDate: null,
    createdBy: "Mike Johnson",
    createdDate: "2024-02-19 10:30 AM",
  },
];

// CUSTOMER INVOICES
export const CUSTOMER_INVOICES = [
  {
    id: "INV-2024-001",
    invoiceNo: "INV-2024-001",
    type: "customer",
    workOrderId: "WO-2024-003",
    woNumber: "WO-2024-003",
    challanNo: "CH-2024-001",
    customer: "DEF Enterprises",
    date: "2024-02-20",
    dueDate: "2024-03-22",
    amount: 50000,
    gst: 9000,
    totalAmount: 59000,
    status: "paid",
    paymentDate: "2024-02-25",
    items: [
      { productCode: "PCH-50-10", description: "PPCH-FR COMPOSITE PIPE PN10 50MM", quantity: 100, unit: "m", rate: 500, amount: 50000 },
    ],
    createdBy: "John Doe",
    uploadedDate: "2024-02-20 02:00 PM",
    file: "INV-2024-001.pdf",
  },
];

// PURCHASE ORDERS with ETA tracking
export const PURCHASE_ORDERS_ENHANCED = [
  {
    id: "PO-2024-001",
    poNumber: "PO-2024-001",
    vendor: "ABC Suppliers Pvt Ltd",
    vendorContact: "Ramesh Gupta",
    vendorPhone: "+91 98765 11111",
    date: "2024-02-10",
    eta: "2024-02-25",
    etaDays: 15,
    remainingDays: 6, // Calculated
    status: "pending", // pending, warning (2 days), overdue, received
    items: [
      { productCode: "BV-32", description: "BRASS BALL VALVE 32MM", quantity: 100, unit: "pcs", unitPrice: 250, total: 25000 },
    ],
    totalAmount: 25000,
    gst: 4500,
    grandTotal: 29500,
    reason: "Low stock - Below minimum level",
    createdBy: "John Doe",
    createdDate: "2024-02-10 11:00 AM",
    uploadedFile: "PO-2024-001.pdf",
    vendorInvoiceNo: null,
    receivedDate: null,
  },
  {
    id: "PO-2024-002",
    poNumber: "PO-2024-002",
    vendor: "XYZ Traders",
    vendorContact: "Suresh Patel",
    vendorPhone: "+91 98765 22222",
    date: "2024-02-05",
    eta: "2024-02-18",
    etaDays: 13,
    remainingDays: -1, // Overdue
    status: "overdue",
    items: [
      { productCode: "T-TAPE", description: "TEFLON TAPE", quantity: 50, unit: "roll", unitPrice: 50, total: 2500 },
    ],
    totalAmount: 2500,
    gst: 450,
    grandTotal: 2950,
    reason: "Critical stock - Urgent requirement",
    createdBy: "Mike Johnson",
    createdDate: "2024-02-05 09:30 AM",
    uploadedFile: "PO-2024-002.pdf",
    vendorInvoiceNo: null,
    receivedDate: null,
  },
  {
    id: "PO-2024-003",
    poNumber: "PO-2024-003",
    vendor: "DEF Enterprises",
    vendorContact: "Vijay Kumar",
    vendorPhone: "+91 98765 33333",
    date: "2024-02-12",
    eta: "2024-02-21",
    etaDays: 9,
    remainingDays: 2, // Warning - 2 days left
    status: "warning",
    items: [
      { productCode: "PCH-50-10", description: "PPCH-FR COMPOSITE PIPE PN10 50MM", quantity: 100, unit: "m", unitPrice: 500, total: 50000 },
    ],
    totalAmount: 50000,
    gst: 9000,
    grandTotal: 59000,
    reason: "Stock replenishment",
    createdBy: "John Doe",
    createdDate: "2024-02-12 02:00 PM",
    uploadedFile: "PO-2024-003.pdf",
    vendorInvoiceNo: null,
    receivedDate: null,
  },
];

// VENDOR INVOICES
export const VENDOR_INVOICES = [
  {
    id: "VINV-2024-001",
    invoiceNo: "VINV-2024-001",
    vendorInvoiceNo: "VI-5678",
    type: "vendor",
    poId: "PO-2024-001",
    poNumber: "PO-2024-001",
    vendor: "ABC Suppliers Pvt Ltd",
    date: "2024-02-18",
    receivedDate: "2024-02-18",
    amount: 25000,
    gst: 4500,
    totalAmount: 29500,
    status: "received",
    items: [
      { productCode: "BV-32", description: "BRASS BALL VALVE 32MM", ordered: 100, received: 100, unit: "pcs", rate: 250 },
    ],
    qualityCheck: "passed",
    remarks: "All items received in good condition",
    uploadedBy: "John Doe",
    uploadedDate: "2024-02-18 03:00 PM",
    file: "VINV-2024-001.pdf",
  },
];

// NOTIFICATIONS
export const NOTIFICATIONS_ENHANCED = [
  {
    id: 1,
    type: "warning",
    title: "PO Material Arriving Soon",
    message: "PO-2024-003 material arriving in 2 days (Feb 21)",
    time: "2 hours ago",
    read: false,
    action: "/sales/purchase-orders/PO-2024-003",
  },
  {
    id: 2,
    type: "error",
    title: "PO Overdue",
    message: "PO-2024-002 is overdue by 1 day",
    time: "5 hours ago",
    read: false,
    action: "/sales/purchase-orders/PO-2024-002",
  },
  {
    id: 3,
    type: "success",
    title: "Shipment Ready",
    message: "WO-2024-002 prepared by store, ready for dispatch",
    time: "1 day ago",
    read: true,
    action: "/sales/work-orders/WO-2024-002",
  },
  {
    id: 4,
    type: "info",
    title: "Invoice Pending",
    message: "Challan CH-2024-002 dispatched 2 days ago - Invoice pending",
    time: "2 days ago",
    read: false,
    action: "/sales/challans/CH-2024-002",
  },
];

// Helper: Calculate PO status
export const calculatePOStatus = (eta) => {
  const today = new Date();
  const etaDate = new Date(eta);
  const daysRemaining = Math.ceil((etaDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 0) return { status: "overdue", days: Math.abs(daysRemaining) };
  if (daysRemaining <= 2) return { status: "warning", days: daysRemaining };
  return { status: "pending", days: daysRemaining };
};

// Helper: Get dashboard stats
export const getSalesStats = () => ({
  activeWorkOrders: WORK_ORDERS_ENHANCED.filter(wo => wo.status !== 'dispatched').length,
  pendingChallans: CHALLANS_ENHANCED.filter(ch => !ch.invoiceNo).length,
  pendingInvoices: CHALLANS_ENHANCED.filter(ch => ch.status !== 'delivered' && !ch.invoiceNo).length,
  activePOs: PURCHASE_ORDERS_ENHANCED.filter(po => po.status !== 'received').length,
  overduePOs: PURCHASE_ORDERS_ENHANCED.filter(po => po.status === 'overdue').length,
  warningPOs: PURCHASE_ORDERS_ENHANCED.filter(po => po.status === 'warning').length,
  unreadNotifications: NOTIFICATIONS_ENHANCED.filter(n => !n.read).length,
  totalRevenue: CUSTOMER_INVOICES.reduce((sum, inv) => sum + inv.totalAmount, 0),
});
