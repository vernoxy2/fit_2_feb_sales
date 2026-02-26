import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

// ─────────────────────────────────────────────
// Minimal inline UI helpers (no extra imports)
// ─────────────────────────────────────────────

const Badge = ({ children, color = "gray" }) => {
  const colors = {
    green: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    red: "bg-red-100 text-red-700 border border-red-200",
    amber: "bg-amber-100 text-amber-700 border border-amber-200",
    indigo: "bg-indigo-100 text-indigo-700 border border-indigo-200",
    gray: "bg-slate-100 text-slate-600 border border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${colors[color]}`}
    >
      {children}
    </span>
  );
};

const priorityColor = (p) => {
  if (p === "High") return "red";
  if (p === "Medium") return "amber";
  return "green";
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const ViewExcelSheetData = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null); 
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "excelupload"),
          orderBy("createdAt", "desc"),
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp → readable string
          createdAtStr: doc.data().createdAt?.toDate
            ? doc.data().createdAt.toDate().toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
        }));
        setRecords(data);
      } catch (err) {
        console.error("Firestore fetch error:", err);
        setError("Failed to load data from Firebase.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter by search
  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.woNumber || "").toLowerCase().includes(q) ||
      (r.customer || "").toLowerCase().includes(q) ||
      (r.customerContact || "").toLowerCase().includes(q)
    );
  });

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        <p className="text-sm font-semibold text-slate-500">
          Loading work orders from Firebase...
        </p>
      </div>
    );
  }

  // ─── Error state ───
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-slate-600"
          >
            ←
          </button>
          <h2 className="text-xl font-black text-slate-800">
            Excel Upload Records
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            All Sales orders saved via Excel upload · {records.length} total
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search WO / Customer..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"
          />
          <svg
            className="absolute left-3 top-2.5 text-slate-400"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <p className="text-4xl mb-3">📂</p>
          <p className="text-slate-500 font-medium text-sm">No records found</p>
          <p className="text-slate-400 text-xs mt-1">
            Upload an Excel work order to see data here
          </p>
        </div>
      )}

      {/* ── Main Table ── */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "WO Number",
                    "Customer Name",
                    "Delivery Date",
                    "Priority",
                    "Items",
                    "Shortage",
                    "Created At",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((record, idx) => (
                  <React.Fragment key={record.id}>
                    {/* ── Main Row ── */}
                    <tr
                      className={`hover:bg-slate-50 transition-colors ${expandedRow === idx ? "bg-indigo-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-bold font-mono text-indigo-700">
                          {record.woNumber || "—"}
                        </span>
                      </td>
                      {/* <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{record.customerName || "—"}</td> */}
                      {/* <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.customerContact || "—"}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{record.customerPhone || "—"}</td> */}
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {record.deliveryDate || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={priorityColor(record.priority)}>
                          {record.priority || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge color="indigo">
                          {record.totalItems ?? record.items?.length ?? 0}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {record.hasShortage ? (
                          <Badge color="red">
                            ⚠️ {record.stockAlerts?.length ?? "?"} short
                          </Badge>
                        ) : (
                          <Badge color="green">✅ OK</Badge>
                        )}
                      </td>
                      {/* <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{record.createdAtStr}</td> */}
                      {record.createdAt
                        ? new Date(record.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                      {/* Expand/Collapse button */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            setExpandedRow(expandedRow === idx ? null : idx)
                          }
                          className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 whitespace-nowrap"
                        >
                          {expandedRow === idx ? "▲ Hide" : "▼ Items"}
                        </button>
                      </td>
                    </tr>

                    {/* ── Expanded Items Row ── */}
                    {expandedRow === idx && (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-6 py-4 bg-indigo-50 border-t border-indigo-100"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-black text-slate-700 uppercase tracking-wide">
                              Material Items · {record.items?.length ?? 0}{" "}
                              products
                            </p>
                            {record.notes && (
                              <p className="text-xs text-slate-500 italic">
                                📝 {record.notes}
                              </p>
                            )}
                          </div>

                          {record.items && record.items.length > 0 ? (
                            <div className="overflow-x-auto rounded-lg border border-indigo-200">
                              <table className="w-full text-xs bg-white">
                                <thead>
                                  <tr className="bg-indigo-100 text-indigo-700">
                                    <th className="px-3 py-2 text-left font-bold">
                                      #
                                    </th>
                                    <th className="px-3 py-2 text-left font-bold">
                                      Product Code
                                    </th>
                                    <th className="px-3 py-2 text-left font-bold">
                                      Description
                                    </th>
                                    <th className="px-3 py-2 text-center font-bold">
                                      Quantity
                                    </th>
                                    <th className="px-3 py-2 text-center font-bold">
                                      Unit
                                    </th>
                                    <th className="px-3 py-2 text-center font-bold">
                                      Available
                                    </th>
                                    <th className="px-3 py-2 text-center font-bold">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {record.items.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                      <td className="px-3 py-2 text-slate-400">
                                        {i + 1}
                                      </td>
                                      <td className="px-3 py-2 font-bold font-mono text-slate-800">
                                        {item.productCode}
                                      </td>
                                      <td className="px-3 py-2 text-slate-600">
                                        {item.description}
                                      </td>
                                      <td className="px-3 py-2 text-center font-semibold">
                                        {item.quantity}
                                      </td>
                                      <td className="px-3 py-2 text-center text-slate-500">
                                        {item.unit}
                                      </td>
                                      <td
                                        className={`px-3 py-2 text-center font-semibold ${item.available < item.quantity ? "text-red-600" : "text-emerald-600"}`}
                                      >
                                        {item.available}
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        {item.available >= item.quantity ? (
                                          <Badge color="green">OK</Badge>
                                        ) : (
                                          <Badge color="red">SHORT</Badge>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 italic">
                              No item data available.
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewExcelSheetData;
