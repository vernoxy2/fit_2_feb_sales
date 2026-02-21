import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiClock, FiAlertTriangle, FiCheck, FiEye, FiPlus, FiFilter } from "react-icons/fi";
import { Card, CardHeader, KPICard, StatusBadge, Table, Alert, BtnPrimary, Select } from "../SalesComponent/ui/index";
import { PURCHASE_ORDERS_ENHANCED, calculatePOStatus } from "../data/salesData";

export default function PurchaseOrderList() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("all");

  // Calculate stats
  const totalPOs = PURCHASE_ORDERS_ENHANCED.length;
  const pendingPOs = PURCHASE_ORDERS_ENHANCED.filter(po => po.status === 'pending').length;
  const warningPOs = PURCHASE_ORDERS_ENHANCED.filter(po => po.status === 'warning').length;
  const overduePOs = PURCHASE_ORDERS_ENHANCED.filter(po => po.status === 'overdue').length;

  // Filter POs
  const filteredPOs = filterStatus === "all" 
    ? PURCHASE_ORDERS_ENHANCED 
    : PURCHASE_ORDERS_ENHANCED.filter(po => po.status === filterStatus);

  // Get urgent POs (warning + overdue)
  const urgentPOs = PURCHASE_ORDERS_ENHANCED.filter(po => po.status === 'warning' || po.status === 'overdue');

  const getStatusColor = (status) => {
    switch(status) {
      case 'overdue': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'pending': return 'text-blue-600';
      case 'received': return 'text-emerald-600';
      default: return 'text-slate-600';
    }
  };

  const getETADisplay = (po) => {
    if (po.status === 'overdue') {
      return `Overdue by ${Math.abs(po.remainingDays)} days`;
    } else if (po.status === 'warning') {
      return `${po.remainingDays} days remaining`;
    } else {
      return `${po.remainingDays} days remaining`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center  justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Purchase Orders</h2>
          <p className="text-xs text-slate-400 mt-0.5">Track vendor orders and material arrival</p>
        </div>
        <div className="flex gap-9">
        <BtnPrimary onClick={() => navigate('/sales/purchase-orders/create')}>
          <FiPlus size={14} /> Create PO
        </BtnPrimary>
        <BtnPrimary onClick={() => navigate('/sales/purchase-orders/upload')}>
          <FiPlus size={14} /> Upload PO
        </BtnPrimary>

        </div>
      </div>

      {/* Critical Alerts */}
      {(overduePOs > 0 || warningPOs > 0) && (
        <Alert type="warning">
          <div className="space-y-1">
            <p className="font-bold">⚠️ Purchase Order Alerts:</p>
            {overduePOs > 0 && <p>• {overduePOs} POs are overdue - Follow up with vendors urgently</p>}
            {warningPOs > 0 && <p>• {warningPOs} POs arriving in 2 days - Prepare for receipt</p>}
          </div>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Purchase Orders"
          value={totalPOs}
          icon={FiShoppingCart}
          color="indigo"
        />
        <KPICard
          label="Pending"
          value={pendingPOs}
          icon={FiClock}
          color="blue"
        />
        <KPICard
          label="Warning (2 Days)"
          value={warningPOs}
          icon={FiAlertTriangle}
          color="amber"
        />
        <KPICard
          label="Overdue"
          value={overduePOs}
          icon={FiAlertTriangle}
          color="red"
        />
      </div>

      {/* Urgent Actions Required */}
      {urgentPOs.length > 0 && (
        <Card>
          <CardHeader 
            title="Urgent Actions Required" 
            subtitle={`${urgentPOs.length} POs need immediate attention`}
          />
          <div className="divide-y divide-slate-50">
            {urgentPOs.map(po => (
              <div 
                key={po.id} 
                className={`px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${po.status === 'overdue' ? 'bg-red-50' : 'bg-orange-50'}`}
                onClick={() => navigate(`/sales/purchase-orders/${po.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="text-sm font-bold text-slate-800">{po.poNumber}</p>
                      <StatusBadge status={po.status} />
                    </div>
                    <p className="text-sm text-slate-600">{po.vendor}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <FiClock size={12} className={getStatusColor(po.status)} />
                        <span className={`font-bold ${getStatusColor(po.status)}`}>
                          {getETADisplay(po)}
                        </span>
                      </div>
                      <span className="text-slate-400">ETA: {po.eta}</span>
                      <span className="text-slate-400">{po.items.length} items</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">₹{(po.grandTotal / 1000).toFixed(0)}K</p>
                    {po.status === 'overdue' ? (
                      <button className="mt-2 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">
                        Follow Up
                      </button>
                    ) : (
                      <button className="mt-2 px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700">
                        Prepare Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All Purchase Orders */}
      <Card>
        <CardHeader 
          title="All Purchase Orders" 
          subtitle={`${filteredPOs.length} orders`}
          action={
            <div className="flex items-center gap-2">
              <FiFilter size={12} className="text-slate-400" />
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "pending", label: "Pending" },
                  { value: "warning", label: "Warning" },
                  { value: "overdue", label: "Overdue" },
                  { value: "received", label: "Received" },
                ]}
                className="text-xs"
              />
            </div>
          }
        />
        <Table
          headers={[
            { label: "PO Number" },
            { label: "Vendor" },
            { label: "Date" },
            { label: "ETA" },
            { label: "Items", align: "center" },
            { label: "Amount", align: "right" },
            { label: "Status", align: "center" },
            { label: "Action", align: "center" },
          ]}
        >
          {filteredPOs.map(po => (
            <tr key={po.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-4">
                <p className="text-sm font-bold text-slate-800 font-mono">{po.poNumber}</p>
                <p className="text-xs text-slate-400 mt-0.5">{po.createdDate}</p>
              </td>
              <td className="px-5 py-4">
                <p className="text-sm text-slate-700">{po.vendor}</p>
                <p className="text-xs text-slate-400 mt-0.5">{po.vendorContact}</p>
              </td>
              <td className="px-5 py-4">
                <p className="text-sm text-slate-600">{po.date}</p>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <FiClock size={14} className={getStatusColor(po.status)} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{po.eta}</p>
                    <p className={`text-xs font-bold ${getStatusColor(po.status)}`}>
                      {getETADisplay(po)}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-center">
                <p className="text-sm font-bold text-slate-800">{po.items.length}</p>
              </td>
              <td className="px-5 py-4 text-right">
                <p className="text-sm font-bold text-slate-800">₹{po.grandTotal.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">incl. GST</p>
              </td>
              <td className="px-5 py-4 text-center">
                <StatusBadge status={po.status} />
              </td>
              <td className="px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={() => navigate(`/sales/purchase-orders/${po.id}`)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    title="View Details"
                  >
                    <FiEye size={14} />
                  </button>
                  {(po.status === 'warning' || po.status === 'overdue') && (
                    <button 
                      onClick={() => navigate('/sales/purchase-orders/upload-invoice')}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
                    >
                      Receive
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>

        {filteredPOs.length === 0 && (
          <div className="p-12 text-center">
            <FiShoppingCart size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No Purchase Orders Found</p>
            <p className="text-xs text-slate-400 mt-1">
              {filterStatus === "all" ? "Create your first purchase order" : `No ${filterStatus} orders`}
            </p>
            {filterStatus === "all" && (
              <BtnPrimary onClick={() => navigate('/sales/purchase-orders/create')} className="mt-4 mx-auto">
                <FiPlus size={14} /> Create Purchase Order
              </BtnPrimary>
            )}
          </div>
        )}
      </Card>

      {/* ETA Legend */}
      <Card>
        <div className="p-6">
          <p className="text-xs font-bold text-slate-700 mb-4">📅 ETA Status Legend:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-xs font-bold text-slate-700">Pending</p>
                <p className="text-xs text-slate-400">More than 2 days</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div>
                <p className="text-xs font-bold text-slate-700">Warning</p>
                <p className="text-xs text-slate-400">2 days or less</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <p className="text-xs font-bold text-slate-700">Overdue</p>
                <p className="text-xs text-slate-400">ETA passed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <div>
                <p className="text-xs font-bold text-slate-700">Received</p>
                <p className="text-xs text-slate-400">Material arrived</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
