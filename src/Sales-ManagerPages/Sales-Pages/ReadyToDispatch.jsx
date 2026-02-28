import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function ReadyToDispatch() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReadyOrders();
  }, []);

  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "excelupload"),
        where("soStatus", "in", ["complete", "ready_to_dispatch"])
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((d) => !d.linkedSoId && d.type !== "SALES_INVOICE");
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter((o) => {
    const soNum = (o.soNumber || o.id || "").toLowerCase();
    const cust = (o.customer || o.excelHeader?.buyer || "").toLowerCase();
    return soNum.includes(search.toLowerCase()) || cust.includes(search.toLowerCase());
  });

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((o) => o.id));
  };

  const getCustomerName = (o) => o.customer || o.excelHeader?.buyer || "—";
  const getSONumber = (o) => o.soNumber || o.excelHeader?.voucherNo || o.id;
  const getDate = (o) => {
    if (o.createdAt?.toDate) return o.createdAt.toDate().toLocaleDateString("en-IN");
    return o.excelHeader?.dated || "—";
  };
  const getDelivery = (o) => o.deliveryDate || o.excelHeader?.deliveryDate || "—";
  const getInvoicedLabel = (o) => `${o.totalInvoicedQty ?? "—"}/${o.orderedQty ?? "—"}`;
  const getInvoiceNos = (o) => Array.isArray(o.invoiceNos) ? o.invoiceNos : o.invoiceNo ? [o.invoiceNo] : [];
  const getItemCount = (o) => Array.isArray(o.items) ? o.items.length : o.itemCount ?? "—";

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Ready to Dispatch</h2>
          <p className="text-sm text-slate-500 mt-0.5">Loading orders...</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Fetching from Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Ready to Dispatch</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length} order{filtered.length !== 1 ? "s" : ""} ready • All items invoiced
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchReadyOrders} className="px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
            🔄 Refresh
          </button>
          {selected.length > 0 && (
            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow transition-all">
              🚚 Dispatch Selected ({selected.length})
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: orders.length, color: "bg-green-500", icon: "📦" },
          { label: "Selected", value: selected.length, color: "bg-indigo-500", icon: "✅" },
          { label: "Pending Dispatch", value: orders.length - selected.length, color: "bg-amber-500", icon: "⏳" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center text-lg`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-black text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search SO, Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
            />
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} results</span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300 cursor-pointer" />
              </th>
              {["SO Number", "Customer", "Date", "Exp. Delivery", "Items", "Invoiced", "Invoices", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-16 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-slate-500 font-semibold">No orders ready to dispatch</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Orders with <code className="bg-slate-100 px-1 rounded">soStatus: "ready_to_dispatch"</code> will appear here
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${selected.includes(order.id) ? "bg-indigo-50" : ""}`}>
                  <td className="px-4 py-3.5">
                    <input type="checkbox" checked={selected.includes(order.id)} onChange={() => toggleSelect(order.id)} className="w-4 h-4 rounded border-slate-300 cursor-pointer" />
                  </td>
                  <td className="px-4 py-3.5 cursor-pointer" onClick={() => navigate(`/sales/so-detail/${order.id}`)}>
                    <span className="font-bold text-indigo-700 text-sm hover:underline">{getSONumber(order)}</span>
                    <p className="text-xs text-slate-400">{getDate(order)}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-slate-800">{getCustomerName(order)}</p>
                    <p className="text-xs text-slate-400">{order.excelHeader?.gstin || ""}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{getDate(order)}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold text-amber-600">{getDelivery(order)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{getItemCount(order)}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-bold text-green-600">{getInvoicedLabel(order)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {getInvoiceNos(order).length > 0
                        ? getInvoiceNos(order).map((inv) => (
                            <span key={inv} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded font-mono">{inv}</span>
                          ))
                        : <span className="text-xs text-slate-400">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => window.location.href = `/sales/dispatch-on-challan?soId=${order.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
                    >
                      🚚 Dispatch
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">{selected.length} of {filtered.length} selected</p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Ready to Dispatch
            </span>
          </div>
        )}
      </div>
    </div>
  );
}