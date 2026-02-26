import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiCheck, FiAlertTriangle, FiPackage } from "react-icons/fi";
import { Card, CardHeader, Input, Select, FileUpload, BtnPrimary, BtnSecondary, Alert, Table } from "../SalesComponent/ui/index";
import { CHALLANS_ENHANCED, WORK_ORDERS_ENHANCED } from "../data/salesData";

export default function UploadCustomerInvoice() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Select Challan, 2: Upload Invoice, 3: Confirm
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [invoice, setInvoice] = useState({
    invoiceNo: "",
    date: new Date().toISOString().split('T')[0],
    amount: "",
    gst: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);

  const pendingChallans = CHALLANS_ENHANCED.filter(ch => !ch.invoiceNo);

  const handleSelectChallan = (challan) => {
    setSelectedChallan(challan);
    const wo = WORK_ORDERS_ENHANCED.find(w => w.id === challan.workOrderId);
    setInvoice({ ...invoice, amount: wo ? wo.totalValue : 0 });
    setStep(2);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setInvoice({ ...invoice, file });
  };

  const handleSubmit = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setStep(3);
    }, 1500);
  };

  const getTotalAmount = () => {
    const amount = parseFloat(invoice.amount) || 0;
    const gst = parseFloat(invoice.gst) || 0;
    return amount + gst;
  };

  const getWorkOrder = () => {
    if (!selectedChallan) return null;
    return WORK_ORDERS_ENHANCED.find(wo => wo.id === selectedChallan.workOrderId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Upload Customer Invoice</h2>
          <p className="text-xs text-slate-400 mt-0.5">Upload invoice to deduct stock from inventory</p>
        </div>
        <BtnSecondary onClick={() => navigate('/sales/invoices')}>
          Cancel
        </BtnSecondary>
      </div>

      {/* Step 1: Select Challan */}
      {step === 1 && (
        <Card>
          <CardHeader title="Select Challan" subtitle={`${pendingChallans.length} challans pending invoice`} />
          {pendingChallans.length === 0 ? (
            <div className="p-12 text-center">
              <FiFileText size={48} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No Pending Challans</p>
              <p className="text-xs text-slate-400 mt-1">All challans have invoices uploaded</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {pendingChallans.map(challan => {
                const wo = WORK_ORDERS_ENHANCED.find(w => w.id === challan.workOrderId);
                return (
                  <div key={challan.id} className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleSelectChallan(challan)}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-sm font-bold text-slate-800">{challan.challanNo}</p>
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
                            INVOICE PENDING
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{challan.customer}</p>
                        <p className="text-xs text-slate-400 mt-1">WO: {challan.woNumber} • Dispatched: {challan.dispatchDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">₹{wo ? (wo.totalValue / 1000).toFixed(0) : '0'}K</p>
                        <button className="mt-2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">
                          Upload Invoice →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Step 2: Upload Invoice */}
      {step === 2 && selectedChallan && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Challan Details */}
          <Card>
            <CardHeader title="Challan Details" />
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 font-bold mb-1">Challan No</p>
                    <p className="text-slate-800 font-bold">{selectedChallan.challanNo}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold mb-1">WO Number</p>
                    <p className="text-slate-800 font-bold">{selectedChallan.woNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold mb-1">Customer</p>
                    <p className="text-slate-800 font-bold">{selectedChallan.customer}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-bold mb-1">Dispatch Date</p>
                    <p className="text-slate-800">{selectedChallan.dispatchDate}</p>
                  </div>
                </div>
              </div>

              {/* Material List */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-2">Materials to be Deducted</p>
                <div className="space-y-2">
                  {selectedChallan.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <FiPackage className="text-blue-600" size={16} />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800 font-mono">{item.productCode}</p>
                        <p className="text-[10px] text-slate-500">{item.description}</p>
                      </div>
                      <p className="text-sm font-bold text-blue-700">{item.quantity} {item.unit}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Alert type="warning">
                <p className="text-xs font-bold mb-1">⚠️ Stock Deduction</p>
                <p className="text-xs">
                  Upon invoice upload, {selectedChallan.items.length} items will be deducted from available inventory automatically.
                </p>
              </Alert>
            </div>
          </Card>

          {/* Invoice Form */}
          <Card>
            <CardHeader title="Invoice Information" />
            <div className="p-6 space-y-4">
              <Input
                label="Invoice Number"
                value={invoice.invoiceNo}
                onChange={(e) => setInvoice({ ...invoice, invoiceNo: e.target.value })}
                placeholder="INV-2024-001"
                required
              />
              <Input
                label="Invoice Date"
                type="date"
                value={invoice.date}
                onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                required
              />
              <Input
                label="Base Amount (₹)"
                type="number"
                value={invoice.amount}
                onChange={(e) => setInvoice({ ...invoice, amount: e.target.value })}
                placeholder="50000"
                required
              />
              <Input
                label="GST Amount (₹)"
                type="number"
                value={invoice.gst}
                onChange={(e) => setInvoice({ ...invoice, gst: e.target.value })}
                placeholder="9000"
              />

              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-indigo-900">Total Amount</p>
                  <p className="text-xl font-black text-indigo-700">₹{getTotalAmount().toLocaleString()}</p>
                </div>
              </div>

              <FileUpload
                label="Upload Invoice PDF"
                accept=".pdf"
                file={invoice.file}
                onChange={handleFileUpload}
              />

              <div className="flex gap-3 pt-4">
                <BtnSecondary onClick={() => setStep(1)}>
                  ← Back
                </BtnSecondary>
                <BtnPrimary 
                  onClick={handleSubmit} 
                  disabled={!invoice.invoiceNo || !invoice.amount || !invoice.file || uploading}
                  className="flex-1"
                >
                  {uploading ? "Uploading..." : "Upload Invoice"}
                </BtnPrimary>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <Card>
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <FiCheck size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Invoice Uploaded Successfully!</h3>
            <p className="text-sm text-slate-600 mb-6">
              {invoice.invoiceNo} for {selectedChallan.customer}
            </p>
            <div className="space-y-2 text-sm text-slate-600 mb-8">
              <p>✅ Invoice uploaded and saved</p>
              <p>✅ Stock deducted from inventory</p>
              <p>✅ Work order status updated to "Dispatched"</p>
              <p>✅ Challan marked as completed</p>
            </div>

            {/* Stock Deduction Summary */}
            <div className="max-w-2xl mx-auto mb-8">
              <Card className="bg-slate-50">
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-700 mb-3">Stock Deducted:</p>
                  <div className="space-y-2">
                    {selectedChallan.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">{item.productCode}</span>
                        <span className="font-bold text-red-600">- {item.quantity} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex items-center justify-center gap-3">
              <BtnSecondary onClick={() => navigate('/sales/invoices/upload')}>
                Upload Another
              </BtnSecondary>
              <BtnPrimary onClick={() => navigate('/sales/invoices')}>
                View All Invoices
              </BtnPrimary>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
