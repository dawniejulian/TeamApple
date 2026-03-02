// frontend/src/pages/Inventory/InventoryPage.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      setInventory(res.data.data);
    } catch (error) {
      toast.error('Gagal mengambil data stok');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Stok</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-gray-600">Total Produk</p>
          <p className="text-3xl font-bold">{inventory.length}</p>
        </div>
        <div className="card">
          <p className="text-gray-600">Stok Tersedia</p>
          <p className="text-3xl font-bold">
            {inventory.reduce((sum, item) => sum + item.quantity_available, 0)}
          </p>
        </div>
        <div className="card">
          <p className="text-gray-600">Stok Rusak</p>
          <p className="text-3xl font-bold text-red-600">
            {inventory.reduce((sum, item) => sum + item.quantity_damaged, 0)}
          </p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-3">Produk</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Lokasi</th>
                <th className="pb-3">Tersedia</th>
                <th className="pb-3">Dipesan</th>
                <th className="pb-3">Rusak</th>
                <th className="pb-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{item.product_name}</td>
                  <td className="py-3">{item.sku}</td>
                  <td className="py-3">{item.warehouse_name}</td>
                  <td className="py-3 font-semibold text-green-600">
                    {item.quantity_available}
                  </td>
                  <td className="py-3">{item.quantity_reserved}</td>
                  <td className="py-3 text-red-600">{item.quantity_damaged}</td>
                  <td className="py-3 font-bold">
                    {item.quantity_available + item.quantity_reserved + item.quantity_damaged}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
