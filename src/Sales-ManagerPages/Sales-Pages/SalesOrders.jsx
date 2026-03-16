import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPackage, FiTruck, FiFileText, FiShoppingCart,
  FiAlertTriangle, FiClock, FiShield, FiCheckCircle
} from "react-icons/fi";
import { KPICard, Card, CardHeader, Alert, StatusBadge } from "../SalesComponent/ui/index";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

function parseDate(dateStr) {
  if (!dateStr) return null;
  const shortMonthMatch = dateStr.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (shortMonthMatch) {
    const [, day, month, year] = shortMonthMatch;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return new Date(`${day} ${month} ${fullYear}`);
  }
  return new Date(dateStr);
}

function getDaysFromToday(dateStr) {
  const date = parseDate(dateStr);
  if (!date || isNaN(date)) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date - today) / (1000 * 60 * 60 * 24));
}

function derivePoStatus(deliveryDateRaw, poStatus) {
  if (poStatus === "complete") return "complete";
  const days = getDaysFromToday(deliveryDateRaw);
  if (days === null) return "pending";
  if (days < 0) return "overdue";
  if (days <= 2) return "warning";
  return "pending";
}

function formatDate(dateStr) {
  const date = parseDate(dateStr);
  if (!date || isNaN(date)) return dateStr || "";
  return date.toISOString().split("T")[0];
}

function isPO(type) {
  if (!type) return false;
  const t = type.trim().toLowerCase().replace(/[\s_\-\.]/g, "");
  return ["po", "purchaseorder", "purchase"].includes(t);
}

function isSalesOrder(type) {
  if (!type) return false;
  const t = type.trim().toLowerCase().replace(/[\s_\-\.]/g, "");
  return ["salesorder", "so", "workorder", "wo", "sales", "sales_order"].includes(t);
}

// ✅ Status badge with waiting_for_qc + ready_for_dispatch support
function SoStatusChip({ status }) {
  const map = {
    active:              "bg-blue-100 text-blue-700 border-blue-200",
    waiting_for_qc:      "bg-violet-100 text-violet-700 border-violet-200",
    ready_for_dispatch:  "bg-emerald-100 text-emerald-700 border-emerald-200",
    complete:            "bg-slate-100 text-slate-600 border-slate-200",
  };
  const label = {
    active:              "Active",
    waiting_for_qc:      "Waiting for QC",
    ready_for_dispatch:  "Ready for Dispatch",
    complete:            "Complete",
  };
  const s = status || "active";
  return (
    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase ${map[s] || map.active}`}>
      {label[s] || s.replace(/_/g, " ")}
    </span>
  );
}

export default function SalesOrder() {
  const navigate = useNavigate();
  const [showAlerts, setShowAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [challans, setChallans] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersSnap, challansSnap] = await Promise.all([
          getDocs(collection(db, "excelupload")),
          getDocs(collection(db, "challans")),
        ]);

        const rawChallans = challansSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const allDocs = ordersSnap.docs.map((doc) => {
          const d = doc.data();
          const header = d.excelHeader || d.invoiceHeader || {};
          const deliveryRaw = d.deliveryDate || header.dated || d.eta || "";
          return {
            id: doc.id,
            type: d.type || "",
            soStatus: d.soStatus || "",
            poStatus: d.poStatus || "",
            woNumber: header.reference || d.invoiceNo || d.woNumber || `SO-${doc.id.slice(0, 8).toUpperCase()}`,
            customer: d.customer || header.consignee || "",
            deliveryDate: formatDate(deliveryRaw),
            _deliveryDateRaw: deliveryRaw,
            totalValue: d.totalValue || d.grandTotal || 0,
            items: d.items || [],
            createdAt: d.createdAt || null,
            poNumber: d.invoiceNo || header.reference || d.poNumber || d.wonumber || `PO-${doc.id.slice(0, 8).toUpperCase()}`,
            vendor: header.buyer || d.vendor || header.companyName || header.consignee || "—",
            grandTotal: d.totalValue || d.grandTotal || 0,
            eta: formatDate(deliveryRaw),
          };
        });

        // ✅ Map soStatus to display status — all 4 stages
        const salesOrders = allDocs
          .filter((d) => isSalesOrder(d.type))
          .map((so) => ({
            ...so,
            status: so.soStatus === "complete"            ? "complete"
                  : so.soStatus === "waiting_for_qc"      ? "waiting_for_qc"
                  : so.soStatus === "ready_for_dispatch"   ? "ready_for_dispatch"
                  : "active",
          }));

        const poOrders = allDocs
          .filter((d) => isPO(d.type))
          .map((po) => ({
            ...po,
            status: derivePoStatus(po._deliveryDateRaw, po.poStatus),
            remainingDays: getDaysFromToday(po._deliveryDateRaw),
          }));

        setWorkOrders(salesOrders);
        setPurchaseOrders(poOrders);
        setChallans(rawChallans);
      } catch (err) {
        console.error("Firebase fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const recentWorkOrders = workOrders.slice(0, 5);

  const stats = {
    activeWorkOrders:    workOrders.filter((wo) => wo.soStatus !== "complete").length,
    waitingQC:           workOrders.filter((wo) => wo.soStatus === "waiting_for_qc").length,
    readyForDispatch:    workOrders.filter((wo) => wo.soStatus === "ready_for_dispatch").length,
    pendingChallans:     challans.filter((ch) => !ch.invoiceUrl && !ch.invoiceNumber).length,
    totalPOs:            purchaseOrders.length,
    overduePOs:          purchaseOrders.filter((po) => po.status === "overdue").length,
    warningPOs:          purchaseOrders.filter((po) => po.status === "warning").length,
    completedPOs:        purchaseOrders.filter((po) => po.status === "complete").length,
    pendingInvoices:     challans.filter((ch) => !ch.invoiceUrl && !ch.invoiceNumber).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Sales Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time overview of sales operations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/sales/sales-orders/create")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiFileText size={14} /> Create Sales Order
          </button>
          <button
            onClick={() => navigate("/sales/sales-orders/upload")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiFileText size={14} /> Upload Sales Order
          </button>
        </div>
      </div>

      {/* Alerts */}
      {showAlerts && (stats.overduePOs > 0 || stats.warningPOs > 0) && (
        <Alert type="warning" onClose={() => setShowAlerts(false)}>
          <div className="space-y-1">
            <p className="font-bold">⚠️ Urgent Attention Required:</p>
            {stats.overduePOs > 0 && <p>• {stats.overduePOs} Purchase Orders are overdue</p>}
            {stats.warningPOs > 0 && <p>• {stats.warningPOs} Purchase Orders arriving in 2 days</p>}
            {stats.pendingInvoices > 0 && <p>• {stats.pendingInvoices} Challans pending invoice upload</p>}
          </div>
        </Alert>
      )}

      {/* ✅ SO Status Pipeline Banner */}
      {(stats.waitingQC > 0 || stats.readyForDispatch > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {stats.waitingQC > 0 && (
            <div className="flex items-center gap-4 p-4 bg-violet-50 border border-violet-200 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <FiShield size={20} className="text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-violet-800">{stats.waitingQC} SO(s) Waiting for QC</p>
                <p className="text-xs text-violet-600 mt-0.5">Store team needs to verify quality</p>
              </div>
            </div>
          )}
          {stats.readyForDispatch > 0 && (
            <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <FiCheckCircle size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-emerald-800">{stats.readyForDispatch} SO(s) Ready for Dispatch</p>
                <p className="text-xs text-emerald-600 mt-0.5">QC approved — dispatch now</p>
              </div>
              <button
                onClick={() => navigate("/sales/dispatch-on-challan")}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
              >
                Dispatch →
              </button>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Work Orders" value={stats.activeWorkOrders} icon={FiPackage} color="blue" onClick={() => navigate("/sales/sales-orders/list")} />
        <KPICard label="Pending Challans" value={stats.pendingChallans} icon={FiTruck} color="purple" onClick={() => navigate("/sales/unbilled-challans")} />
        <KPICard label="Total Purchase Orders" value={stats.totalPOs} icon={FiShoppingCart} color="indigo" onClick={() => navigate("/sales/purchase-orders")} />
        <KPICard label="Overdue POs" value={stats.overduePOs} icon={FiAlertTriangle} color="red" onClick={() => navigate("/sales/purchase-orders")} />
      </div>

      {/* Recent Sales Orders */}
      <Card>
        <CardHeader
          title="Recent Sales Orders"
          subtitle={`${stats.activeWorkOrders} active orders`}
          action={<button onClick={() => navigate("/sales/sales-orders/list")} className="text-xs text-indigo-600 font-bold hover:text-indigo-700">View All →</button>}
        />
        <div className="divide-y divide-slate-50">
          {recentWorkOrders.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-slate-400">No sales orders found.</p>
            </div>
          ) : (
            recentWorkOrders.map((wo) => (
              <div
                key={wo.id}
                className={`px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                  wo.status === "ready_for_dispatch" ? "bg-emerald-50/40" :
                  wo.status === "waiting_for_qc" ? "bg-violet-50/40" : ""
                }`}
                onClick={() => navigate("/sales/sales-orders/list")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-800">{wo.woNumber}</p>
                      <SoStatusChip status={wo.status} />
                    </div>
                    <p className="text-xs text-slate-600">{wo.customer}</p>
                    <p className="text-xs text-slate-400 mt-1">Delivery: {wo.deliveryDate}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          <button onClick={() => navigate("/sales/sales-orders/upload")}
            className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center">
            <FiPackage className="mx-auto mb-2 text-indigo-600" size={24} />
            <p className="text-xs font-bold text-slate-700">Upload Sales Order</p>
          </button>
          <button onClick={() => navigate("/sales/dispatch-on-challan")}
            className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-center">
            <FiTruck className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-xs font-bold text-slate-700">Dispatch on Challan</p>
          </button>
          <button onClick={() => navigate("/sales/upload-sales-invoice")}
            className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all text-center">
            <FiFileText className="mx-auto mb-2 text-amber-600" size={24} />
            <p className="text-xs font-bold text-slate-700">Upload Invoice</p>
          </button>
        </div>
      </Card>
    </div>
  );
}