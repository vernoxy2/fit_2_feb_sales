import React, { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiPackage } from "react-icons/fi";
import { stockCategories } from "../data/stockCategoriesData";

export default function CategoryManagement() {
  const [categories, setCategories] = useState(stockCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", icon: "📦" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      // Update
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? { ...cat, ...formData } : cat
      ));
    } else {
      // Add new
      const newCategory = {
        id: Math.max(...categories.map(c => c.id)) + 1,
        ...formData,
        productCount: 0,
        lowStockCount: 0,
        criticalCount: 0
      };
      setCategories([...categories, newCategory]);
    }
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", icon: "📦" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Category Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage product categories (buckets)</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2"
        >
          <FiPlus /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <div key={category.id} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">{category.icon}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setFormData({ name: category.name, icon: category.icon });
                    setIsModalOpen(true);
                  }}
                  className="p-2 hover:bg-slate-100 rounded"
                >
                  <FiEdit2 size={14} />
                </button>
                <button className="p-2 hover:bg-red-50 text-red-600 rounded">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="font-black text-slate-800 text-sm mb-2">{category.name}</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <div>Products: {category.productCount}</div>
              <div>Low Stock: {category.lowStockCount}</div>
              <div>Critical: {category.criticalCount}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-black text-slate-800 mb-4">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  maxLength={2}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingCategory(null);
                    setFormData({ name: "", icon: "📦" });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  {editingCategory ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
