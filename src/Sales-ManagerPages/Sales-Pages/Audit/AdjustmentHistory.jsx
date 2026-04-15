import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { db } from "../../../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { FiSearch, FiRefreshCw, FiChevronRight } from "react-icons/fi";

const AdjustmentHistory = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedAdj, setSelectedAdj] = useState(null);

  useEffect(() => {
    fetchAdjustments();
  }, []);

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "stockAdjustments"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAdjustments(data);
    } catch (err) {
      console.error("Error fetching adjustments:", err);
    }
    setLoading(false);
  };

  // ── Helpers ──
  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  };

  const getTypeLabel = (type) => {
    if (!type) return "Single";
    return type.toLowerCase().includes("bulk") ? "Bulk" : "Single";
  };

  // ── Stats ──
  const now = new Date();
  const thisMonthCount = adjustments.filter((adj) => {
    const d = adj.createdAt?.toDate ? adj.createdAt.toDate() : new Date(adj.createdAt);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const statusCounts = {
    done: adjustments.filter((a) => (a.status || "").toLowerCase() === "done").length,
    pending: adjustments.filter((a) => (a.status || "").toLowerCase() === "pending").length,
    rejected: adjustments.filter((a) => (a.status || "").toLowerCase() === "rejected").length,
  };

  // ── Filtering ──
  const filtered = adjustments.filter((adj) => {
    if (statusFilter !== "all" && (adj.status || "").toLowerCase() !== statusFilter) return false;
    
    if (search) {
      const s = search.toLowerCase();
      const matchId = (adj.docId || "").toLowerCase().includes(s);
      const matchBy = (adj.requestedBy || "").toLowerCase().includes(s);
      const matchProd = (adj.products || []).some(p => 
        (p.productName || "").toLowerCase().includes(s) || 
        (p.productCode || "").toLowerCase().includes(s)
      );
      if (!matchId && !matchBy && !matchProd) return false;
    }

    if (dateFilter !== "all") {
      const d = adj.createdAt?.toDate ? adj.createdAt.toDate() : new Date(adj.createdAt);
      if (dateFilter === "thisMonth") {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())
          return false;
      } else if (dateFilter === "last7") {
        const diff = (now - d) / (1000 * 60 * 60 * 24);
        if (diff > 7) return false;
      } else if (dateFilter === "last30") {
        const diff = (now - d) / (1000 * 60 * 60 * 24);
        if (diff > 30) return false;
      }
    }
    if (typeFilter !== "all" && getTypeLabel(adj.type).toLowerCase() !== typeFilter) return false;
    return true;
  });

  const exportToExcel = () => {
    const rows = filtered.map((adj) => ({
      ID: adj.docId || adj.id,
      Date: formatDate(adj.createdAt),
      Type: getTypeLabel(adj.type),
      "Requested By": adj.requestedBy || "—",
      Products: adj.totalProducts || 0,
      Status: (adj.status || "pending").toUpperCase(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    XLSX.writeFile(wb, "Adjustment_History.xlsx");
  };

  // ── Status badge ──
  const StatusBadge = ({ status }) => {
    const s = (status || "").toLowerCase();
    const map = {
      done: "bg-green-100 text-green-700",
      approved: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
          map[s] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status || "pending"}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Adjustment History</h2>
          <p className="text-sm text-slate-500 mt-1">All manual & bulk stock adjustment records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToExcel} className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-semibold">Export</button>
          <button onClick={fetchAdjustments} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-semibold">
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: adjustments.length, color: "indigo", icon: "📋" },
          { label: "This Month", value: thisMonthCount, color: "blue", icon: "🗓️" },
          { label: "Completed", value: statusCounts.done, color: "green", icon: "✅" },
          { label: "Pending", value: statusCounts.pending, color: "yellow", icon: "⏳" },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-black text-gray-800 mt-1">{card.value}</p>
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search ID, Product, User..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 min-w-[140px]">
          <option value="all">All Status</option>
          <option value="done">Completed</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 min-w-[140px]">
          <option value="all">All Types</option>
          <option value="single">Single</option>
          <option value="bulk">Bulk</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4 text-left">Reference ID</th>
                <th className="px-6 py-4 text-left">Date & Time</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-left">Requested By</th>
                <th className="px-6 py-4 text-center">SKUs</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400"><FiRefreshCw className="animate-spin mx-auto mb-2 text-xl" />Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">No records found.</td></tr>
              ) : (
                filtered.map((adj) => (
                  <tr key={adj.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-600">{adj.docId || adj.id}</td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(adj.createdAt)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getTypeLabel(adj.type) === "Bulk" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{getTypeLabel(adj.type)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{adj.requestedBy}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{adj.requestedByRole}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">{adj.totalProducts || (adj.products?.length) || 0}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge status={adj.status} /></td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => setSelectedAdj(adj)} className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1 mx-auto">Details <FiChevronRight /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAdj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-800">Adjustment Details</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">{selectedAdj.docId || selectedAdj.id}</p>
              </div>
              <button onClick={() => setSelectedAdj(null)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Requested By</p><p className="font-bold text-slate-800">{selectedAdj.requestedBy}</p></div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Submission Time</p><p className="font-bold text-slate-800">{formatDate(selectedAdj.createdAt)}</p></div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p><div><StatusBadge status={selectedAdj.status} /></div></div>
              </div>
              <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>Products Adjusted</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead><tr className="bg-slate-50 border-b border-slate-200 text-slate-500"><th className="px-4 py-3 text-left">Product Details</th><th className="px-4 py-3 text-right">System</th><th className="px-4 py-3 text-right">Adjustment</th><th className="px-4 py-3 text-right">Final</th><th className="px-4 py-3 text-left">Reason</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedAdj.products || []).map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3"><div className="font-bold text-slate-800">{p.productName}</div><div className="text-[10px] font-mono text-slate-400">{p.productCode}</div></td>
                        <td className="px-4 py-3 text-right text-slate-500">{p.systemStock ?? "—"} {p.unit}</td>
                        <td className="px-4 py-3 text-right font-bold"><span className={p.adjustment > 0 ? "text-green-600" : p.adjustment < 0 ? "text-red-600" : "text-slate-400"}>{p.adjustment > 0 ? "+" : ""}{p.adjustment} {p.unit}</span></td>
                        <td className="px-4 py-3 text-right font-black text-indigo-700">{p.newTotal || p.physicalQty} {p.unit}</td>
                        <td className="px-4 py-3 text-slate-500 italic">{p.reason || selectedAdj.reason || "Bulk Stock Audit"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end"><button onClick={() => setSelectedAdj(null)} className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-slate-900 shadow-lg shadow-slate-200">Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdjustmentHistory;
