import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft, FiFileText, FiPackage, FiCheck,
  FiAlertTriangle, FiClock, FiTruck, FiEye,
} from "react-icons/fi";
import { db } from "../../firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";

// ── Status Pill ────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    reserved: "bg-blue-50 text-blue-700 border-blue-200",
    partial:  "bg-orange-50 text-orange-700 border-orange-200",
    complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
    excess:   "bg-purple-50 text-purple-700 border-purple-200",
  };
  const labels = {
    reserved: "RESERVED",
    partial:  "PARTIAL",
    complete: "COMPLETE",
    excess:   "EXCESS",
  };
  return (
    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${map[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {labels[status] || status?.toUpperCase()}
    </span>
  );
}

// ── Item Status ────────────────────────────────────────────────────────────────
function getItemStatus(orderedQty, totalInvoicedQty) {
  if (totalInvoicedQty === 0)          return "reserved";
  if (totalInvoicedQty < orderedQty)   return "partial";
  if (totalInvoicedQty === orderedQty) return "complete";
  return "excess";
}

// ── Format Date ───────────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return str; }
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SOCompleteDetails() {
  const navigate  = useNavigate();
  const { soId }  = useParams();

  const [so,       setSo]       = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);

  // ── Fetch SO + linked invoices ────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch the SO document
        const soSnap = await getDoc(doc(db, "excelupload", soId));
        if (!soSnap.exists()) { setLoading(false); return; }
        const soData = { id: soSnap.id, ...soSnap.data() };
        setSo(soData);

        // 2. Fetch linked SALES_INVOICE documents
        const invSnap = await getDocs(
          query(
            collection(db, "excelupload"),
            where("linkedSoId", "==", soId),
          )
        );
        const invs = invSnap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(d => d.type === "SALES_INVOICE")
          .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
        setInvoices(invs);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [soId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!so) {
    return (
      <div className="text-center py-20 text-slate-400">
        <FiFileText size={40} className="mx-auto mb-3" />
        <p className="font-bold">Sales Order not found</p>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const soNumber    = so.woNumber || so.excelHeader?.voucherNo || so.id.slice(0, 8).toUpperCase();
  const customer    = so.customer || so.excelHeader?.buyer || so.excelHeader?.consignee || "—";
  const soDate      = so.excelHeader?.dated || "";
  const soStatus    = so.soStatus || "reserved";
  const items       = so.items || [];

  const totalOrdered   = items.reduce((s, i) => s + (i.orderedQty || i.quantity || 0), 0);
  const totalInvoiced  = items.reduce((s, i) => s + (i.totalInvoicedQty || 0), 0);
  const createdAt      = so.createdAt ? fmtDate(so.createdAt) : "—";
  const lastInvoiceAt  = so.lastInvoiceAt ? fmtDate(so.lastInvoiceAt) : null;

  const allComplete    = items.every(i => getItemStatus(i.orderedQty || 0, i.totalInvoicedQty || 0) === "complete");
  const completedCount = items.filter(i => getItemStatus(i.orderedQty || 0, i.totalInvoicedQty || 0) === "complete").length;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FiArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-800">{soNumber}</h2>
              <StatusPill status={soStatus} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Sales Order — Dispatch History</p>
          </div>
        </div>

        {/* Days badge */}
        <div className="text-right">
          <div className="text-2xl font-black text-indigo-600">
            {invoices.length}
          </div>
          <p className="text-xs text-slate-400">invoices processed</p>
        </div>
      </div>

      {/* ── Info Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">SO Number</p>
          <p className="text-sm font-black text-slate-800">{soNumber}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Customer</p>
          <p className="text-sm font-black text-slate-800 truncate">{customer}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">SO Date</p>
          <p className="text-sm font-black text-slate-800">{soDate || "—"}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
          <StatusPill status={soStatus} />
        </div>
      </div>

      {/* ── Units Summary ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
          <p className="text-3xl font-black text-slate-700">{items.length}</p>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">Total Items</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
          <p className="text-3xl font-black text-slate-700">{totalOrdered}</p>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">Units Ordered</p>
        </div>
        <div className={`rounded-xl p-5 text-center border ${
          soStatus === "complete" ? "bg-emerald-50 border-emerald-200" :
          soStatus === "partial"  ? "bg-orange-50 border-orange-200"  :
          "bg-slate-50 border-slate-200"
        }`}>
          <p className={`text-3xl font-black ${
            soStatus === "complete" ? "text-emerald-600" :
            soStatus === "partial"  ? "text-orange-600"  :
            "text-slate-700"
          }`}>{totalInvoiced}</p>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">Units Invoiced</p>
        </div>
      </div>

      {/* ── Timeline + Invoices ── */}
      <div className="grid grid-cols-2 gap-5">

        {/* Receipt Timeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm font-black text-slate-700 mb-1">Dispatch Timeline</p>
          <p className="text-xs text-slate-400 mb-4">{invoices.length} invoices processed</p>

          <div className="space-y-4">
            {/* SO Created */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiFileText size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">SO Created</p>
                <p className="text-xs text-slate-400">{createdAt}</p>
              </div>
            </div>

            {/* Each invoice */}
            {invoices.map((inv, idx) => (
              <div key={inv.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiTruck size={13} className="text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-700">
                      Invoice #{idx + 1}: {inv.invoiceNo || "—"}
                    </p>
                    <p className="text-xs text-slate-400">{fmtDate(inv.createdAt)}</p>
                  </div>
                  <p className="text-xs text-slate-400">{inv.customer || customer}</p>
                </div>
              </div>
            ))}

            {/* Completed */}
            {soStatus === "complete" && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiCheck size={14} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700">SO Completed ✓</p>
                  <p className="text-xs text-slate-400">{lastInvoiceAt || createdAt}</p>
                </div>
              </div>
            )}

            {/* Pending */}
            {soStatus === "partial" && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiClock size={14} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-700">Pending Dispatch</p>
                  <p className="text-xs text-slate-400">{totalOrdered - totalInvoiced} units remaining</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoices Received */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm font-black text-slate-700 mb-1">Invoices Sent</p>
          <p className="text-xs text-slate-400 mb-4">{invoices.length} total invoices</p>

          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-300">
              <FiFileText size={32} className="mb-2" />
              <p className="text-xs font-bold">No invoice records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv, idx) => {
                const invTotal = (inv.items || []).reduce((s, i) => s + (i.newInvoiced || 0), 0);
                return (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{inv.invoiceNo || `Invoice ${idx + 1}`}</p>
                        <p className="text-[10px] text-slate-400">{fmtDate(inv.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600">+{invTotal} units</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Product Dispatch Summary ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-black text-slate-700">Product Dispatch Summary</p>
            <p className="text-xs text-slate-400">Ordered vs invoiced — per item breakdown</p>
          </div>
          {allComplete && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <FiCheck size={12} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700">All {items.length} items complete</span>
            </div>
          )}
          {!allComplete && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full">
              <FiAlertTriangle size={12} className="text-orange-600" />
              <span className="text-xs font-bold text-orange-700">{completedCount}/{items.length} items complete</span>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase">Product Code</th>
                <th className="text-left py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase">Description</th>
                <th className="text-center py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase">Ordered</th>
                <th className="text-center py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase">Total Invoiced</th>
                <th className="text-center py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item, idx) => {
                const ordered   = item.orderedQty || item.quantity || 0;
                const invoiced  = item.totalInvoicedQty || 0;
                const status    = getItemStatus(ordered, invoiced);
                const pct       = ordered > 0 ? Math.min(100, Math.round((invoiced / ordered) * 100)) : 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs font-bold text-slate-700">{item.productCode || "—"}</span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-xs text-slate-600 max-w-[200px] truncate">{item.description || "—"}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-sm font-bold text-slate-700">{ordered}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">{item.unit || "pcs"}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-bold ${
                          status === "complete" ? "text-emerald-600" :
                          status === "excess"   ? "text-purple-600"  :
                          status === "partial"  ? "text-orange-600"  :
                          "text-slate-400"
                        }`}>
                          {invoiced} <span className="text-[10px] font-normal text-slate-400">{item.unit || "pcs"}</span>
                        </span>
                        {/* Progress bar */}
                        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              status === "complete" ? "bg-emerald-500" :
                              status === "excess"   ? "bg-purple-500"  :
                              status === "partial"  ? "bg-orange-400"  :
                              "bg-slate-300"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <StatusPill status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}