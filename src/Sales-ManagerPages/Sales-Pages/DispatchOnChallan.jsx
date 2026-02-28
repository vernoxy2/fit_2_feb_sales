import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";

// ── Stock lookup from Firestore ───────────────────────────────────────────────
async function lookupStock(productCode) {
  try {
    const q = query(collection(db, "stock"), where("productCode", "==", productCode.toUpperCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0].data();
      return { description: d.description || d.productName || "", hsn: d.hsn || d.hsnCode || "", unit: d.unit || "", stock: d.quantity ?? d.availableQty ?? 0, found: true };
    }
  } catch (e) { console.error(e); }
  return { description: "", hsn: "", unit: "", stock: 0, found: false };
}


function exportPDF(header, rows, challanNo) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Delivery Challan - ${challanNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 20px; }
    .header-box { border: 2px solid #111; padding: 10px; margin-bottom: 0; }
    .title { text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline; margin-bottom: 8px; letter-spacing: 1px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-top: 1px solid #111; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0; border-top: 1px solid #111; }
    .cell { padding: 5px 8px; border-right: 1px solid #111; border-bottom: 1px solid #111; }
    .cell:last-child { border-right: none; }
    .cell-label { font-size: 9px; color: #555; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    .cell-value { font-size: 11px; font-weight: bold; margin-top: 2px; word-break: break-word; }
    .section-title { background: #1e293b; color: white; padding: 5px 8px; font-size: 10px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 0; }
    table th { background: #f1f5f9; padding: 6px 8px; text-align: left; font-size: 10px; font-weight: bold; border: 1px solid #111; text-transform: uppercase; }
    table td { padding: 5px 8px; border: 1px solid #ccc; font-size: 11px; }
    table tr:nth-child(even) td { background: #f8fafc; }
    table tfoot td { font-weight: bold; background: #f1f5f9; border-top: 2px solid #111; }
    .sign-box { display: grid; grid-template-columns: 1fr 1fr 1fr; margin-top: 0; border: 1px solid #111; border-top: none; }
    .sign-cell { padding: 30px 10px 10px; border-right: 1px solid #111; text-align: center; font-size: 10px; font-weight: bold; }
    .sign-cell:last-child { border-right: none; }
    .unbilled-badge { display: inline-block; background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; margin-left: 4px; }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="title">DELIVERY CHALLAN</div>
    <div class="grid-3">
      <div class="cell"><div class="cell-label">Challan No</div><div class="cell-value">${challanNo}</div></div>
      <div class="cell"><div class="cell-label">Date</div><div class="cell-value">${header.challanDate || ''}</div></div>
      <div class="cell"><div class="cell-label">SO Reference</div><div class="cell-value">${header.soNumber || ''}</div></div>
    </div>
    <div class="grid-2">
      <div class="cell"><div class="cell-label">Company Name</div><div class="cell-value">${header.companyName || ''}</div></div>
      <div class="cell"><div class="cell-label">Customer / Buyer</div><div class="cell-value">${header.customer || ''}</div></div>
    </div>
    <div class="grid-2">
      <div class="cell" style="grid-column: span 2"><div class="cell-label">Address</div><div class="cell-value">${header.address || ''}</div></div>
    </div>
    <div class="grid-3">
      <div class="cell"><div class="cell-label">GSTIN</div><div class="cell-value">${header.gstin || ''}</div></div>
      <div class="cell"><div class="cell-label">State</div><div class="cell-value">${header.state || ''}</div></div>
      <div class="cell"><div class="cell-label">Email</div><div class="cell-value">${header.email || ''}</div></div>
    </div>
    <div class="grid-3">
      <div class="cell"><div class="cell-label">PO / Voucher No</div><div class="cell-value">${header.voucherNo || ''}</div></div>
      <div class="cell"><div class="cell-label">Payment Terms</div><div class="cell-value">${header.paymentTerms || ''}</div></div>
      <div class="cell"><div class="cell-label">Approx. Invoice Date</div><div class="cell-value">${header.approxInvoiceDate || ''}</div></div>
    </div>
    <div class="grid-3">
      <div class="cell"><div class="cell-label">Consignee</div><div class="cell-value">${header.consignee || ''}</div></div>
      <div class="cell"><div class="cell-label">Destination</div><div class="cell-value">${header.destination || ''}</div></div>
      <div class="cell"><div class="cell-label">Invoice Nos (Unbilled)</div><div class="cell-value">${header.invoiceNos || ''} <span class="unbilled-badge">UNBILLED</span></div></div>
    </div>
    <div class="grid-3">
      <div class="cell"><div class="cell-label">Vehicle No</div><div class="cell-value">${header.vehicleNo || '—'}</div></div>
      <div class="cell"><div class="cell-label">Driver Name</div><div class="cell-value">${header.driverName || '—'}</div></div>
      <div class="cell"><div class="cell-label">Transporter</div><div class="cell-value">${header.transporterName || '—'}</div></div>
    </div>
  </div>

  <div class="section-title" style="margin-top:0; border: 1px solid #111; border-top: none;">ITEMS / PRODUCTS</div>
  <table>
    <thead>
      <tr>
        <th style="width:30px">SL</th>
        <th>Part No</th>
        <th>Description</th>
        <th>HSN/SAC</th>
        <th style="text-align:right">Dispatch Qty</th>
        <th>Unit</th>
        <th>Remarks</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><b>${r.productCode || ''}</b></td>
          <td>${r.description || ''}</td>
          <td>${r.hsn || ''}</td>
          <td style="text-align:right"><b>${r.dispatchQty}</b></td>
          <td>${r.unit || ''}</td>
          <td>${r.remarks || ''}</td>
        </tr>
      `).join('')}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align:right">TOTAL</td>
        <td style="text-align:right">${rows.reduce((s, r) => s + (Number(r.dispatchQty) || 0), 0)}</td>
        <td colspan="2"></td>
      </tr>
    </tfoot>
  </table>

  <div class="sign-box">
    <div class="sign-cell">Prepared By</div>
    <div class="sign-cell">Checked By</div>
    <div class="sign-cell">Authorised Signatory</div>
  </div>

  <div style="margin-top:8px; font-size:9px; color:#888; text-align:center;">
    This is a computer generated Delivery Challan. — ${challanNo} — ${new Date().toLocaleString('en-IN')}
  </div>
</body>
</html>`;

  const printWin = window.open('', '_blank', 'width=900,height=700');
  printWin.document.write(htmlContent);
  printWin.document.close();
  printWin.onload = () => {
    printWin.focus();
    printWin.print();
  };
}

function generateChallanNo() {
  const d = new Date();
  return `CH-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

function exportCSV(header, rows, challanNo) {
  const lines = [
    ["DELIVERY CHALLAN"],
    ["Challan No", challanNo],
    ["Date", header.challanDate],
    [""],
    ["Customer", header.customer],
    ["Company", header.companyName],
    ["Address", header.address],
    ["GSTIN", header.gstin],
    ["State", header.state],
    ["Email", header.email],
    [""],
    ["SO Reference", header.soNumber],
    ["PO Reference", header.voucherNo],
    ["Payment Terms", header.paymentTerms],
    ["Consignee", header.consignee],
    ["Destination", header.destination],
    ["Approx Invoice Date", header.approxInvoiceDate],
    ["Invoice Nos (Unbilled)", header.invoiceNos],
    ["Vehicle No", header.vehicleNo],
    ["Driver", header.driverName],
    ["Transporter", header.transporterName],
    [""],
    ["SL", "Part No", "Description", "HSN/SAC", "Dispatch Qty", "Unit", "Remarks"],
    ...rows.map((r, i) => [i + 1, r.productCode, r.description, r.hsn, r.dispatchQty, r.unit, r.remarks || ""]),
  ];
  const csv = lines.map((row) => row.map((c) => `"${c ?? ""}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${challanNo}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function DispatchOnChallan() {
  const [step, setStep] = useState(1);
  const [soList, setSoList] = useState([]);
  const [loadingSOs, setLoadingSOs] = useState(true);
  const [selectedSO, setSelectedSO] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Form state
  const [challanNo] = useState(generateChallanNo());
  const [challanDate, setChallanDate] = useState(new Date().toLocaleDateString("en-IN"));
  const [approxInvoiceDate, setApproxInvoiceDate] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [rows, setRows] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load SOs on mount
  useEffect(() => {
    fetchSOs();
  }, []);

  // Check URL param for direct soId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const soId = params.get("soId");
    if (soId) loadSODetail(soId);
  }, []);

  const fetchSOs = async () => {
    try {
      setLoadingSOs(true);
      const q = query(collection(db, "excelupload"), where("soStatus", "in", ["complete", "ready_to_dispatch"]));
      const snap = await getDocs(q);
      setSoList(snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((d) => !d.linkedSoId && d.type !== "SALES_INVOICE"));
    } catch (e) { console.error(e); }
    finally { setLoadingSOs(false); }
  };

  const loadSODetail = async (soId) => {
    try {
      setLoadingDetail(true);
      const docSnap = await getDoc(doc(db, "excelupload", soId));
      if (!docSnap.exists()) return;
      const data = { id: docSnap.id, ...docSnap.data() };
      setSelectedSO(data);

      // Build rows from items array
      const items = Array.isArray(data.items) ? data.items : [];
      // Build rows directly from SO items — no stock lookup needed for HSN
      const builtRows = items.map((item) => ({
        productCode: item.productCode || "",
        description: item.description || "",
        hsn: item.hsnSac || item.hsnSAC || item.hsn || item.hsnCode || "",
        unit: item.unit || "",
        soQty: item.totalInvoicedQty ?? item.quantity ?? 0,
        dispatchQty: item.totalInvoicedQty ?? item.quantity ?? 0,
        stockAvail: 0,
        remarks: "",
        matched: true,
      }));
      setRows(builtRows);
      setStep(2);
    } catch (e) { console.error(e); }
    finally { setLoadingDetail(false); }
  };

  // Row operations
  const addRow = () =>
    setRows((prev) => [...prev, { productCode: "", description: "", hsn: "", unit: "", soQty: 0, dispatchQty: 0, stockAvail: 0, remarks: "", matched: false }]);

  const removeRow = (i) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const updateRow = async (i, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
    if (field === "productCode" && value.length >= 2) {
      const info = await lookupStock(value);
      setRows((prev) => {
        const next = [...prev];
        if (info.found) {
          next[i] = { ...next[i], description: info.description, hsn: info.hsn, unit: info.unit, stockAvail: info.stock, matched: true };
        } else {
          next[i] = { ...next[i], matched: false, stockAvail: 0 };
        }
        return next;
      });
    }
  };

  const getHeader = () => ({
    challanDate,
    approxInvoiceDate,
    vehicleNo,
    driverName,
    transporterName,
    deliveryNote,
    soNumber: selectedSO?.soNumber || selectedSO?.excelHeader?.voucherNo || selectedSO?.id,
    customer: selectedSO?.customer || selectedSO?.excelHeader?.buyer || "",
    companyName: selectedSO?.excelHeader?.companyName || "",
    address: selectedSO?.excelHeader?.address || "",
    gstin: selectedSO?.excelHeader?.gstin || "",
    state: selectedSO?.excelHeader?.state || "",
    email: selectedSO?.excelHeader?.email || "",
    voucherNo: selectedSO?.excelHeader?.voucherNo || "",
    paymentTerms: selectedSO?.excelHeader?.paymentTerms || "",
    consignee: selectedSO?.excelHeader?.consignee || "",
    destination: selectedSO?.excelHeader?.destination || "",
    invoiceNos: Array.isArray(selectedSO?.invoiceNos) ? selectedSO.invoiceNos.join(", ") : (selectedSO?.invoiceNo || ""),
  });

  const handleCreate = async () => {
    try {
      setSaving(true);
      const header = getHeader();
      // Save challan to Firestore
      await addDoc(collection(db, "challans"), {
        challanNo,
        createdAt: serverTimestamp(),
        soId: selectedSO.id,
        header,
        items: rows,
        status: "dispatched",
      });
      setStep(3);
    } catch (e) {
      console.error(e);
      alert("Error creating challan: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedSO(null);
    setRows([]);
    setApproxInvoiceDate("");
    setVehicleNo("");
    setDriverName("");
    setTransporterName("");
    setDeliveryNote("");
    window.history.replaceState({}, "", "/sales/dispatch-on-challan");
  };

  const header = selectedSO ? getHeader() : {};

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Dispatch on Challan</h2>
          <p className="text-sm text-slate-500 mt-0.5">Create delivery challan for ready-to-dispatch orders</p>
        </div>
        {step > 1 && (
          <button onClick={reset} className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2">← Start Over</button>
        )}
      </div>

      {/* Steps */}
      <div className="flex items-center gap-0">
        {[{ n: 1, label: "Select SO" }, { n: 2, label: "Fill Challan" }, { n: 3, label: "Done" }].map((s, idx) => (
          <React.Fragment key={s.n}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s.n ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                {step > s.n ? "✓" : s.n}
              </div>
              <span className={`text-sm font-semibold ${step >= s.n ? "text-indigo-700" : "text-slate-400"}`}>{s.label}</span>
            </div>
            {idx < 2 && <div className={`flex-1 h-0.5 mx-3 ${step > s.n ? "bg-indigo-400" : "bg-slate-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">Select Sales Order</h3>
            <p className="text-xs text-slate-400 mt-0.5">{loadingSOs ? "Loading..." : `${soList.length} orders ready to dispatch`}</p>
          </div>
          {loadingSOs ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-500">Fetching from Firebase...</p>
            </div>
          ) : soList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-500 font-semibold">No orders ready to dispatch</p>
              <p className="text-xs text-slate-400 mt-1">Orders with <code className="bg-slate-100 px-1 rounded">soStatus: "ready_to_dispatch"</code> will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {soList.map((so) => (
                <div key={so.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-700">{so.soNumber || so.excelHeader?.voucherNo || so.id}</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Ready to Dispatch</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-0.5">{so.customer || so.excelHeader?.buyer}</p>
                    <p className="text-xs text-slate-400">
                      {Array.isArray(so.items) ? so.items.length : "—"} items •
                      Invoices: {Array.isArray(so.invoiceNos) ? so.invoiceNos.join(", ") : so.invoiceNo || "—"} •
                      Date: {so.excelHeader?.dated || "—"}
                    </p>
                  </div>
                  <button
                    onClick={() => loadSODetail(so.id)}
                    disabled={loadingDetail}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow transition-all disabled:opacity-50"
                  >
                    {loadingDetail ? "Loading..." : "Create Challan →"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && selectedSO && (
        <div className="space-y-4">

          {/* Section 1: Header */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-indigo-600">
              <h3 className="text-sm font-bold text-white">1. Header Information</h3>
            </div>
            <div className="p-5 grid grid-cols-3 gap-4">
              {[
                { label: "Challan No", value: challanNo, readOnly: true, mono: true },
                { label: "Challan Date", value: challanDate, readOnly: true },
                { label: "SO Reference", value: header.soNumber, readOnly: true, bold: true },
                { label: "Customer", value: header.customer, readOnly: true },
                { label: "Company Name", value: header.companyName, readOnly: true, span: 2 },
                { label: "Address", value: header.address, readOnly: true, span: 2 },
                { label: "GSTIN", value: header.gstin, readOnly: true, mono: true },
                { label: "State", value: header.state, readOnly: true },
                { label: "Email", value: header.email, readOnly: true },
                { label: "PO / Voucher No", value: header.voucherNo, readOnly: true },
                { label: "Payment Terms", value: header.paymentTerms, readOnly: true },
                { label: "Consignee", value: header.consignee, readOnly: true },
                { label: "Destination", value: header.destination, readOnly: true },
              ].map((f) => (
                <div key={f.label} className={f.span === 2 ? "col-span-2" : ""}>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{f.label}</label>
                  <input
                    value={f.value || ""}
                    readOnly={f.readOnly}
                    className={`w-full px-3 py-2 text-sm border rounded-lg ${f.readOnly ? "bg-slate-50 border-slate-200" : "border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"} ${f.mono ? "font-mono" : ""} ${f.bold ? "font-bold text-indigo-700" : "text-slate-700"}`}
                  />
                </div>
              ))}

              {/* Invoice Nos — Unbilled */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Invoice Nos (Unbilled)</label>
                <div className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg bg-amber-50 text-amber-800 font-semibold">
                  {header.invoiceNos || "—"}
                  <span className="ml-1 text-xs font-normal text-amber-500">(unbilled)</span>
                </div>
              </div>

              {/* Approx Invoice Date — REQUIRED */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">
                  Approx. Invoice Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={approxInvoiceDate}
                  onChange={(e) => setApproxInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Transport */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-slate-700">
              <h3 className="text-sm font-bold text-white">2. Transport Details</h3>
            </div>
            <div className="p-5 grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Vehicle No</label>
                <input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="GJ-06-AB-1234" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Driver Name</label>
                <input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Driver name" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Transporter</label>
                <input value={transporterName} onChange={(e) => setTransporterName(e.target.value)} placeholder="Logistics / transporter name" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Delivery Note</label>
                <textarea value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} placeholder="Special delivery instructions..." rows={2} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </div>
            </div>
          </div>

          {/* Section 3: Items */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-green-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">3. Items / Products</h3>
              <span className="text-xs text-green-200">{rows.length} item{rows.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["SL", "Part No", "Description", "HSN/SAC", "Unit", "SO Qty", "Dispatch Qty", "Stock", "Remarks", ""].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-sm text-slate-500 w-8">{i + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          value={row.productCode}
                          onChange={(e) => updateRow(i, "productCode", e.target.value)}
                          placeholder="e.g. TP-20"
                          className={`w-28 px-2 py-1.5 text-xs border rounded font-mono focus:outline-none focus:ring-2 ${row.matched ? "border-green-300 bg-green-50 focus:ring-green-200" : "border-slate-200 focus:ring-indigo-200"}`}
                        />
                        {row.productCode && !row.matched && <p className="text-xs text-red-500 mt-0.5">Not in stock</p>}
                      </td>
                      <td className="px-3 py-2">
                        <input value={row.description} onChange={(e) => updateRow(i, "description", e.target.value)} className="w-44 px-2 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={row.hsn} onChange={(e) => updateRow(i, "hsn", e.target.value)} className="w-24 px-2 py-1.5 text-xs border border-slate-200 rounded font-mono bg-slate-50 focus:outline-none" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={row.unit} onChange={(e) => updateRow(i, "unit", e.target.value)} className="w-16 px-2 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none text-center" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-sm font-bold text-slate-600">{row.soQty}</span>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={row.dispatchQty}
                          onChange={(e) => updateRow(i, "dispatchQty", Number(e.target.value))}
                          min={0}
                          className={`w-20 px-2 py-1.5 text-sm border rounded text-center font-bold focus:outline-none focus:ring-2 ${row.dispatchQty > row.soQty ? "border-red-300 bg-red-50 text-red-700 focus:ring-red-200" : "border-indigo-300 bg-indigo-50 text-indigo-700 focus:ring-indigo-200"}`}
                        />
                        {row.dispatchQty > row.soQty && <p className="text-xs text-red-500 mt-0.5">Exceeds SO qty</p>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-xs font-bold ${row.stockAvail > 0 ? "text-green-600" : "text-slate-400"}`}>
                          {row.matched ? row.stockAvail : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <input value={row.remarks} onChange={(e) => updateRow(i, "remarks", e.target.value)} placeholder="Optional" className="w-28 px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 text-lg leading-none transition-colors">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <button onClick={addRow} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-semibold">
                <span className="text-lg leading-none">+</span> Add Row
              </button>
              <span className="text-sm text-slate-500">
                Total: <span className="font-black text-slate-800">{rows.reduce((s, r) => s + (Number(r.dispatchQty) || 0), 0)}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button onClick={reset} className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all">← Cancel</button>
            <div className="flex items-center gap-3">
              {!approxInvoiceDate && <p className="text-xs text-amber-600 font-semibold">⚠ Set Approx. Invoice Date first</p>}
              <button
                onClick={handleCreate}
                disabled={!approxInvoiceDate || rows.length === 0 || saving}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg shadow transition-all ${approxInvoiceDate && rows.length > 0 && !saving ? "bg-green-600 hover:bg-green-700 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
              >
                {saving ? "⏳ Saving..." : "📋 Create Challan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Success Banner */}
          <div className="bg-green-600 px-6 py-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">✅</div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-white">Challan Created Successfully!</h3>
              <p className="text-sm text-green-100 mt-0.5">{challanNo} • Saved to Firebase</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Summary fields */}
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Challan No", challanNo],
                ["Customer", header.customer],
                ["SO Reference", header.soNumber],
                ["Approx Invoice Date", approxInvoiceDate],
                ["Vehicle No", vehicleNo || "—"],
                ["Transporter", transporterName || "—"],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-400 font-semibold">{label}</p>
                  <p className="text-sm text-slate-800 font-bold mt-0.5">{val}</p>
                </div>
              ))}
            </div>

            {/* Items Table */}
            <table className="w-full border border-slate-200 rounded-lg overflow-hidden text-sm">
              <thead>
                <tr className="bg-slate-100">
                  {["SL", "Part No", "Description", "HSN", "Dispatch Qty", "Unit"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-slate-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2.5 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-indigo-700">{r.productCode}</td>
                    <td className="px-4 py-2.5 text-slate-700">{r.description}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{r.hsn}</td>
                    <td className="px-4 py-2.5 font-bold text-right">{r.dispatchQty}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Download Section ── */}
            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
              <p className="text-sm font-bold text-slate-700 mb-3">📥 Download Challan</p>
              <div className="flex items-center gap-3 flex-wrap">
                {/* PDF */}
                <button
                  onClick={() => exportPDF(getHeader(), rows, challanNo)}
                  className="flex items-center gap-2.5 px-5 py-3 bg-red-700 hover:bg-red-500 text-white text-sm font-bold rounded-xl shadow transition-all"
                >
                  <span className="text-lg">📄</span>
                  <div className="text-left">
                    <p className="font-bold text-sm leading-tight">Download PDF</p>
                    <p className="text-xs text-red-200 leading-tight">Print ready format</p>
                  </div>
                </button>

                {/* Excel / CSV */}
                <button
                  onClick={() => exportCSV(getHeader(), rows, challanNo)}
                  className="flex items-center gap-2.5 px-5 py-3 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-xl shadow transition-all"
                >
                  <span className="text-lg">📊</span>
                  <div className="text-left">
                    <p className="font-bold text-sm leading-tight">Download Excel</p>
                    <p className="text-xs text-green-200 leading-tight">CSV format (.csv)</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button onClick={reset} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow transition-all">
                + Create Another Challan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}