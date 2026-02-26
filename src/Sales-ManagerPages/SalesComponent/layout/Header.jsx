import React from "react";
import { useLocation } from "react-router-dom";
import { FiBell, FiSearch } from "react-icons/fi";

export default function Header() {
  const location = useLocation();

  const getPageTitle = () => {
    const titles = {
      "/sales/dashboard": "Sales Dashboard",
      "/sales/work-orders": "Work Orders",
      "/sales/ready-to-dispatch": "Ready to Dispatch",
      "/sales/dispatch-on-challan": "Dispatch on Challan",
      "/sales/dispatch-on-invoice": "Dispatch on Invoice",
      "/sales/unbilled-challans": "Unbilled Challans",
      "/sales/invoice-history": "Invoice History",
      "/sales/purchase-orders": "Purchase Orders",
      "/sales/sales-orders/List": "Sales Orders List",
      "/sales/upload-vendor-invoice": "Upload Vendor Invoice",
      "/sales/debit-credit-notes": "Debit/Credit Notes",
      "/sales/vendor-invoice-history": "Vendor Invoice History",
      "/sales/stock-summary": "Stock Summary",
      "/sales/items-master": "Items Master",
      "/sales/stock-alerts": "Stock Alerts",
      "/sales/reports": "Reports & Analytics",
    };
    return titles[location.pathname] || "Sales Module";
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 className="text-lg font-bold text-slate-800">{getPageTitle()}</h2>
        <p className="text-xs text-slate-400">Sales Operations</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="relative p-2 hover:bg-slate-50 rounded-lg transition-colors">
          <FiBell size={18} className="text-slate-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          <span className="text-xs font-bold text-indigo-600">SP</span>
        </div>
      </div>
    </header>
  );
}
