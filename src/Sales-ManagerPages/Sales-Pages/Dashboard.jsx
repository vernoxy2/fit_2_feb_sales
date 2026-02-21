import React from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle, FiPackage, FiTrendingUp, FiShoppingCart, FiClock, FiArrowRight } from "react-icons/fi";
import { stockCategories, getCategoryAlert } from "../data/stockCategoriesData";

export default function Dashboard() {
  const navigate = useNavigate();

  // Calculate totals
  const totalLowStock = stockCategories.reduce((sum, cat) => sum + cat.lowStockCount, 0);
  const totalCritical = stockCategories.reduce((sum, cat) => sum + cat.criticalCount, 0);
  const criticalCategories = stockCategories.filter(cat => cat.criticalCount > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Sales Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Overview of sales operations and stock alerts</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Categories</p>
              <p className="text-3xl font-black text-slate-800 mt-2">21</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FiPackage size={24} className="text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-red-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-500 uppercase">Critical Items</p>
              <p className="text-3xl font-black text-red-700 mt-2">{totalCritical}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
              <FiAlertTriangle size={24} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-yellow-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-yellow-600 uppercase">Low Stock Items</p>
              <p className="text-3xl font-black text-yellow-700 mt-2">{totalLowStock}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
              <FiClock size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Total Products</p>
              <p className="text-3xl font-black text-slate-800 mt-2">1,261</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center">
              <FiShoppingCart size={24} className="text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {totalCritical > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-black text-red-900 flex items-center gap-2">
                <FiAlertTriangle className="animate-pulse" />
                Stock Alerts
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {criticalCategories.length} categories have critical stock levels
              </p>
            </div>
            <button
              onClick={() => navigate('/sales/low-stock-management')}
              className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              View All <FiArrowRight />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {criticalCategories.slice(0, 5).map((cat) => (
              <span key={cat.id} className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-300">
                {cat.name} ({cat.criticalCount} critical)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stock Category Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-800">Stock Categories</h3>
          <div className="flex gap-2">
            <span className="text-xs font-bold text-slate-500">🔴 Critical</span>
            <span className="text-xs font-bold text-slate-500">🟠 High Alert</span>
            <span className="text-xs font-bold text-slate-500">🟡 Warning</span>
            <span className="text-xs font-bold text-slate-500">🟢 Normal</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stockCategories.map((category) => {
            const alert = getCategoryAlert(category);
            return (
              <button
                key={category.id}
                onClick={() => navigate(`/sales/low-stock-management?category=${category.id}`)}
                className={`${alert.bgColor} rounded-xl border-2 ${alert.borderColor} p-5 text-left hover:shadow-lg transition-all hover:scale-105`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-3xl">{category.icon}</div>
                  <div className="text-2xl">{alert.icon}</div>
                </div>
                
                <h4 className="font-black text-slate-800 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                  {category.name}
                </h4>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Total Products:</span>
                    <span className="font-bold text-slate-800">{category.productCount}</span>
                  </div>
                  
                  {category.criticalCount > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-600">🔴 Critical:</span>
                      <span className="font-bold text-red-700">{category.criticalCount}</span>
                    </div>
                  )}
                  
                  {category.lowStockCount > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-yellow-600">⚠️ Low Stock:</span>
                      <span className="font-bold text-yellow-700">{category.lowStockCount}</span>
                    </div>
                  )}
                  
                  {category.lowStockCount === 0 && category.criticalCount === 0 && (
                    <div className="text-xs text-green-600 font-semibold">✓ All items in stock</div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    View Details <FiArrowRight size={12} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/sales/category-management')}
          className="bg-white rounded-xl border-2 border-indigo-200 p-6 text-left hover:shadow-lg transition-all hover:border-indigo-400"
        >
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
            <FiPackage size={24} className="text-indigo-600" />
          </div>
          <h4 className="font-black text-slate-800 mb-2">Manage Categories</h4>
          <p className="text-sm text-slate-600">Add or edit product categories (buckets)</p>
        </button>

        <button
          onClick={() => navigate('/sales/product-management')}
          className="bg-white rounded-xl border-2 border-emerald-200 p-6 text-left hover:shadow-lg transition-all hover:border-emerald-400"
        >
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
            <FiShoppingCart size={24} className="text-emerald-600" />
          </div>
          <h4 className="font-black text-slate-800 mb-2">Manage Products</h4>
          <p className="text-sm text-slate-600">Add products and set low stock levels</p>
        </button>

        <button
          onClick={() => navigate('/sales/purchase-orders/create')}
          className="bg-white rounded-xl border-2 border-purple-200 p-6 text-left hover:shadow-lg transition-all hover:border-purple-400"
        >
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
            <FiTrendingUp size={24} className="text-purple-600" />
          </div>
          <h4 className="font-black text-slate-800 mb-2">Create Purchase Order</h4>
          <p className="text-sm text-slate-600">Order low stock items from vendors</p>
        </button>
      </div>
    </div>
  );
}
