import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiCheck, FiX, FiAlertTriangle, FiDownload } from "react-icons/fi";
import { Card, CardHeader, Input, Select, Textarea, BtnPrimary, BtnSecondary, Alert, Table, StatusBadge, FileUpload } from "../SalesComponent/ui/index";

export default function UploadWorkOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Confirmation
  const [excelFile, setExcelFile] = useState(null);
  const [workOrder, setWorkOrder] = useState({
    woNumber: "",
    customer: "",
    customerContact: "",
    customerPhone: "",
    deliveryDate: "",
    priority: "Medium",
    notes: "",
  });
  const [items, setItems] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Simulate Excel parsing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setExcelFile(file);
    setUploading(true);

    // Simulate parsing delay
    setTimeout(() => {
      // Mock parsed data
      const parsedItems = [
        { productCode: "PCH-50-10", description: "PPCH-FR COMPOSITE PIPE PN10 50MM", quantity: 100, unit: "m", available: 700, status: "ok" },
        { productCode: "BV-32", description: "BRASS BALL VALVE 32MM", quantity: 20, unit: "pcs", available: 10, status: "low" },
        { productCode: "FCH-20-1", description: "PPCH COUPLER 20MM", quantity: 50, unit: "pcs", available: 500, status: "ok" },
      ];

      setItems(parsedItems);

      // Check stock availability
      const alerts = parsedItems.filter(item => item.available < item.quantity).map(item => ({
        productCode: item.productCode,
        needed: item.quantity,
        available: item.available,
        shortage: item.quantity - item.available,
      }));

      setStockAlerts(alerts);
      setUploading(false);
      setStep(2);
    }, 1500);
  };

  const handleSubmit = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setStep(3);
    }, 1000);
  };

  const handleConfirm = () => {
    navigate('/sales/work-orders');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Upload Work Order</h2>
          <p className="text-xs text-slate-400 mt-0.5">Upload Excel file to create work order and reserve stock</p>
        </div>
        <BtnSecondary onClick={() => navigate('/sales/work-orders')}>
          Cancel
        </BtnSecondary>
      </div>

      {/* Progress Steps */}
      <Card className="p-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { num: 1, label: "Upload Excel" },
            { num: 2, label: "Review & Verify" },
            { num: 3, label: "Confirmation" },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= s.num ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {step > s.num ? <FiCheck size={20} /> : s.num}
                </div>
                <p className={`text-xs font-bold ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</p>
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-0.5 ${step > s.num ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Work Order Details" />
            <div className="p-6 space-y-4">
              <Input
                label="WO Number"
                value={workOrder.woNumber}
                onChange={(e) => setWorkOrder({ ...workOrder, woNumber: e.target.value })}
                placeholder="WO-2024-001"
                required
              />
              <Input
                label="Customer Name"
                value={workOrder.customer}
                onChange={(e) => setWorkOrder({ ...workOrder, customer: e.target.value })}
                placeholder="ABC Industries Ltd"
                required
              />
              <Input
                label="Customer Contact"
                value={workOrder.customerContact}
                onChange={(e) => setWorkOrder({ ...workOrder, customerContact: e.target.value })}
                placeholder="John Smith"
              />
              <Input
                label="Contact Phone"
                value={workOrder.customerPhone}
                onChange={(e) => setWorkOrder({ ...workOrder, customerPhone: e.target.value })}
                placeholder="+91 98765 43210"
              />
              <Input
                label="Delivery Date"
                type="date"
                value={workOrder.deliveryDate}
                onChange={(e) => setWorkOrder({ ...workOrder, deliveryDate: e.target.value })}
                required
              />
              <Select
                label="Priority"
                value={workOrder.priority}
                onChange={(e) => setWorkOrder({ ...workOrder, priority: e.target.value })}
                options={[
                  { value: "Low", label: "Low" },
                  { value: "Medium", label: "Medium" },
                  { value: "High", label: "High" },
                ]}
              />
              <Textarea
                label="Notes"
                value={workOrder.notes}
                onChange={(e) => setWorkOrder({ ...workOrder, notes: e.target.value })}
                placeholder="Any special instructions..."
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Upload Excel File" subtitle="Product list with quantities" />
            <div className="p-6 space-y-4">
              <FileUpload
                label="Select Excel File"
                accept=".xlsx,.xls"
                file={excelFile}
                onChange={handleFileUpload}
              />

              {uploading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                  <p className="text-sm font-bold text-slate-600">Parsing Excel file...</p>
                  <p className="text-xs text-slate-400 mt-1">Please wait</p>
                </div>
              )}

              {!excelFile && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-bold text-blue-900 mb-2">📋 Excel Format Required:</p>
                  <div className="text-xs text-blue-700 space-y-1 font-mono">
                    <p>Product Code | Description | Quantity | Unit</p>
                    <p className="text-blue-500">PCH-50-10 | PPCH Pipe | 100 | m</p>
                    <p className="text-blue-500">BV-32 | Ball Valve | 20 | pcs</p>
                  </div>
                  <button className="mt-3 text-xs text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1">
                    <FiDownload size={12} /> Download Template
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Stock Alerts */}
          {stockAlerts.length > 0 && (
            <Alert type="warning">
              <div className="space-y-1">
                <p className="font-bold">⚠️ Stock Shortage Detected:</p>
                {stockAlerts.map(alert => (
                  <p key={alert.productCode}>
                    • {alert.productCode}: Need {alert.needed}, Available {alert.available} (Short: {alert.shortage})
                  </p>
                ))}
                <p className="mt-2 text-xs">Material will be marked as ON HOLD. PO may be required.</p>
              </div>
            </Alert>
          )}

          {/* Items Table */}
          <Card>
            <CardHeader title="Material List" subtitle={`${items.length} items parsed from Excel`} />
            <Table
              headers={[
                { label: "Product Code" },
                { label: "Description" },
                { label: "Quantity", align: "center" },
                { label: "Available", align: "center" },
                { label: "Status", align: "center" },
              ]}
            >
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="text-sm font-bold font-mono">{item.productCode}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <p className="text-sm font-bold">{item.quantity} {item.unit}</p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <p className={`text-sm font-bold ${item.available < item.quantity ? 'text-red-600' : 'text-emerald-600'}`}>
                      {item.available} {item.unit}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {item.available >= item.quantity ? (
                      <StatusBadge status="ready" label="OK" />
                    ) : (
                      <StatusBadge status="overdue" label="SHORT" />
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <BtnSecondary onClick={() => setStep(1)}>
              ← Back
            </BtnSecondary>
            <BtnPrimary onClick={handleSubmit} disabled={uploading}>
              {uploading ? "Creating..." : "Create Work Order →"}
            </BtnPrimary>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <Card>
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <FiCheck size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Work Order Created Successfully!</h3>
            <p className="text-sm text-slate-600 mb-6">
              {workOrder.woNumber} for {workOrder.customer}
            </p>
            <div className="space-y-2 text-sm text-slate-600 mb-8">
              <p>✅ {items.length} items added to work order</p>
              <p>✅ Material marked as ON HOLD</p>
              <p>✅ Notification sent to store manager</p>
              {stockAlerts.length > 0 && <p className="text-amber-600">⚠️ Purchase order may be required for {stockAlerts.length} items</p>}
            </div>
            <div className="flex items-center justify-center gap-3">
              <BtnSecondary onClick={() => navigate('/sales/work-orders/create')}>
                Create Another
              </BtnSecondary>
              <BtnPrimary onClick={handleConfirm}>
                View Work Orders
              </BtnPrimary>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
