import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEye, FiFilter, FiUpload, FiRefreshCw } from "react-icons/fi";
import {
  Card,
  CardHeader,
  StatusBadge,
  BtnPrimary,
  Select,
} from "../SalesComponent/ui/index";
import { WO_STATUSES } from "../data/salesData";

// Firebase
import { db } from "../../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

export default function SalesOrderList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch from Firebase ──────────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "salesorders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch sales orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = orders.filter((wo) => {
    const matchStatus   = statusFilter   === "all" || wo.status   === statusFilter;
    const matchPriority = priorityFilter === "all" || wo.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Sales Orders</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {loading ? "Loading..." : `${orders.length} total sales orders`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
          >
            <FiRefreshCw size={13} /> Refresh
          </button>
          {/* <BtnPrimary onClick={() => navigate("/sales/sales-orders/create")}>
            <FiPlus size={14} /> Create Sales Order
          </BtnPrimary> */}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="px-5 py-4 flex items-center gap-3">
          <FiFilter size={14} className="text-slate-400" />
          <div className="flex-1 grid grid-cols-2 gap-3 max-w-md">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "draft",            label: "Draft" },
                { value: "pending_approval", label: "Pending Approval" },
                { value: "approved",         label: "Approved" },
                { value: "rejected",         label: "Rejected" },
              ]}
            />
            <Select
              label="Priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: "all",    label: "All Priorities" },
                { value: "normal", label: "Normal" },
                { value: "high",   label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
          </div>
          <span className="text-xs text-slate-400 ml-auto">
            {filtered.length} results
          </span>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader title="All Sales Orders" subtitle="Click View to see details" />
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
              <span className="text-sm text-slate-400">Loading sales orders...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-sm">
              No sales orders found.{" "}
              <button
                onClick={() => navigate("/sales/sales-orders/create")}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Create one
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-5 py-3 text-left">WO Number</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-center">Priority</th>
                  <th className="px-4 py-3 text-center">Mode</th>
                  <th className="px-4 py-3 text-center">Items</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-700">
                      {wo.woNumber || wo.id}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{wo.date}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 max-w-[150px] truncate">
                      {wo.customer}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={wo.priority} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={wo.mode} />
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                      {wo.items?.length ?? 0}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={wo.status} />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => navigate(`/sales/sales-orders/${wo.id}`)}
                        className="flex items-center gap-1 mx-auto text-indigo-600 hover:text-indigo-800 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <FiEye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}