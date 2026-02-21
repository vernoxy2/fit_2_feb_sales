import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPackage, FiTruck, FiFileText, FiShoppingCart, FiAlertTriangle, FiClock, FiBell } from "react-icons/fi";
import { KPICard, Card, CardHeader, Alert, StatusBadge, NotificationBadge, Table } from "../SalesComponent/ui/index";
import { getSalesStats, WORK_ORDERS_ENHANCED, PURCHASE_ORDERS_ENHANCED, NOTIFICATIONS_ENHANCED, CHALLANS_ENHANCED } from "../data/salesData";

export default function SalesOrder() {
  const navigate = useNavigate();
  const stats = getSalesStats();
  const [showAlerts, setShowAlerts] = useState(true);

  const recentWorkOrders = WORK_ORDERS_ENHANCED.slice(0, 3);
  const urgentPOs = PURCHASE_ORDERS_ENHANCED.filter(po => po.status === 'overdue' || po.status === 'warning');
  const unreadNotifications = NOTIFICATIONS_ENHANCED.filter(n => !n.read).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Sales Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time overview of sales operations</p>
        </div>
        <div className="flex gap-7">

        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
          <FiFileText size={14} /> Create Sales Order
        </button>
         <button onClick={() => navigate('/sales/sales-orders/upload')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
          <FiFileText size={14} /> Upload Sales Order
        </button>
        </div>
      </div>

      {/* Critical Alerts */}
      {showAlerts && (stats.overduePOs > 0 || stats.warningPOs > 0) && (
        <Alert type="warning" onClose={() => setShowAlerts(false)}>
          <div className="space-y-1">
            <p className="font-bold">⚠️ Urgent Attention Required:</p>
            {stats.overduePOs > 0 && <p>• {stats.overduePOs} Purchase Orders are overdue</p>}
            {stats.warningPOs > 0 && <p>• {stats.warningPOs} Purchase Orders arriving in 2 days</p>}
            {stats.pendingInvoices > 0 && <p>• {stats.pendingInvoices} Challans pending invoice upload</p>}
          </div>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Active Work Orders"
          value={stats.activeWorkOrders}
          icon={FiPackage}
          color="blue"
          onClick={() => navigate('/sales/work-orders')}
        />
        <KPICard
          label="Pending Challans"
          value={stats.pendingChallans}
          icon={FiTruck}
          color="purple"
          onClick={() => navigate('/sales/challans')}
        />
        <KPICard
          label="Active Purchase Orders"
          value={stats.activePOs}
          icon={FiShoppingCart}
          color="indigo"
          onClick={() => navigate('/sales/purchase-orders')}
        />
        <KPICard
          label="Overdue POs"
          value={stats.overduePOs}
          icon={FiAlertTriangle}
          color="red"
          onClick={() => navigate('/sales/purchase-orders')}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Work Orders */}
        <Card>
          <CardHeader 
            title="Recent Sales Orders" 
            subtitle={`${stats.activeWorkOrders} active orders`}
            action={
              <button onClick={() => navigate('/sales/work-orders')} className="text-xs text-indigo-600 font-bold hover:text-indigo-700">
                View All →
              </button>
            }
          />
          <div className="divide-y divide-slate-50">
            {recentWorkOrders.map(wo => (
              <div key={wo.id} className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/sales/work-orders/${wo.id}`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-slate-800">{wo.woNumber}</p>
                      <StatusBadge status={wo.status} />
                    </div>
                    <p className="text-xs text-slate-600">{wo.customer}</p>
                    <p className="text-xs text-slate-400 mt-1">Delivery: {wo.deliveryDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">₹{(wo.totalValue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-slate-400">{wo.items.length} items</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Urgent Purchase Orders */}
        <Card>
          <CardHeader 
            title="Purchase Order Alerts" 
            subtitle={`${urgentPOs.length} requiring attention`}
            action={
              <button onClick={() => navigate('/sales/purchase-orders')} className="text-xs text-indigo-600 font-bold hover:text-indigo-700">
                View All →
              </button>
            }
          />
          <div className="divide-y divide-slate-50">
            {urgentPOs.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-slate-400">All purchase orders are on track! ✅</p>
              </div>
            ) : (
              urgentPOs.map(po => (
                <div key={po.id} className={`px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer ${po.status === 'overdue' ? 'bg-red-50' : 'bg-orange-50'}`} onClick={() => navigate(`/sales/purchase-orders/${po.id}`)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-800">{po.poNumber}</p>
                        <StatusBadge status={po.status} />
                      </div>
                      <p className="text-xs text-slate-600">{po.vendor}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <FiClock size={10} className="text-slate-400" />
                        <p className="text-xs text-slate-400">
                          {po.status === 'overdue' 
                            ? `Overdue by ${Math.abs(po.remainingDays)} days` 
                            : `${po.remainingDays} days remaining`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">₹{(po.grandTotal / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-slate-400">ETA: {po.eta}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader 
          title="Notifications" 
          subtitle={`${stats.unreadNotifications} unread`}
          action={
            <div className="flex items-center gap-2">
              <FiBell size={14} className="text-slate-400" />
              <span className="text-xs text-slate-400">{stats.unreadNotifications} new</span>
            </div>
          }
        />
        <div className="p-6 space-y-3">
          {unreadNotifications.map(notification => (
            <NotificationBadge
              key={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              time={notification.time}
              onClick={() => navigate(notification.action)}
            />
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" />
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => navigate('/sales/ViewExcelSheetData')} className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-center">
            <FiPackage className="mx-auto mb-2 text-indigo-600" size={24} />
            <p className="text-xs font-bold text-slate-700">Upload Sales Order</p>
          </button>
          <button onClick={() => navigate('/sales/challans/create')} className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-center">
            <FiTruck className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-xs font-bold text-slate-700">Create Challan</p>
          </button>
          <button onClick={() => navigate('/sales/purchase-orders/create')} className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all text-center">
            <FiShoppingCart className="mx-auto mb-2 text-emerald-600" size={24} />
            <p className="text-xs font-bold text-slate-700">Create PO</p>
          </button>
          <button onClick={() => navigate('/sales/invoices/upload')} className="p-4 border-2 border-dashed border-slate-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all text-center">
            <FiFileText className="mx-auto mb-2 text-amber-600" size={24} />
            <p className="text-xs font-bold text-slate-700">Upload Invoice</p>
          </button>
        </div>
      </Card>
    </div>
  );
}
