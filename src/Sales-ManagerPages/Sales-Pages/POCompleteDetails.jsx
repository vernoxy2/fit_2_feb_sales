import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiPackage,
  FiCheck,
  FiClock,
  FiTruck,
  FiUser,
  FiCalendar,
  FiHash,
  FiFileText,
  FiAlertTriangle,
  FiChevronRight,
} from "react-icons/fi";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(val) {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function daysBetween(a, b) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.round(Math.abs((d2 - d1) / (1000 * 60 * 60 * 24)));
}

function StatusBadge({ status }) {
  const map = {
    complete: "bg-emerald-100 text-emerald-700 border-emerald-200",
    partial: "bg-orange-100 text-orange-700 border-orange-200",
    ordered: "bg-blue-100 text-blue-700 border-blue-200",
    excess: "bg-purple-100 text-purple-700 border-purple-200",
    overdue: "bg-red-100 text-red-700 border-red-200",
    received: "bg-teal-100 text-teal-700 border-teal-200",
  };
  return (
    <span
      className={`px-3 py-1 text-xs font-black rounded-full border uppercase tracking-wider ${map[status?.toLowerCase()] || map.ordered}`}
    >
      {status?.replace("_", " ")}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function POCompleteDetails() {
  const navigate = useNavigate();
  const { poId } = useParams(); // Route: /sales/purchase-orders/complete/:poId

  const [po, setPo] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        // 1. Get PO
        const poSnap = await getDoc(doc(db, "excelupload", poId));
        if (!poSnap.exists()) return;
        const poData = { id: poSnap.id, ...poSnap.data() };

        // Guard: only allow if complete
        if (poData.poStatus !== "complete") {
          navigate("/sales/purchase-orders");
          return;
        }

        setPo(poData);

        // 2. Get all INVOICE records linked to this PO
        const invSnap = await getDocs(
          query(
            collection(db, "excelupload"),
            where("type", "==", "INVOICE"),
            where("linkedPoId", "==", poId),
            orderBy("createdAt", "asc"),
          ),
        );
        setInvoices(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [poId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400 font-medium">Loading PO details...</p>
        </div>
      </div>
    );
  }

  if (!po) return null;

  const poNumber = po.woNumber || po.excelHeader?.voucherNo || po.id.slice(0, 8).toUpperCase();
  const vendor = po.customer || po.excelHeader?.supplier || po.excelHeader?.consignee || "—";
  const poDate = po.excelHeader?.dated || po.createdAt || "";
  const eta = po.deliveryDate || "—";
  const items = po.items || [];
  const totalOrdered = items.reduce((s, i) => s + (i.orderedQty || i.quantity || 0), 0);
  const totalReceived = items.reduce((s, i) => s + (i.totalReceivedQty || 0), 0);

  // Timeline events
  const timelineEvents = [
    {
      type: "created",
      label: "PO Created",
      date: po.createdAt,
      icon: FiFileText,
      color: "bg-indigo-100 text-indigo-600 border-indigo-200",
      dot: "bg-indigo-500",
    },
    ...invoices.map((inv, idx) => ({
      type: "invoice",
      label: idx === invoices.length - 1 ? "Final Invoice Received" : `Invoice ${idx + 1} Received`,
      date: inv.createdAt,
      invoiceNo: inv.invoiceNo,
      unitsReceived: (inv.items || []).reduce((s, i) => s + (i.newReceived || 0), 0),
      icon: FiTruck,
      color: idx === invoices.length - 1
        ? "bg-emerald-100 text-emerald-600 border-emerald-200"
        : "bg-orange-100 text-orange-600 border-orange-200",
      dot: idx === invoices.length - 1 ? "bg-emerald-500" : "bg-orange-400",
    })),
    {
      type: "complete",
      label: "PO Completed ✓",
      date: po.receivedAt || po.lastInvoiceAt,
      icon: FiCheck,
      color: "bg-emerald-100 text-emerald-600 border-emerald-200",
      dot: "bg-emerald-600",
    },
  ];

  const totalDays = po.createdAt && (po.receivedAt || po.lastInvoiceAt)
    ? daysBetween(po.createdAt, po.receivedAt || po.lastInvoiceAt)
    : null;

  // Per-item analysis
  const itemsAnalysis = items.map((item) => {
    const ordered = item.orderedQty || item.quantity || 0;
    const received = item.totalReceivedQty || 0;
    const receiptEvents = invoices.map((inv) => {
      const found = (inv.items || []).find(
        (ii) => ii.productCode === item.productCode,
      );
      return found ? found.newReceived || 0 : 0;
    });
    return { ...item, ordered, received, receiptEvents };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/sales/purchase-orders")}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <FiArrowLeft size={18} className="text-slate-500" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-0.5">
              <h1 className="text-xl font-black text-slate-800">{poNumber}</h1>
              <StatusBadge status="complete" />
            </div>
            <p className="text-xs text-slate-400">Purchase Order — Complete Receipt History</p>
          </div>
        </div>
        {totalDays !== null && (
          <div className="text-right">
            <p className="text-2xl font-black text-indigo-600">{totalDays}</p>
            <p className="text-xs text-slate-400 font-medium">days to complete</p>
          </div>
        )}
      </div>

      {/* ── PO Metadata ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FiHash, label: "PO Number", value: poNumber },
          { icon: FiUser, label: "Vendor", value: vendor },
          { icon: FiCalendar, label: "PO Date", value: fmtDate(poDate) },
          { icon: FiTruck, label: "ETA", value: fmtDate(eta) },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} className="text-slate-400" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-indigo-700">{items.length}</p>
          <p className="text-xs font-bold text-indigo-400 mt-1 uppercase tracking-wider">Total Items</p>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-slate-700">{totalOrdered}</p>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Units Ordered</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-emerald-700">{totalReceived}</p>
          <p className="text-xs font-bold text-emerald-400 mt-1 uppercase tracking-wider">Units Received</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Timeline ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h2 className="text-sm font-black text-slate-800">Receipt Timeline</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} processed
            </p>
          </div>
          <div className="p-6">
            <div className="relative">
              {/* vertical line */}
              <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-slate-100" />

              <div className="space-y-6">
                {timelineEvents.map((event, idx) => {
                  const Icon = event.icon;
                  const prevDate = idx > 0 ? timelineEvents[idx - 1].date : null;
                  const gapDays = prevDate && event.date
                    ? daysBetween(prevDate, event.date)
                    : null;

                  return (
                    <div key={idx} className="relative">
                      {gapDays !== null && gapDays > 0 && (
                        <div className="flex items-center gap-2 mb-3 ml-10">
                          <FiClock size={10} className="text-slate-300" />
                          <p className="text-[10px] text-slate-300 font-medium">{gapDays} day{gapDays !== 1 ? "s" : ""} later</p>
                        </div>
                      )}
                      <div className="flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center flex-shrink-0 relative z-10 ${event.color}`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-700">{event.label}</p>
                            <p className="text-xs text-slate-400">{fmtDate(event.date)}</p>
                          </div>
                          {event.invoiceNo && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Invoice #{event.invoiceNo}
                              {event.unitsReceived > 0 && (
                                <span className="ml-2 font-bold text-orange-600">
                                  +{event.unitsReceived} units
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Invoices List ── */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h2 className="text-sm font-black text-slate-800">Invoices Received</h2>
            <p className="text-xs text-slate-400 mt-0.5">{invoices.length} total invoices</p>
          </div>
          <div className="divide-y divide-slate-50">
            {invoices.map((inv, idx) => {
              const invItems = inv.items || [];
              const unitsThisInv = invItems.reduce((s, i) => s + (i.newReceived || 0), 0);
              const matchedCount = invItems.filter((i) => (i.newReceived || 0) > 0).length;
              const isLast = idx === invoices.length - 1;

              return (
                <div key={inv.id} className={`px-6 py-4 ${isLast ? "bg-emerald-50/40" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-800">
                          Invoice #{inv.invoiceNo || "—"}
                        </p>
                        {isLast && (
                          <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 uppercase">
                            Final
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{fmtDate(inv.invoiceDate || inv.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-800">{unitsThisInv}</p>
                      <p className="text-[10px] text-slate-400 font-medium">units recv</p>
                    </div>
                  </div>

                  {/* Mini product breakdown */}
                  <div className="mt-3 space-y-1">
                    {invItems
                      .filter((i) => (i.newReceived || 0) > 0)
                      .map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-500">{item.productCode}</span>
                          <span className="font-bold text-emerald-600">+{item.newReceived} {item.unit || "pcs"}</span>
                        </div>
                      ))}
                  </div>

                  {inv.qualityCheck && (
                    <div className={`mt-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.qualityCheck === "passed"
                        ? "bg-emerald-100 text-emerald-700"
                        : inv.qualityCheck === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                    }`}>
                      {inv.qualityCheck === "passed" ? <FiCheck size={9} /> : <FiAlertTriangle size={9} />}
                      QC: {inv.qualityCheck}
                    </div>
                  )}
                </div>
              );
            })}

            {invoices.length === 0 && (
              <div className="p-8 text-center">
                <FiFileText size={32} className="mx-auto mb-2 text-slate-200" />
                <p className="text-xs text-slate-400">No invoice records found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Products Table ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-800">Product Receipt Summary</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ordered vs received — per invoice breakdown
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl">
            <FiCheck size={12} />
            All {items.length} items complete
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Product Code
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Ordered
                </th>
                {invoices.map((inv, idx) => (
                  <th
                    key={inv.id}
                    className="text-center px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider"
                  >
                    Inv {idx + 1}
                    <span className="block text-[9px] font-medium normal-case text-slate-300">
                      #{inv.invoiceNo?.slice(0, 8) || "—"}
                    </span>
                  </th>
                ))}
                <th className="text-center px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Total Recv
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {itemsAnalysis.map((item, idx) => {
                const progress = item.ordered > 0
                  ? Math.round((item.received / item.ordered) * 100)
                  : 0;
                const isExact = item.received === item.ordered;
                const isExcess = item.received > item.ordered;

                return (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-slate-700">
                        {item.productCode || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4 max-w-[200px]">
                      <p className="text-xs text-slate-500 truncate">{item.description || "—"}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-bold text-slate-700">
                        {item.ordered}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">{item.unit || "pcs"}</span>
                    </td>
                    {item.receiptEvents.map((qty, invIdx) => (
                      <td key={invIdx} className="px-4 py-4 text-center">
                        {qty > 0 ? (
                          <span className="font-bold text-sm text-indigo-600">+{qty}</span>
                        ) : (
                          <span className="text-slate-200 text-sm">—</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center">
                      <div>
                        <span className={`text-sm font-black ${isExcess ? "text-purple-600" : isExact ? "text-emerald-600" : "text-orange-600"}`}>
                          {item.received}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">{item.unit || "pcs"}</span>
                        {/* Progress bar */}
                        <div className="w-16 mx-auto mt-1 h-1 bg-slate-100 rounded-full">
                          <div
                            className={`h-1 rounded-full ${isExcess ? "bg-purple-400" : "bg-emerald-400"}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {isExcess ? (
                        <StatusBadge status="excess" />
                      ) : (
                        <StatusBadge status="complete" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Footer totals */}
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td colSpan={2} className="px-6 py-3">
                  <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Total</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-black text-slate-800">{totalOrdered}</span>
                </td>
                {invoices.map((inv, invIdx) => {
                  const invTotal = (inv.items || []).reduce(
                    (s, i) => s + (i.newReceived || 0),
                    0,
                  );
                  return (
                    <td key={inv.id} className="px-4 py-3 text-center">
                      <span className="text-sm font-black text-indigo-600">+{invTotal}</span>
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-black text-emerald-600">{totalReceived}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status="complete" />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Quality Summary ── */}
      {invoices.some((inv) => inv.qualityCheck) && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h2 className="text-sm font-black text-slate-800">Quality Check Summary</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {invoices.map((inv, idx) => (
              <div
                key={inv.id}
                className={`p-4 rounded-xl border ${
                  inv.qualityCheck === "passed"
                    ? "bg-emerald-50 border-emerald-200"
                    : inv.qualityCheck === "failed"
                      ? "bg-red-50 border-red-200"
                      : "bg-orange-50 border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-700">
                    Invoice #{inv.invoiceNo || idx + 1}
                  </p>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    inv.qualityCheck === "passed"
                      ? "bg-emerald-100 text-emerald-700"
                      : inv.qualityCheck === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                  }`}>
                    {inv.qualityCheck}
                  </span>
                </div>
                {inv.remarks && (
                  <p className="text-xs text-slate-600 italic">"{inv.remarks}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}