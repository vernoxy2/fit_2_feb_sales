import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiCheck, FiPackage, FiAlertTriangle } from "react-icons/fi";
import { Card, CardHeader, Input, Select, FileUpload, Textarea, BtnPrimary, BtnSecondary, Alert, Table } from "../SalesComponent/ui/index";
import { db } from "../../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// ── ETA calc ──────────────────────────────────────────────────────────────────
function calcStatus(deliveryDate) {
  if (!deliveryDate) return { status: "pending", remainingDays: 0 };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const eta = new Date(deliveryDate); eta.setHours(0, 0, 0, 0);
  const diff = Math.round((eta - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { status: "overdue", remainingDays: diff };
  if (diff <= 2) return { status: "warning", remainingDays: diff };
  return { status: "pending", remainingDays: diff };
}

export default function UploadVendorInvoice() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPO, setSelectedPO] = useState(null);
  const [invoice, setInvoice] = useState({
    vendorInvoiceNo: "",
    date: new Date().toISOString().split('T')[0],
    file: null,
  });
  const [receivedItems, setReceivedItems] = useState([]);
  const [qualityCheck, setQualityCheck] = useState("passed");
  const [remarks, setRemarks] = useState("");
  const [uploading, setUploading] = useState(false);

  // ── CHANGE 1: Firebase fetch instead of static data ───────────────────────
  const [pendingPOs, setPendingPOs] = useState([]);
  const [loadingPOs, setLoadingPOs] = useState(true);

  useEffect(() => {
    const fetchPOs = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, "excelupload"), orderBy("createdAt", "desc"))
        );
        const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Only PO type, not received
        const pos = all.filter((doc) => {
          if (doc.type === "SALES_ORDER") return false;
          if (doc.type !== "PO") {
            const buyer = doc.excelHeader?.buyer;
            if (buyer && buyer.trim() !== "") return false;
          }
          return !doc.receivedAt; // not already received
        });

        // Map to same shape as PURCHASE_ORDERS_ENHANCED
        const mapped = pos.map((po) => {
          const { status, remainingDays } = calcStatus(po.deliveryDate);
          return {
            id:            po.id,
            poNumber:      po.woNumber || po.excelHeader?.voucherNo || po.id.slice(0, 8).toUpperCase(),
            vendor:        po.customer || po.excelHeader?.supplier || po.excelHeader?.consignee || "—",
            vendorContact: po.customerContact || "—",
            date:          po.excelHeader?.dated || "",
            eta:           po.deliveryDate || "—",
            status,
            remainingDays,
            items:         (po.items || []).map(item => ({
              ...item,
              quantity: item.quantity || 0,
              unit:     item.unit || "pcs",
            })),
            grandTotal:    0,
            reason:        po.notes || "",
          };
        });

        setPendingPOs(mapped);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoadingPOs(false);
      }
    };
    fetchPOs();
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  const handleSelectPO = (po) => {
    setSelectedPO(po);
    setReceivedItems(po.items.map(item => ({
      ...item,
      received: item.quantity,
      shortage: 0,
      damaged: 0,
    })));
    setStep(2);
  };

  const updateReceivedQty = (idx, received) => {
    const newItems = [...receivedItems];
    const ordered = newItems[idx].quantity;
    newItems[idx].received = received;
    newItems[idx].shortage = Math.max(0, ordered - received);
    setReceivedItems(newItems);
  };

  const handleSubmit = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setStep(4);
    }, 1500);
  };

  const getTotalShortage = () => {
    return receivedItems.reduce((sum, item) => sum + item.shortage, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Upload Vendor Invoice</h2>
          <p className="text-xs text-slate-400 mt-0.5">Record material receipt and update inventory</p>
        </div>
        <BtnSecondary onClick={() => navigate('/sales/purchase-orders')}>
          Cancel
        </BtnSecondary>
      </div>

      {/* Step 1: Select PO */}
      {step === 1 && (
        <Card>
          <CardHeader title="Select Purchase Order" subtitle={`${pendingPOs.length} POs awaiting material`} />
          {loadingPOs ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading Purchase Orders...</p>
            </div>
          ) : pendingPOs.length === 0 ? (
            <div className="p-12 text-center">
              <FiFileText size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No Pending Purchase Orders</p>
              <p className="text-xs text-slate-400 mt-1">All materials have been received</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {pendingPOs.map(po => (
                <div
                  key={po.id}
                  className={`px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${po.status === 'overdue' ? 'bg-red-50' : po.status === 'warning' ? 'bg-orange-50' : ''}`}
                  onClick={() => handleSelectPO(po)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-sm font-bold text-slate-800">{po.poNumber}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          po.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' :
                          po.status === 'warning' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {po.status === 'overdue' ? 'OVERDUE' : po.status === 'warning' ? `${po.remainingDays} DAYS LEFT` : 'PENDING'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{po.vendor}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        ETA: {po.eta} • {po.items.length} items • {po.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <button className="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">
                        Receive Material →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Upload Invoice & Receive Material */}
      {(step === 2 || step === 3) && selectedPO && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PO Details */}
          <Card>
            <CardHeader title="Purchase Order Details" />
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold mb-1">PO Number</p>
                    <p className="text-slate-800 font-bold">{selectedPO.poNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold mb-1">Vendor</p>
                    <p className="text-slate-800 font-bold">{selectedPO.vendor}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold mb-1">PO Date</p>
                    <p className="text-slate-800">{selectedPO.date}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold mb-1">Expected ETA</p>
                    <p className="text-slate-800">{selectedPO.eta}</p>
                  </div>
                </div>
              </div>

              {step === 2 && (
                <>
                  <Input
                    label="Vendor Invoice Number"
                    value={invoice.vendorInvoiceNo}
                    onChange={(e) => setInvoice({ ...invoice, vendorInvoiceNo: e.target.value })}
                    placeholder="VI-5678"
                    required
                  />
                  <Input
                    label="Receipt Date"
                    type="date"
                    value={invoice.date}
                    onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                    required
                  />
                  <FileUpload
                    label="Upload Vendor Invoice PDF"
                    accept=".pdf"
                    file={invoice.file}
                    onChange={(e) => setInvoice({ ...invoice, file: e.target.files[0] })}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <Select
                    label="Quality Check"
                    value={qualityCheck}
                    onChange={(e) => setQualityCheck(e.target.value)}
                    options={[
                      { value: "passed",  label: "✓ Passed - All items good" },
                      { value: "failed",  label: "✗ Failed - Issues found" },
                      { value: "partial", label: "⚠ Partial - Some issues" },
                    ]}
                  />
                  <Textarea
                    label="Remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Any damage, shortage, or quality issues..."
                    rows={3}
                  />
                </>
              )}
            </div>
          </Card>

          {/* Received Material */}
          <Card>
            <CardHeader title="Received Material" subtitle="Verify quantities received" />
            <div className="p-6">
              <div className="space-y-3">
                {receivedItems.map((item, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <FiPackage className="text-slate-400 mt-1" size={16} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800 font-mono">{item.productCode}</p>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-slate-400 font-bold mb-1">Ordered</p>
                        <p className="text-sm font-bold text-slate-800">{item.quantity} {item.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold mb-1">Received</p>
                        <input
                          type="number"
                          value={item.received}
                          onChange={(e) => updateReceivedQty(idx, parseInt(e.target.value) || 0)}
                          className="w-full border border-slate-200 rounded px-2 py-1 text-sm font-bold"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold mb-1">Shortage</p>
                        <p className={`text-sm font-bold ${item.shortage > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {item.shortage > 0 ? `-${item.shortage}` : '✓'} {item.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {getTotalShortage() > 0 && (
                <Alert type="warning" className="mt-4">
                  <p className="text-xs font-bold">⚠️ Material Shortage Detected</p>
                  <p className="text-xs mt-1">Total shortage: {getTotalShortage()} units across items</p>
                </Alert>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Actions */}
      {step === 2 && (
        <div className="flex justify-end gap-3">
          <BtnSecondary onClick={() => setStep(1)}>← Back</BtnSecondary>
          <BtnPrimary
            onClick={() => setStep(3)}
            disabled={!invoice.vendorInvoiceNo || !invoice.file}
          >
            Next: Quality Check →
          </BtnPrimary>
        </div>
      )}

      {step === 3 && (
        <div className="flex justify-end gap-3">
          <BtnSecondary onClick={() => setStep(2)}>← Back</BtnSecondary>
          <BtnPrimary onClick={handleSubmit} disabled={uploading}>
            {uploading ? "Processing..." : "Confirm Receipt"}
          </BtnPrimary>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <Card>
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <FiCheck size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Material Received Successfully!</h3>
            <p className="text-sm text-slate-600 mb-6">
              {selectedPO.poNumber} from {selectedPO.vendor}
            </p>
            <div className="space-y-2 text-sm text-slate-600 mb-8">
              <p>✅ Vendor invoice uploaded</p>
              <p>✅ Material quantities verified</p>
              <p>✅ Quality check completed: {qualityCheck}</p>
              <p>✅ Stock updated and available for use</p>
              {getTotalShortage() > 0 && (
                <p className="text-amber-600">⚠️ Debit note required for {getTotalShortage()} units shortage</p>
              )}
            </div>

            <div className="max-w-2xl mx-auto mb-8">
              <Card className="bg-slate-50">
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-700 mb-3">Stock Added:</p>
                  <div className="space-y-2">
                    {receivedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{item.productCode}</span>
                        <span className="font-bold text-emerald-600">+ {item.received} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex items-center justify-center gap-3">
              <BtnSecondary onClick={() => { setStep(1); setSelectedPO(null); }}>
                Upload Another
              </BtnSecondary>
              <BtnPrimary onClick={() => navigate('/sales/purchase-orders')}>
                View Purchase Orders
              </BtnPrimary>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}