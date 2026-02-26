// ═══════════════════════════════════════════════════════════════════
// ENHANCED SALES MODULE DATA
// Complete workflow: WO Upload → Hold → Challan → Invoice → Stock Update
// PO Creation → Vendor Invoice → Stock Addition
// ═══════════════════════════════════════════════════════════════════

// WORK ORDERS with complete status flow
export const WORK_ORDERS_ENHANCED = [{
    id: "WO-2024-001",
    woNumber: "WO-2024-001",
    customer: "ABC Industries Ltd",
    customerContact: "John Smith",
    customerPhone: "+91 98765 43210",
    date: "2024-02-15",
    deliveryDate: "2024-02-25",
    priority: "High",
    status: "material_hold", // material_hold → ready → challan_created → dispatched
    items: [{
        productCode: "PCH-50-10",
        description: "PPCH-FR COMPOSITE PIPE PN10 50MM",
        quantity: 100,
        unit: "m",
        available: 700,
        needed: 100
      },
      {
        productCode: "BV-32",
        description: "BRASS BALL VALVE 32MM",
        quantity: 20,
        unit: "pcs",
        available: 10,
        needed: 20
      },
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
    items: [{
        productCode: "FCH-20-1",
        description: "PPCH COUPLER 20MM",
        quantity: 50,
        unit: "pcs",
        available: 500,
        needed: 50
      },
      {
        productCode: "GC-110",
        description: "GRIDER CLAMP 110MM",
        quantity: 30,
        unit: "pcs",
        available: 100,
        needed: 30
      },
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
    items: [{
      productCode: "PCH-50-10",
      description: "PPCH-FR COMPOSITE PIPE PN10 50MM",
      quantity: 100,
      unit: "m",
      available: 600,
      needed: 100
    }, ],
    createdBy: "John Doe",
    createdDate: "2024-02-17 11:20 AM",
    totalValue: 50000,
    notes: "Regular order",
    excelFile: "WO-2024-003.xlsx",
    challanNo: "CH-2024-001",
    invoiceNo: "INV-2024-001",
    dispatchDate: "2024-02-20",
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
    items: [{
      productCode: "PCH-50-10",
      description: "PPCH-FR COMPOSITE PIPE PN10 50MM",
      quantity: 100,
      unit: "m",
      available: 600,
      needed: 100
    }, ],
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

export const PRIORITIES = ["normal", "high", "urgent"];

// export const SKUS = [
//   // { id: 1, name: "Bearing 6205-ZZ", stock: 45, unit: "pcs", description: "Deep groove ball bearing" },
//   {
//     id: 2,
//     name: "Copper Wire 1.5mm",
//     stock: 120,
//     unit: "m",
//     description: "Single core copper conductor"
//   },
//   {
//     id: 3,
//     name: "Industrial Filter FX-90",
//     stock: 8,
//     unit: "pcs",
//     description: "High efficiency filter"
//   },
//   {
//     id: 4,
//     name: "Steel Bolt M12x50",
//     stock: 340,
//     unit: "pcs",
//     description: "Hex head bolt with nut"
//   },
//   {
//     id: 5,
//     name: "PVC Pipe 32mm",
//     stock: 60,
//     unit: "m",
//     description: "Schedule 40 PVC pipe"
//   },
//   {
//     id: 6,
//     name: "Hydraulic Oil 46",
//     stock: 25,
//     unit: "ltr",
//     description: "ISO VG 46 hydraulic oil"
//   },
//   {
//     id: 7,
//     name: "Circuit Breaker 32A",
//     stock: 15,
//     unit: "pcs",
//     description: "MCB single pole"
//   },
//   {
//     id: 8,
//     name: "Gasket Sheet 3mm",
//     stock: 110,
//     unit: "pcs",
//     description: "Non-asbestos gasket sheet"
//   },
//   {
//     id: 9,
//     name: "Allen Key Set 8pc",
//     stock: 22,
//     unit: "set",
//     description: "Metric allen key set"
//   },
//   {
//     id: 10,
//     name: "Safety Gloves L",
//     stock: 5,
//     unit: "pair",
//     description: "Cut resistant safety gloves"
//   },
// ];
// CHALLANS
export const CHALLANS_ENHANCED = [{
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
    items: [{
      productCode: "PCH-50-10",
      description: "PPCH-FR COMPOSITE PIPE PN10 50MM",
      quantity: 100,
      unit: "m"
    }, ],
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
    items: [{
        productCode: "FCH-20-1",
        description: "PPCH COUPLER 20MM",
        quantity: 50,
        unit: "pcs"
      },
      {
        productCode: "GC-110",
        description: "GRIDER CLAMP 110MM",
        quantity: 30,
        unit: "pcs"
      },
    ],
    status: "in_transit",
    invoiceNo: null,
    invoiceDate: null,
    createdBy: "Mike Johnson",
    createdDate: "2024-02-19 10:30 AM",
  },
];

// CUSTOMER INVOICES
export const CUSTOMER_INVOICES = [{
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
  items: [{
    productCode: "PCH-50-10",
    description: "PPCH-FR COMPOSITE PIPE PN10 50MM",
    quantity: 100,
    unit: "m",
    rate: 500,
    amount: 50000
  }, ],
  createdBy: "John Doe",
  uploadedDate: "2024-02-20 02:00 PM",
  file: "INV-2024-001.pdf",
}, ];

// PURCHASE ORDERS with ETA tracking
export const PURCHASE_ORDERS_ENHANCED = [{
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
    items: [{
      productCode: "BV-32",
      description: "BRASS BALL VALVE 32MM",
      quantity: 100,
      unit: "pcs",
      unitPrice: 250,
      total: 25000
    }, ],
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
    items: [{
      productCode: "T-TAPE",
      description: "TEFLON TAPE",
      quantity: 50,
      unit: "roll",
      unitPrice: 50,
      total: 2500
    }, ],
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
    items: [{
      productCode: "PCH-50-10",
      description: "PPCH-FR COMPOSITE PIPE PN10 50MM",
      quantity: 100,
      unit: "m",
      unitPrice: 500,
      total: 50000
    }, ],
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
export const VENDOR_INVOICES = [{
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
  items: [{
    productCode: "BV-32",
    description: "BRASS BALL VALVE 32MM",
    ordered: 100,
    received: 100,
    unit: "pcs",
    rate: 250
  }, ],
  qualityCheck: "passed",
  remarks: "All items received in good condition",
  uploadedBy: "John Doe",
  uploadedDate: "2024-02-18 03:00 PM",
  file: "VINV-2024-001.pdf",
}, ];

// NOTIFICATIONS
export const NOTIFICATIONS_ENHANCED = [{
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

  if (daysRemaining < 0) return {
    status: "overdue",
    days: Math.abs(daysRemaining)
  };
  if (daysRemaining <= 2) return {
    status: "warning",
    days: daysRemaining
  };
  return {
    status: "pending",
    days: daysRemaining
  };
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

export const CUSTOMERS = [{
    id: 1,
    name: "Tata Steel Ltd.",
    contact: "+91 98765 43210",
    email: "purchase@tatasteel.com"
  },
  {
    id: 2,
    name: "Larsen & Toubro",
    contact: "+91 98765 43211",
    email: "procurement@lnt.com"
  },
  {
    id: 3,
    name: "Bharat Petroleum",
    contact: "+91 98765 43212",
    email: "materials@bpcl.in"
  },
  {
    id: 4,
    name: "Reliance Industries",
    contact: "+91 98765 43213",
    email: "sourcing@ril.com"
  },
  {
    id: 5,
    name: "ONGC",
    contact: "+91 98765 43214",
    email: "purchase@ongc.in"
  },
  {
    id: 6,
    name: "Hindalco Industries",
    contact: "+91 98765 43215",
    email: "procurement@hindalco.com"
  },
];

export const WORK_ORDERS = [
  {
    id: "WO-2024-0051",
    date: "2026-02-17",
    customer: "Tata Steel Ltd.",
    customerContact: "+91 98765 43210",
    salesPerson: "Rahul Sharma",
    priority: "urgent",
    deliveryDate: "2026-02-20",
    approvalRequired: true,
    status: "pending_approval",
    mode: "manual",
    items: [
      { sku: "Steel Bolt M12x50", description: "Hex head bolt with nut", qty: 150, unit: "pcs", stock: 340, remarks: "" },
      { sku: "Gasket Sheet 3mm", description: "Non-asbestos gasket sheet", qty: 50, unit: "pcs", stock: 110, remarks: "" },
    ],
    specialInstructions: "Urgent requirement - customer production line dependency",
    technicalNotes: "Please verify bolt grade specifications",
    attachment: null,
    createdBy: "Rahul Sharma",
    approvedBy: null,
    approvedDate: null,
    rejectionReason: null,
    technicalComment: null,
  },
  {
    id: "WO-2024-0052",
    date: "2026-02-16",
    customer: "Larsen & Toubro",
    customerContact: "+91 98765 43211",
    salesPerson: "Priya Nair",
    priority: "normal",
    deliveryDate: "2026-02-22",
    approvalRequired: false,
    status: "approved",
    mode: "manual",
    items: [
      { sku: "Bearing 6205-ZZ", description: "Deep groove ball bearing", qty: 40, unit: "pcs", stock: 45, remarks: "Premium grade required" },
    ],
    specialInstructions: "Standard delivery schedule",
    technicalNotes: "",
    attachment: null,
    createdBy: "Priya Nair",
    approvedBy: "Auto-approved",
    approvedDate: "2026-02-16",
    rejectionReason: null,
    technicalComment: null,
  },
  {
    id: "WO-2024-0053",
    date: "2026-02-15",
    customer: "Bharat Petroleum",
    customerContact: "+91 98765 43212",
    salesPerson: "Vikram Singh",
    priority: "high",
    deliveryDate: "2026-02-19",
    approvalRequired: true,
    status: "approved",
    mode: "manual",
    items: [
      { sku: "Hydraulic Oil 46", description: "ISO VG 46 hydraulic oil", qty: 20, unit: "ltr", stock: 25, remarks: "" },
      { sku: "Industrial Filter FX-90", description: "High efficiency filter", qty: 5, unit: "pcs", stock: 8, remarks: "OEM specification" },
    ],
    specialInstructions: "Delivery to site location",
    technicalNotes: "Site requires specific oil grade certification",
    attachment: "spec_sheet.pdf",
    createdBy: "Vikram Singh",
    approvedBy: "Tech Team",
    approvedDate: "2026-02-15",
    rejectionReason: null,
    technicalComment: "Approved - specifications verified",
  },
  {
    id: "WO-2024-0054",
    date: "2026-02-14",
    customer: "ONGC",
    customerContact: "+91 98765 43214",
    salesPerson: "Rahul Sharma",
    priority: "normal",
    deliveryDate: "2026-02-21",
    approvalRequired: true,
    status: "rejected",
    mode: "manual",
    items: [
      { sku: "Safety Gloves L", description: "Cut resistant safety gloves", qty: 50, unit: "pair", stock: 5, remarks: "Insufficient stock" },
    ],
    specialInstructions: "Bulk order",
    technicalNotes: "Check stock availability",
    attachment: null,
    createdBy: "Rahul Sharma",
    approvedBy: null,
    approvedDate: null,
    rejectionReason: "Insufficient stock availability. Current stock: 5 pairs, Required: 50 pairs",
    technicalComment: "Cannot fulfill - stock shortfall of 45 units. Please revise quantity or wait for restock.",
  },
  {
    id: "WO-2024-0055",
    date: "2026-02-13",
    customer: "Reliance Industries",
    customerContact: "+91 98765 43213",
    salesPerson: "Priya Nair",
    priority: "normal",
    deliveryDate: "2026-03-01",
    approvalRequired: false,
    status: "approved",
    mode: "uploaded",
    items: [
      { sku: "PVC Pipe 32mm", description: "Schedule 40 PVC pipe", qty: 200, unit: "m", stock: 60, remarks: "Will arrange from alternate source" },
    ],
    specialInstructions: "Flexible delivery timeline",
    technicalNotes: "",
    attachment: "bulk_order.xlsx",
    createdBy: "Priya Nair",
    approvedBy: "Auto-approved",
    approvedDate: "2026-02-13",
    rejectionReason: null,
    technicalComment: null,
  },
  {
    id: "WO-2024-0056",
    date: "2026-02-17",
    customer: "Hindalco Industries",
    customerContact: "+91 98765 43215",
    salesPerson: "Vikram Singh",
    priority: "urgent",
    deliveryDate: "2026-02-18",
    approvalRequired: true,
    status: "pending_approval",
    mode: "manual",
    items: [
      { sku: "Circuit Breaker 32A", description: "MCB single pole", qty: 10, unit: "pcs", stock: 15, remarks: "" },
      { sku: "Copper Wire 1.5mm", description: "Single core copper conductor", qty: 100, unit: "m", stock: 120, remarks: "BIS certified" },
    ],
    specialInstructions: "Emergency requirement - production breakdown",
    technicalNotes: "Confirm BIS certification availability",
    attachment: null,
    createdBy: "Vikram Singh",
    approvedBy: null,
    approvedDate: null,
    rejectionReason: null,
    technicalComment: null,
  },
  {
    id: "WO-2024-0057",
    date: "2026-02-12",
    customer: "Tata Steel Ltd.",
    customerContact: "+91 98765 43210",
    salesPerson: "Rahul Sharma",
    priority: "normal",
    deliveryDate: "2026-02-25",
    approvalRequired: false,
    status: "dispatched",
    mode: "manual",
    items: [
      { sku: "Allen Key Set 8pc", description: "Metric allen key set", qty: 15, unit: "set", stock: 22, remarks: "" },
    ],
    specialInstructions: "",
    technicalNotes: "",
    attachment: null,
    createdBy: "Rahul Sharma",
    approvedBy: "Auto-approved",
    approvedDate: "2026-02-12",
    rejectionReason: null,
    technicalComment: null,
  },
  {
    id: "DRAFT-001",
    date: "2026-02-17",
    customer: "Larsen & Toubro",
    customerContact: "+91 98765 43211",
    salesPerson: "Priya Nair",
    priority: "normal",
    deliveryDate: "2026-02-28",
    approvalRequired: true,
    status: "draft",
    mode: "manual",
    items: [
      { sku: "Bearing 6205-ZZ", description: "Deep groove ball bearing", qty: 30, unit: "pcs", stock: 45, remarks: "" },
    ],
    specialInstructions: "Draft work order - under preparation",
    technicalNotes: "",
    attachment: null,
    createdBy: "Priya Nair",
    approvedBy: null,
    approvedDate: null,
    rejectionReason: null,
    technicalComment: null,
  },
  {
    id: "WO-2024-0058",
    date: "2026-02-11",
    customer: "Bharat Petroleum",
    customerContact: "+91 98765 43212",
    salesPerson: "Vikram Singh",
    priority: "high",
    deliveryDate: "2026-02-15",
    approvalRequired: true,
    status: "completed",
    mode: "uploaded",
    items: [
      { sku: "Hydraulic Oil 46", description: "ISO VG 46 hydraulic oil", qty: 15, unit: "ltr", stock: 25, remarks: "" },
    ],
    specialInstructions: "Completed and delivered",
    technicalNotes: "",
    attachment: "po_12345.pdf",
    createdBy: "Vikram Singh",
    approvedBy: "Tech Team",
    approvedDate: "2026-02-11",
    rejectionReason: null,
    technicalComment: "Approved",
  },
  {
    id: "DRAFT-002",
    date: "2026-02-17",
    customer: "ONGC",
    customerContact: "+91 98765 43214",
    salesPerson: "Rahul Sharma",
    priority: "normal",
    deliveryDate: "2026-03-05",
    approvalRequired: false,
    status: "draft",
    mode: "manual",
    items: [
      { sku: "Steel Bolt M12x50", description: "Hex head bolt with nut", qty: 100, unit: "pcs", stock: 340, remarks: "" },
      { sku: "Gasket Sheet 3mm", description: "Non-asbestos gasket sheet", qty: 75, unit: "pcs", stock: 110, remarks: "" },
    ],
    specialInstructions: "",
    technicalNotes: "",
    attachment: null,
    createdBy: "Rahul Sharma",
    approvedBy: null,
    approvedDate: null,
    rejectionReason: null,
    technicalComment: null,
  },
];

export const WO_STATUSES = {
  draft: { label: "Draft", color: "slate" },
  pending_approval: { label: "Pending Approval", color: "amber" },
  approved: { label: "Approved", color: "emerald" },
  rejected: { label: "Rejected", color: "red" },
  dispatched: { label: "Dispatched", color: "blue" },
  completed: { label: "Completed", color: "green" },
};