import React, { useState } from "react";
import { FiPlus, FiEdit2, FiSave } from "react-icons/fi";
import { stockCategories, sampleProducts } from "../data/stockCategoriesData";

export default function ProductManagement() {
  const [selectedCategory, setSelectedCategory] = useState(stockCategories[0].id);
  const [isAddMode, setIsAddMode] = useState(false);
  const [newProduct, setNewProduct] = useState({ code: "", unit: "NOS", lowLevel: 100, reorderLevel: 150 });

  // Get products for selected category (mock data)
  const products = sampleProducts[selectedCategory] || [];

  const handleAddProduct = (e) => {
    e.preventDefault();
    // In real app, save to backend
    alert(`Product "${newProduct.code}" added to category`);
    setIsAddMode(false);
    setNewProduct({ code: "", unit: "NOS", lowLevel: 100, reorderLevel: 150 });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Product Management</h2>
        <p className="text-sm text-slate-500 mt-1">Add products and set low stock levels</p>
      </div>

      {/* Category Selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <label className="block text-sm font-bold text-slate-700 mb-2">Select Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
          className="w-full md:w-1/3 border border-slate-200 rounded-lg px-3 py-2"
        >
          {stockCategories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Add Product Form */}
      {isAddMode ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-black text-slate-800 mb-4">Add New Product</h3>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Product Code/Name</label>
              <input
                type="text"
                value={newProduct.code}
                onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Unit</label>
              <select
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option>NOS</option>
                <option>KG</option>
                <option>MTR</option>
                <option>LTR</option>
                <option>SQ.M</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Low Level</label>
              <input
                type="number"
                value={newProduct.lowLevel}
                onChange={(e) => setNewProduct({ ...newProduct, lowLevel: parseInt(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2">Reorder Level</label>
              <input
                type="number"
                value={newProduct.reorderLevel}
                onChange={(e) => setNewProduct({ ...newProduct, reorderLevel: parseInt(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div className="md:col-span-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsAddMode(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2"
              >
                <FiSave /> Save Product
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsAddMode(true)}
          className="w-full bg-white rounded-xl border-2 border-dashed border-slate-300 p-6 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
        >
          <FiPlus className="mx-auto mb-2" size={24} />
          <p className="text-sm font-bold text-slate-600">Add Product to Category</p>
        </button>
      )}

      {/* Products List */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-black text-slate-800">Products in {stockCategories.find(c => c.id === selectedCategory)?.name}</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {products.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-bold text-slate-800">{product}</p>
                  <p className="text-xs text-slate-500">Unit: NOS | Low Level: 100 | Reorder: 150</p>
                </div>
                <button className="p-2 hover:bg-white rounded">
                  <FiEdit2 size={16} className="text-slate-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
