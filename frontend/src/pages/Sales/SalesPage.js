// frontend/src/pages/Sales/SalesPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sales');
      setSales(res.data.data);
    } catch (error) {
      toast.error('Gagal mengambil data penjualan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Penjualan</h1>
        <button
          onClick={() => navigate('/sales/new')}
          className="btn-primary flex items-center space-x-2"
        >
          <FiPlus /> <span>Transaksi Baru</span>
        </button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-center py-8">Loading...</p>
        ) : sales.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Tidak ada penjualan</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-3">No. Invoice</th>
                <th className="pb-3">Tanggal</th>
                <th className="pb-3">Channel</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/sales/${sale.id}`)}
                >
                  <td className="py-3 font-mono">{sale.invoice_number}</td>
                  <td className="py-3">
                    {format(new Date(sale.created_at), 'dd MMM yyyy HH:mm', {
                      locale: id,
                    })}
                  </td>
                  <td className="py-3">{sale.channel_name}</td>
                  <td className="py-3">{sale.customer_name || '-'}</td>
                  <td className="py-3 font-semibold">
                    Rp {sale.total_amount?.toLocaleString() || 0}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        sale.transaction_status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {sale.transaction_status}
                    </span>
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
