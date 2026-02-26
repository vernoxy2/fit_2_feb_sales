import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiPlus, FiTrash2, FiCheck } from "react-icons/fi";
import { Card, CardHeader, Input, Select, Textarea, BtnPrimary, BtnSecondary, Alert, Table } from "../SalesComponent/ui/index";

export default function CreatePurchaseOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: PO Details, 2: Add Items, 3: Review
  const [po, setPO] = useState({
    poNumber: `PO-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    vendor: "",
    vendorContact: "",
    vendorPhone: "",
    date: new Date().toISOString().split('T')[0],
    eta: "",
    etaDays: 15,
    reason: "",
    notes: "",
  });
  const [items, setItems] = useState([{
    productCode: "",
    description: "",
    quantity: "",
    unit: "",
    unitPrice: "",
  }]);

  const vendors = [
    { value: "", label: "Select Vendor" },
    { value: "ABC Suppliers Pvt Ltd", label: "ABC Suppliers Pvt Ltd" },
    { value: "XYZ Traders", label: "XYZ Traders" },
    { value: "DEF Enterprises", label: "DEF Enterprises" },
    { value: "GHI Industries", label: "GHI Industries" },
  ];

  const addItem = () => {
    setItems([...items, { productCode: "", description: "", quantity: "", unit: "", unitPrice: "" }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateETA = () => {
    if (!po.date || !po.etaDays) return "";
    const date = new Date(po.date);
    date.setDate(date.getDate() + parseInt(po.etaDays));
    return date.toISOString().split('T')[0];
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + (qty * price);
    }, 0);
    const gst = subtotal * 0.18; // 18% GST
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const handleNext = () => {
    if (step === 1) {
      setPO({ ...po, eta: calculateETA() });
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = () => {
    // In real app: Save PO and mark items as "On Order"
    navigate('/sales/purchase-orders');
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Create Purchase Order</h2>
          <p className="text-xs text-slate-400 mt-0.5">Order material from vendor to replenish stock</p>
        </div>
        <BtnSecondary onClick={() => navigate('/sales/purchase-orders')}>
          Cancel
        </BtnSecondary>
      </div>

      {/* Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {[
            { num: 1, label: "PO Details" },
            { num: 2, label: "Add Items" },
            { num: 3, label: "Review & Submit" },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= s.num ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {step > s.num ? <FiCheck size={20} /> : s.num}
                </div>
                <p className={`text-xs font-bold ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</p>
              </div>
              {idx < 2 && <div className={`flex-1 h-0.5 ${step > s.num ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {/* Step 1: PO Details */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Purchase Order Information" />
            <div className="p-6 space-y-4">
              <Input
                label="PO Number"
                value={po.poNumber}
                onChange={(e) => setPO({ ...po, poNumber: e.target.value })}
                required
                disabled
              />
              <Input
                label="PO Date"
                type="date"
                value={po.date}
                onChange={(e) => setPO({ ...po, date: e.target.value })}
                required
              />
              <Input
                label="Expected Delivery (Days)"
                type="number"
                value={po.etaDays}
                onChange={(e) => setPO({ ...po, etaDays: e.target.value })}
                placeholder="15"
                required
              />
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  📅 Expected Arrival Date: <span className="font-bold">{calculateETA() || 'Enter delivery days'}</span>
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Vendor Information" />
            <div className="p-6 space-y-4">
              <Select
                label="Select Vendor"
                value={po.vendor}
                onChange={(e) => setPO({ ...po, vendor: e.target.value })}
                options={vendors}
                required
              />
              <Input
                label="Vendor Contact Person"
                value={po.vendorContact}
                onChange={(e) => setPO({ ...po, vendorContact: e.target.value })}
                placeholder="Ramesh Gupta"
              />
              <Input
                label="Vendor Phone"
                value={po.vendorPhone}
                onChange={(e) => setPO({ ...po, vendorPhone: e.target.value })}
                placeholder="+91 98765 43210"
              />
              <Textarea
                label="Reason for Purchase"
                value={po.reason}
                onChange={(e) => setPO({ ...po, reason: e.target.value })}
                placeholder="Low stock - Below minimum level"
                rows={2}
              />
              <Textarea
                label="Additional Notes"
                value={po.notes}
                onChange={(e) => setPO({ ...po, notes: e.target.value })}
                placeholder="Any special instructions..."
                rows={2}
              />
            </div>
          </Card>

          <div className="lg:col-span-2 flex justify-end">
            <BtnPrimary onClick={handleNext} disabled={!po.vendor || !po.date || !po.etaDays}>
              Next: Add Items →
            </BtnPrimary>
          </div>
        </div>
      )}

      {/* Step 2: Add Items */}
      {step === 2 && (
        <Card>
          <CardHeader 
            title="Purchase Order Items" 
            subtitle={`${items.length} items`}
            action={
              <BtnPrimary onClick={addItem}>
                <FiPlus size={14} /> Add Item
              </BtnPrimary>
            }
          />
          <div className="p-6">
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                      <Input
                        label="Product Code"
                        value={item.productCode}
                        onChange={(e) => updateItem(idx, 'productCode', e.target.value)}
                        placeholder="PCH-50-10"
                      />
                      <Input
                        label="Description"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        placeholder="PPCH Pipe"
                        className="md:col-span-2"
                      />
                      <Input
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                        placeholder="100"
                      />
                      <Input
                        label="Unit"
                        value={item.unit}
                        onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                        placeholder="m/pcs"
                      />
                      <Input
                        label="Unit Price (₹)"
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                        placeholder="500"
                      />
                    </div>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 size={16} />
                      </button>
                    )}
                  </div>
                  {item.quantity && item.unitPrice && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-sm font-bold text-slate-700">
                        Item Total: ₹{(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <BtnSecondary onClick={() => setStep(1)}>
                ← Back
              </BtnSecondary>
              <BtnPrimary onClick={handleNext}>
                Review Order →
              </BtnPrimary>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          {/* PO Summary */}
          <Card>
            <CardHeader title="Purchase Order Summary" />
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg mb-6">
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1">PO Number</p>
                  <p className="text-sm font-bold text-slate-800">{po.poNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1">Vendor</p>
                  <p className="text-sm font-bold text-slate-800">{po.vendor}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1">PO Date</p>
                  <p className="text-sm font-bold text-slate-800">{po.date}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1">Expected Arrival</p>
                  <p className="text-sm font-bold text-emerald-600">{po.eta}</p>
                </div>
              </div>

              <Table
                headers={[
                  { label: "Product Code" },
                  { label: "Description" },
                  { label: "Quantity", align: "center" },
                  { label: "Unit Price", align: "right" },
                  { label: "Total", align: "right" },
                ]}
              >
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-sm font-bold font-mono">{item.productCode}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-center">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-sm text-right">₹{parseFloat(item.unitPrice).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold text-right">₹{(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toLocaleString()}</td>
                  </tr>
                ))}
              </Table>
            </div>
          </Card>

          {/* Totals */}
          <Card>
            <div className="p-6">
              <div className="max-w-md ml-auto space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-bold text-slate-800">₹{totals.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">GST (18%):</span>
                  <span className="font-bold text-slate-800">₹{totals.gst.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-800">Grand Total:</span>
                  <span className="text-2xl font-black text-indigo-600">₹{totals.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Card>

          <Alert type="info">
            <p className="text-xs">
              📦 After PO creation, stock will be marked as "ON ORDER" and you'll receive alerts 2 days before ETA and if delivery is overdue.
            </p>
          </Alert>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <BtnSecondary onClick={() => setStep(2)}>
              ← Back to Items
            </BtnSecondary>
            <BtnPrimary onClick={handleSubmit}>
              <FiCheck size={14} /> Create Purchase Order
            </BtnPrimary>
          </div>
        </div>
      )}
    </div>
  );
}
