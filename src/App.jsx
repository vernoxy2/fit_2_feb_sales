import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SalesLayout from "./Sales-ManagerPages/SalesComponent/layout/Layout";
import Dashboard from "./Sales-ManagerPages/Sales-Pages/Dashboard";
import LowStockManagement from "./Sales-ManagerPages/Sales-Pages/LowStockManagement";
import CategoryManagement from "./Sales-ManagerPages/Sales-Pages/CategoryManagement";
import ProductManagement from "./Sales-ManagerPages/Sales-Pages/ProductManagement";
import WorkOrders from "./Sales-ManagerPages/Sales-Pages/WorkOrders";
import ReadyToDispatch from "./Sales-ManagerPages/Sales-Pages/ReadyToDispatch";
import DispatchOnChallan from "./Sales-ManagerPages/Sales-Pages/DispatchOnChallan";
import DispatchOnInvoice from "./Sales-ManagerPages/Sales-Pages/DispatchOnInvoice";
import UnbilledChallans from "./Sales-ManagerPages/Sales-Pages/UnbilledChallans";
import InvoiceHistory from "./Sales-ManagerPages/Sales-Pages/InvoiceHistory";
import CreatePurchaseOrder from "./Sales-ManagerPages/Sales-Pages/CreatePurchaseOrder";
import PurchaseOrderList from "./Sales-ManagerPages/Sales-Pages/PurchaseOrderList";
import UploadVendorInvoice from "./Sales-ManagerPages/Sales-Pages/UploadVendorInvoice";
import DebitCreditNotes from "./Sales-ManagerPages/Sales-Pages/DebitCreditNotes";
import VendorInvoiceHistory from "./Sales-ManagerPages/Sales-Pages/VendorInvoiceHistory";
import StockSummary from "./Sales-ManagerPages/Sales-Pages/StockSummary";
import ItemsMaster from "./Sales-ManagerPages/Sales-Pages/ItemsMaster";
import StockAlerts from "./Sales-ManagerPages/Sales-Pages/StockAlerts";
import ReportsAnalytics from "./Sales-ManagerPages/Sales-Pages/ReportsAnalytics";
import UploadWorkOrder from "./Sales-ManagerPages/Sales-Pages/UploadWorkOrder";

// const App = () => {
//   return (
//     <Routes>
//       <Route element={<SalesLayout />}>
//         <Route index element={<Navigate to="dashboard" replace />} />

//         {/* Dashboard */}
//         <Route path="dashboard" element={<Dashboard />} />

//         {/* STOCK MANAGEMENT */}
//         <Route path="low-stock-management" element={<LowStockManagement />} />
//         <Route path="category-management" element={<CategoryManagement />} />
//         <Route path="product-management" element={<ProductManagement />} />
//         <Route path="stock-summary" element={<StockSummary />} />

//         {/* SALES ORDERS */}
//         <Route path="work-orders" element={<WorkOrders />} />
//         <Route path="work-orders/upload" element={<UploadWorkOrder />} />
//         <Route path="ready-to-dispatch" element={<ReadyToDispatch />} />

//         {/* DISPATCH */}
//         <Route path="dispatch-on-challan" element={<DispatchOnChallan />} />
//         <Route path="dispatch-on-invoice" element={<DispatchOnInvoice />} />

//         {/* INVOICING */}
//         <Route path="unbilled-challans" element={<UnbilledChallans />} />
//         <Route path="invoice-history" element={<InvoiceHistory />} />

//         {/* PURCHASES */}
//         <Route path="purchase-orders" element={<PurchaseOrderList />} />
//         <Route path="purchase-orders/create" element={<CreatePurchaseOrder />} />
//         <Route path="upload-vendor-invoice" element={<UploadVendorInvoice />} />
//         <Route path="debit-credit-notes" element={<DebitCreditNotes />} />
//         <Route path="vendor-invoice-history" element={<VendorInvoiceHistory />} />

//         {/* INVENTORY */}
//         <Route path="items-master" element={<ItemsMaster />} />
//         <Route path="stock-alerts" element={<StockAlerts />} />

//         {/* REPORTS */}
//         <Route path="reports" element={<ReportsAnalytics />} />

//         {/* Catch all */}
//         <Route path="*" element={<Navigate to="dashboard" replace />} />
//       </Route>
//     </Routes>
//   );
// };

const App = () => {
  return (
    <Routes>
      {/* ✅ Yahan /sales/* add kiya */}
      <Route path="/sales/*" element={<SalesLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* STOCK MANAGEMENT */}
        <Route path="low-stock-management" element={<LowStockManagement />} />
        <Route path="category-management" element={<CategoryManagement />} />
        <Route path="product-management" element={<ProductManagement />} />
        <Route path="stock-summary" element={<StockSummary />} />

        {/* SALES ORDERS */}
        <Route path="work-orders" element={<WorkOrders />} />
        <Route path="work-orders/upload" element={<UploadWorkOrder />} />
        <Route path="ready-to-dispatch" element={<ReadyToDispatch />} />

        {/* DISPATCH */}
        <Route path="dispatch-on-challan" element={<DispatchOnChallan />} />
        <Route path="dispatch-on-invoice" element={<DispatchOnInvoice />} />

        {/* INVOICING */}
        <Route path="unbilled-challans" element={<UnbilledChallans />} />
        <Route path="invoice-history" element={<InvoiceHistory />} />

        {/* PURCHASES */}
        <Route path="purchase-orders" element={<PurchaseOrderList />} />
        <Route path="purchase-orders/create" element={<CreatePurchaseOrder />} />
        <Route path="upload-vendor-invoice" element={<UploadVendorInvoice />} />
        <Route path="debit-credit-notes" element={<DebitCreditNotes />} />
        <Route path="vendor-invoice-history" element={<VendorInvoiceHistory />} />

        {/* INVENTORY */}
        <Route path="items-master" element={<ItemsMaster />} />
        <Route path="stock-alerts" element={<StockAlerts />} />

        {/* REPORTS */}
        <Route path="reports" element={<ReportsAnalytics />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/sales/dashboard" replace />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/sales/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/sales/dashboard" replace />} />
    </Routes>
  );
};
export default App;