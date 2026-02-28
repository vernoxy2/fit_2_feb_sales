import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection, query, where, getDocs,
  doc, getDoc, addDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";

// ── helpers ──────────────────────────────────────────────────────────────────
async function lookupStock(productCode) {
  try {
    const q = query(collection(db, "stock"), where("productCode", "==", productCode.toUpperCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0].data();
      return {
        description: d.description || d.productName || "",
        hsn: d.hsn || d.hsnCode || "",
        unit: d.unit || "",
        stock: d.quantity ?? d.availableQty ?? 0,
        found: true,
      };
    }
  } catch (e) { console.error(e); }
  return { description: "", hsn: "", unit: "", stock: 0, found: false };
}

function generateChallanNo() {
  const d = new Date();
  return `CH-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

function exportPDF(header, rows, challanNo) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <title>Delivery Challan - ${challanNo}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11px;color:#111;padding:20px}
    .hbox{border:2px solid #111;padding:10px}.title{text-align:center;font-size:16px;font-weight:bold;text-decoration:underline;margin-bottom:8px}
    .g2{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid #111}
    .g3{display:grid;grid-template-columns:1fr 1fr 1fr;border-top:1px solid #111}
    .cell{padding:5px 8px;border-right:1px solid #111;border-bottom:1px solid #111}.cell:last-child{border-right:none}
    .cl{font-size:9px;color:#555;font-weight:bold;text-transform:uppercase}.cv{font-size:11px;font-weight:bold;margin-top:2px;word-break:break-word}
    .stitle{background:#1e293b;color:white;padding:5px 8px;font-size:10px;font-weight:bold;text-transform:uppercase;border:1px solid #111;border-top:none}
    table{width:100%;border-collapse:collapse}th{background:#f1f5f9;padding:6px 8px;text-align:left;font-size:10px;font-weight:bold;border:1px solid #111;text-transform:uppercase}
    td{padding:5px 8px;border:1px solid #ccc;font-size:11px}tfoot td{font-weight:bold;background:#f1f5f9;border-top:2px solid #111}
    .sbox{display:grid;grid-template-columns:1fr 1fr 1fr;border:1px solid #111;border-top:none}
    .sc{padding:30px 10px 10px;border-right:1px solid #111;text-align:center;font-size:10px;font-weight:bold}.sc:last-child{border-right:none}
  </style></head><body>
  <div class="hbox"><div class="title">DELIVERY CHALLAN</div>
    <div class="g3">
      <div class="cell"><div class="cl">Challan No</div><div class="cv">${challanNo}</div></div>
      <div class="cell"><div class="cl">Date</div><div class="cv">${header.challanDate || ''}</div></div>
      <div class="cell"><div class="cl">SO Reference</div><div class="cv">${header.soNumber || ''}</div></div>
    </div>
    <div class="g2">
      <div class="cell"><div class="cl">Company</div><div class="cv">${header.companyName || ''}</div></div>
      <div class="cell"><div class="cl">Customer</div><div class="cv">${header.customer || ''}</div></div>
    </div>
    <div class="g3">
      <div class="cell"><div class="cl">GSTIN</div><div class="cv">${header.gstin || ''}</div></div>
      <div class="cell"><div class="cl">State</div><div class="cv">${header.state || ''}</div></div>
      <div class="cell"><div class="cl">Approx Invoice Date</div><div class="cv">${header.approxInvoiceDate || ''}</div></div>
    </div>
    <div class="g3">
      <div class="cell"><div class="cl">Vehicle No</div><div class="cv">${header.vehicleNo || '—'}</div></div>
      <div class="cell"><div class="cl">Driver</div><div class="cv">${header.driverName || '—'}</div></div>
      <div class="cell"><div class="cl">Transporter</div><div class="cv">${header.transporterName || '—'}</div></div>
    </div>
  </div>
  <div class="stitle">ITEMS / PRODUCTS</div>
  <table><thead><tr>
    <th style="width:30px">SL</th><th>Part No</th><th>Description</th><th>HSN/SAC</th>
    <th style="text-align:right">Qty</th><th>Unit</th><th>Remarks</th>
  </tr></thead><tbody>
    ${rows.map((r, i) => `<tr><td>${i + 1}</td><td><b>${r.productCode || ''}</b></td><td>${r.description || ''}</td><td>${r.hsn || ''}</td><td style="text-align:right"><b>${r.dispatchQty}</b></td><td>${r.unit || ''}</td><td>${r.remarks || ''}</td></tr>`).join('')}
  </tbody><tfoot><tr>
    <td colspan="4" style="text-align:right">TOTAL</td>
    <td style="text-align:right">${rows.reduce((s, r) => s + (Number(r.dispatchQty) || 0), 0)}</td>
    <td colspan="2"></td>
  </tr></tfoot></table>
  <div class="sbox"><div class="sc">Prepared By</div><div class="sc">Checked By</div><div class="sc">Authorised Signatory</div></div>
  </body></html>`;
  const w = window.open('', '_blank', 'width=900,height=700');
  w.document.write(html); w.document.close();
  w.onload = () => { w.focus(); w.print(); };
}

function exportCSV(header, rows, challanNo) {
  const lines = [
    ["DELIVERY CHALLAN"], ["Challan No", challanNo], ["Date", header.challanDate], [""],
    ["Customer", header.customer], ["SO Reference", header.soNumber],
    ["Vehicle No", header.vehicleNo], ["Driver", header.driverName], ["Transporter", header.transporterName], [""],
    ["SL", "Part No", "Description", "HSN/SAC", "Dispatch Qty", "Unit", "Remarks"],
    ...rows.map((r, i) => [i + 1, r.productCode, r.description, r.hsn, r.dispatchQty, r.unit, r.remarks || ""]),
  ];
  const csv = lines.map((r) => r.map((c) => `"${c ?? ""}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = `${challanNo}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function DispatchOnChallan() {
  const navigate = useNavigate();

  const params  = new URLSearchParams(window.location.search);
  const urlSoId = params.get("soId");
  const isEdit  = params.get("edit") === "true";

  const [step, setStep]                           = useState(urlSoId ? 2 : 1);
  const [soList, setSoList]                       = useState([]);
  const [challanMap, setChallanMap]               = useState({}); // soId → true if generated
  const [loadingSOs, setLoadingSOs]               = useState(!urlSoId);
  const [selectedSO, setSelectedSO]               = useState(null);
  const [loadingDetail, setLoadingDetail]         = useState(!!urlSoId);
  const [isEditMode]                              = useState(isEdit);
  const [existingChallanId, setExistingChallanId] = useState(null);
  const [challanNoState, setChallanNoState]       = useState(generateChallanNo());

  // Form fields
  const [challanDate]                         = useState(new Date().toLocaleDateString("en-IN"));
  const [approxInvoiceDate, setApproxInvoiceDate] = useState("");
  const [vehicleNo, setVehicleNo]             = useState("");
  const [driverName, setDriverName]           = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [deliveryNote, setDeliveryNote]       = useState("");
  const [rows, setRows]                       = useState([]);
  const [saving, setSaving]                   = useState(false);

  useEffect(() => {
    if (urlSoId) {
      loadSODetail(urlSoId);
    } else {
      fetchSOs();
    }
  }, []);

  // ── fetch Step-1 list ──
  const fetchSOs = async () => {
    try {
      setLoadingSOs(true);
      const q = query(collection(db, "excelupload"), where("soStatus", "in", ["complete", "ready_to_dispatch"]));
      const snap = await getDocs(q);
      setSoList(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((d) => !d.linkedSoId && d.type !== "SALES_INVOICE"));

      // challan map
      const cSnap = await getDocs(collection(db, "challans"));
      const map = {};
      cSnap.docs.forEach((d) => { if (d.data().soId) map[d.data().soId] = true; });
      setChallanMap(map);
    } catch (e) { console.error(e); }
    finally { setLoadingSOs(false); }
  };

  // ── load SO + prefill if edit ──
  const loadSODetail = async (soId) => {
    try {
      setLoadingDetail(true);
      const snap = await getDoc(doc(db, "excelupload", soId));
      if (!snap.exists()) return;
      const data = { id: snap.id, ...snap.data() };
      setSelectedSO(data);

      if (isEdit) {
        const cSnap = await getDocs(query(collection(db, "challans"), where("soId", "==", soId)));
        if (!cSnap.empty) {
          const existing = cSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))[0];
          setExistingChallanId(existing.id);
          setChallanNoState(existing.challanNo);
          const h = existing.header || {};
          setApproxInvoiceDate(h.approxInvoiceDate || "");
          setVehicleNo(h.vehicleNo || "");
          setDriverName(h.driverName || "");
          setTransporterName(h.transporterName || "");
          setDeliveryNote(h.deliveryNote || "");
          setRows(existing.items || []);
          setStep(2);
          return;
        }
      }

      // New — build rows from SO items
      const items = Array.isArray(data.items) ? data.items : [];
      setRows(items.map((item) => ({
        productCode: item.productCode || "",
        description: item.description || "",
        hsn: item.hsnSac || item.hsnSAC || item.hsn || item.hsnCode || "",
        unit: item.unit || "",
        soQty: item.totalInvoicedQty ?? item.quantity ?? 0,
        dispatchQty: item.totalInvoicedQty ?? item.quantity ?? 0,
        stockAvail: 0, remarks: "", matched: true,
      })));
      setStep(2);
    } catch (e) { console.error(e); }
    finally { setLoadingDetail(false); }
  };

  const addRow    = () => setRows((p) => [...p, { productCode: "", description: "", hsn: "", unit: "", soQty: 0, dispatchQty: 0, stockAvail: 0, remarks: "", matched: false }]);
  const removeRow = (i) => setRows((p) => p.filter((_, idx) => idx !== i));
  const updateRow = async (i, field, value) => {
    setRows((p) => { const n = [...p]; n[i] = { ...n[i], [field]: value }; return n; });
    if (field === "productCode" && value.length >= 2) {
      const info = await lookupStock(value);
      setRows((p) => {
        const n = [...p];
        if (info.found) n[i] = { ...n[i], description: info.description, hsn: info.hsn, unit: info.unit, stockAvail: info.stock, matched: true };
        else n[i] = { ...n[i], matched: false, stockAvail: 0 };
        return n;
      });
    }
  };

  const getHeader = () => ({
    challanDate, approxInvoiceDate, vehicleNo, driverName, transporterName, deliveryNote,
    soNumber:     selectedSO?.soNumber || selectedSO?.excelHeader?.voucherNo || selectedSO?.id,
    customer:     selectedSO?.customer || selectedSO?.excelHeader?.buyer || "",
    companyName:  selectedSO?.excelHeader?.companyName || "",
    address:      selectedSO?.excelHeader?.address || "",
    gstin:        selectedSO?.excelHeader?.gstin || "",
    state:        selectedSO?.excelHeader?.state || "",
    email:        selectedSO?.excelHeader?.email || "",
    voucherNo:    selectedSO?.excelHeader?.voucherNo || "",
    paymentTerms: selectedSO?.excelHeader?.paymentTerms || "",
    consignee:    selectedSO?.excelHeader?.consignee || "",
    destination:  selectedSO?.excelHeader?.destination || "",
    invoiceNos:   Array.isArray(selectedSO?.invoiceNos) ? selectedSO.invoiceNos.join(", ") : (selectedSO?.invoiceNo || ""),
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const header = getHeader();
      if (isEditMode && existingChallanId) {
        // EDIT → only updateDoc
        await updateDoc(doc(db, "challans", existingChallanId), {
          updatedAt: serverTimestamp(), header, items: rows,
        });
      } else {
        // CREATE → addDoc once
        await addDoc(collection(db, "challans"), {
          challanNo: challanNoState, createdAt: serverTimestamp(),
          soId: selectedSO.id, header, items: rows, status: "dispatched",
        });
      }
      setStep(3);
    } catch (e) {
      console.error(e); alert("Error saving challan: " + e.message);
    } finally { setSaving(false); }
  };

  const challanNo = challanNoState;
  const header    = selectedSO ? getHeader() : {};

  if (loadingDetail) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">{isEditMode ? "Loading challan for editing..." : "Loading SO details..."}</p>
        </div>
      </div>
    );
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-slate-800">
            {isEditMode ? "Edit Challan" : "Dispatch on Challan"}
          </h2>
          {isEditMode && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-300 text-xs font-bold rounded-full">
              ✏️ Edit Mode
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-0.5">
          {isEditMode ? `Editing: ${challanNo}` : "Create delivery challan for ready-to-dispatch orders"}
        </p>
      </div>

      {/* Steps */}
      <div className="flex items-center">
        {[{ n: 1, label: "Select SO" }, { n: 2, label: isEditMode ? "Edit Challan" : "Fill Challan" }, { n: 3, label: "Done" }].map((s, idx) => (
          <React.Fragment key={s.n}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step >= s.n ? (isEditMode ? "bg-amber-500 text-white" : "bg-indigo-600 text-white") : "bg-slate-200 text-slate-500"}`}>
                {step > s.n ? "✓" : s.n}
              </div>
              <span className={`text-sm font-semibold ${step >= s.n ? (isEditMode ? "text-amber-600" : "text-indigo-700") : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {idx < 2 && <div className={`flex-1 h-0.5 mx-3 ${step > s.n ? (isEditMode ? "bg-amber-400" : "bg-indigo-400") : "bg-slate-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── STEP 1: SO list with status ── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">Select Sales Order</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {loadingSOs ? "Loading..." : `${soList.length} orders ready to dispatch`}
            </p>
          </div>

          {loadingSOs ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
            </div>
          ) : soList.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-500">No orders ready to dispatch</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["SO Number", "Customer", "Items", "Invoice Nos", "Challan Status", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {soList.map((so) => {
                  const isGenerated = !!challanMap[so.id];
                  return (
                    <tr
                      key={so.id}
                      onClick={() => navigate(`/sales/dispatch-detail/${so.id}`)}
                      className="border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-indigo-700 text-sm">{so.soNumber || so.excelHeader?.voucherNo || so.id}</span>
                        <p className="text-xs text-slate-400">{so.excelHeader?.dated || ""}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-700">{so.customer || so.excelHeader?.buyer || "—"}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">{Array.isArray(so.items) ? so.items.length : "—"}</td>
                      <td className="px-4 py-3.5 text-xs font-mono text-slate-600">
                        {Array.isArray(so.invoiceNos) ? so.invoiceNos.join(", ") : so.invoiceNo || "—"}
                      </td>

                      {/* STATUS BADGE */}
                      <td className="px-4 py-3.5">
                        {isGenerated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                            ✅ Generated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                            📝 Draft
                          </span>
                        )}
                      </td>

                      {/* ACTION — stop row propagation */}
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        {isGenerated ? (
                          // Generated → no button
                          <span className="text-xs text-slate-400 italic">—</span>
                        ) : (
                          // Draft → Create Challan
                          <button
                            onClick={() => loadSODetail(so.id)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                          >
                            🚚 Create Challan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── STEP 2: Fill form ── */}
      {step === 2 && selectedSO && (
        <div className="space-y-4">

          {isEditMode && (
            <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-lg">✏️</span>
              <div>
                <p className="text-sm font-bold text-amber-800">Editing: {challanNo}</p>
                <p className="text-xs text-amber-600">Changes will update the existing challan — no new challan will be created</p>
              </div>
            </div>
          )}

          {/* Section 1: Header */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`px-5 py-3 ${isEditMode ? "bg-amber-500" : "bg-indigo-600"}`}>
              <h3 className="text-sm font-bold text-white">1. Header Information</h3>
            </div>
            <div className="p-5 grid grid-cols-3 gap-4">
              {[
                { label: "Challan No",    value: challanNo,           readOnly: true, mono: true },
                { label: "Challan Date",  value: challanDate,          readOnly: true },
                { label: "SO Reference",  value: header.soNumber,      readOnly: true, bold: true },
                { label: "Customer",      value: header.customer,      readOnly: true },
                { label: "Company Name",  value: header.companyName,   readOnly: true, span: 2 },
                { label: "Address",       value: header.address,       readOnly: true, span: 2 },
                { label: "GSTIN",         value: header.gstin,         readOnly: true, mono: true },
                { label: "State",         value: header.state,         readOnly: true },
                { label: "Email",         value: header.email,         readOnly: true },
                { label: "PO/Voucher No", value: header.voucherNo,     readOnly: true },
                { label: "Payment Terms", value: header.paymentTerms,  readOnly: true },
                { label: "Consignee",     value: header.consignee,     readOnly: true },
                { label: "Destination",   value: header.destination,   readOnly: true },
              ].map((f) => (
                <div key={f.label} className={f.span === 2 ? "col-span-2" : ""}>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">{f.label}</label>
                  <input
                    value={f.value || ""}
                    readOnly={f.readOnly}
                    className={`w-full px-3 py-2 text-sm border rounded-lg
                      ${f.readOnly ? "bg-slate-50 border-slate-200" : "border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"}
                      ${f.mono ? "font-mono" : ""} ${f.bold ? "font-bold text-indigo-700" : "text-slate-700"}`}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Invoice Nos (Unbilled)</label>
                <div className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg bg-amber-50 text-amber-800 font-semibold">
                  {header.invoiceNos || "—"} <span className="text-xs text-amber-500">(unbilled)</span>
                </div>
              </div>

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
                <input value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} placeholder="GJ-06-AB-1234"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Driver Name</label>
                <input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="Driver name"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Transporter</label>
                <input value={transporterName} onChange={(e) => setTransporterName(e.target.value)} placeholder="Transporter name"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Delivery Note</label>
                <textarea value={deliveryNote} onChange={(e) => setDeliveryNote(e.target.value)} rows={2} placeholder="Special instructions..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
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
                      <td className="px-3 py-2 text-sm text-slate-500">{i + 1}</td>
                      <td className="px-3 py-2">
                        <input value={row.productCode} onChange={(e) => updateRow(i, "productCode", e.target.value)}
                          className={`w-28 px-2 py-1.5 text-xs border rounded font-mono focus:outline-none ${row.matched ? "border-green-300 bg-green-50" : "border-slate-200"}`} />
                      </td>
                      <td className="px-3 py-2">
                        <input value={row.description} onChange={(e) => updateRow(i, "description", e.target.value)}
                          className="w-44 px-2 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={row.hsn} onChange={(e) => updateRow(i, "hsn", e.target.value)}
                          className="w-24 px-2 py-1.5 text-xs border border-slate-200 rounded font-mono bg-slate-50 focus:outline-none" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={row.unit} onChange={(e) => updateRow(i, "unit", e.target.value)}
                          className="w-16 px-2 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none text-center" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-sm font-bold text-slate-600">{row.soQty}</span>
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" value={row.dispatchQty} onChange={(e) => updateRow(i, "dispatchQty", Number(e.target.value))} min={0}
                          className={`w-20 px-2 py-1.5 text-sm border rounded text-center font-bold focus:outline-none
                            ${row.dispatchQty > row.soQty ? "border-red-300 bg-red-50 text-red-700" : "border-indigo-300 bg-indigo-50 text-indigo-700"}`} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-xs font-bold ${row.stockAvail > 0 ? "text-green-600" : "text-slate-400"}`}>
                          {row.matched ? row.stockAvail : "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <input value={row.remarks} onChange={(e) => updateRow(i, "remarks", e.target.value)} placeholder="Optional"
                          className="w-28 px-2 py-1.5 text-xs border border-slate-200 rounded focus:outline-none" />
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
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

          {/* Save button */}
          <div className="flex items-center justify-between pt-1">
            <button onClick={() => window.history.back()}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
              ← Cancel
            </button>
            <div className="flex items-center gap-3">
              {!approxInvoiceDate && <p className="text-xs text-amber-600 font-semibold">⚠ Set Approx. Invoice Date first</p>}
              <button
                onClick={handleSave}
                disabled={!approxInvoiceDate || rows.length === 0 || saving}
                className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg shadow transition-all
                  ${approxInvoiceDate && rows.length > 0 && !saving
                    ? isEditMode ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
              >
                {saving ? "⏳ Saving..." : isEditMode ? "✏️ Update Challan" : "📋 Create Challan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 3: Done ── */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className={`px-6 py-5 flex items-center gap-4 ${isEditMode ? "bg-amber-500" : "bg-green-600"}`}>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
              {isEditMode ? "✏️" : "✅"}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {isEditMode ? "Challan Updated Successfully!" : "Challan Created Successfully!"}
              </h3>
              <p className="text-sm text-white opacity-80 mt-0.5">{challanNo} • Saved to Firebase</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {[["Challan No", challanNo], ["Customer", header.customer], ["SO Reference", header.soNumber],
                ["Approx Invoice Date", approxInvoiceDate], ["Vehicle No", vehicleNo || "—"], ["Transporter", transporterName || "—"],
              ].map(([label, val]) => (
                <div key={label} className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-400 font-semibold">{label}</p>
                  <p className="text-sm text-slate-800 font-bold mt-0.5">{val}</p>
                </div>
              ))}
            </div>

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

            <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
              <p className="text-sm font-bold text-slate-700 mb-3">📥 Download Challan</p>
              <div className="flex gap-3">
                <button onClick={() => exportPDF(getHeader(), rows, challanNo)}
                  className="flex items-center gap-2.5 px-5 py-3 bg-red-700 hover:bg-red-500 text-white text-sm font-bold rounded-xl shadow">
                  <span className="text-lg">📄</span>
                  <div><p className="font-bold leading-tight">Download PDF</p><p className="text-xs text-red-200">Print ready</p></div>
                </button>
                <button onClick={() => exportCSV(getHeader(), rows, challanNo)}
                  className="flex items-center gap-2.5 px-5 py-3 bg-green-700 hover:bg-green-800 text-white text-sm font-bold rounded-xl shadow">
                  <span className="text-lg">📊</span>
                  <div><p className="font-bold leading-tight">Download Excel</p><p className="text-xs text-green-200">CSV format</p></div>
                </button>
              </div>
            </div>

            <button onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-slate-300 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50">
              ← Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}