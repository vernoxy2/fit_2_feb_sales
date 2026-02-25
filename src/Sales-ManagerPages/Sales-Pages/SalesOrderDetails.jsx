import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit, FiDownload } from "react-icons/fi";
import {
  Card,
  CardHeader,
  StatusBadge,
  BtnSecondary,
} from "../SalesComponent/ui/index";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function SalesOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wo, setWo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const docRef = doc(db, "salesorders", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setWo({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
        <span className="text-slate-500 text-sm">Loading order details...</span>
      </div>
    );

  if (!wo)
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg font-semibold mb-2">Sales Order not found</p>
        <button
          onClick={() => navigate("/sales/sales-orders")}
          className="text-indigo-600 font-semibold hover:underline text-sm"
        >
          Go back to list
        </button>
      </div>
    );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/sales/sales-orders")}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
        >
          <FiArrowLeft size={16} /> Back to Sales Orders
        </button>
        <div className="flex gap-2">
          {wo.status === "draft" && (
            <BtnSecondary
              onClick={() => navigate(`/sales/sales-orders/create?edit=${wo.id}`)}
            >
              <FiEdit size={14} /> Edit
            </BtnSecondary>
          )}
          {wo.attachment && (
            <BtnSecondary>
              <FiDownload size={14} /> Download Attachment
            </BtnSecondary>
          )}
        </div>
      </div>

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {wo.woNumber || wo.id}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Created by {wo.createdBy} on {wo.date}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={wo.status} />
            <StatusBadge status={wo.priority} />
            <StatusBadge status={wo.mode} />
          </div>
        </div>
      </Card>

      {/* Customer Info */}
      <Card>
        <CardHeader title="Customer Information" />
        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            { label: "Customer Name",      value: wo.customer },
            { label: "Contact",            value: wo.customerContact },
            { label: "Sales Person",       value: wo.salesPerson },
            { label: "Expected Delivery",  value: wo.deliveryDate },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">{value || "—"}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader
          title="Product Items"
          subtitle={`${wo.items?.length ?? 0} item(s)`}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                <th className="px-5 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3 text-center">Unit</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(wo.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">{item.sku}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600">{item.description || "—"}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-slate-700">{item.qty}</td>
                  <td className="px-4 py-3.5 text-center text-xs text-slate-500">{item.unit || "—"}</td>
                  <td className={`px-4 py-3.5 text-center font-bold ${item.stock >= item.qty ? "text-emerald-600" : "text-red-600"}`}>
                    {item.stock ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{item.remarks || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Additional Details */}
      {(wo.specialInstructions || wo.technicalNotes) && (
        <Card>
          <CardHeader title="Additional Details" />
          <div className="p-6 space-y-4">
            {wo.specialInstructions && (
              <div>
                <p className="text-xs font-bold text-slate-600 mb-1.5">Special Instructions</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{wo.specialInstructions}</p>
              </div>
            )}
            {wo.technicalNotes && (
              <div>
                <p className="text-xs font-bold text-slate-600 mb-1.5">Technical Notes</p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{wo.technicalNotes}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Approval Info */}
      {(wo.status === "approved" || wo.status === "rejected") && (
        <Card>
          <CardHeader
            title={wo.status === "approved" ? "Approval Information" : "Rejection Information"}
          />
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  {wo.status === "approved" ? "Approved By" : "Reviewed By"}
                </p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{wo.approvedBy || "System"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Date</p>
                <p className="text-sm font-semibold text-slate-700 mt-0.5">{wo.approvedDate || "—"}</p>
              </div>
            </div>
            {wo.status === "rejected" && wo.rejectionReason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-bold text-red-700 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-600">{wo.rejectionReason}</p>
              </div>
            )}
            {wo.technicalComment && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-bold text-slate-600 mb-1">Technical Team Comment</p>
                <p className="text-sm text-slate-700">{wo.technicalComment}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}