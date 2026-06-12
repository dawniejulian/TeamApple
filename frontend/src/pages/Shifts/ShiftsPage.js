// frontend/src/pages/Shifts/ShiftsPage.js
import React, { useEffect, useState } from 'react';
import { FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOpenForm, setShowOpenForm] = useState(false);
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [closeData, setCloseData] = useState({ actual_amount: '', notes: '' });

  const format24h = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    const pad = (num) => String(num).padStart(2, '0');
    const date = pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
    const time = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    return `${date} ${time}`;
  };

  useEffect(() => {
    fetchShifts();
    fetchCurrentShift();
  }, []);

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts/history?limit=10');
      setShifts(res.data.data || []);
    } catch (error) {
      toast.error('Gagal mengambil riwayat shift');
    }
  };

  const fetchCurrentShift = async () => {
    try {
      const res = await api.get('/shifts/open-shift');
      setCurrentShift(res.data.data);
    } catch (error) {
      setCurrentShift(null);
    }
  };

  const handleOpenShift = async (floatAmount) => {
    setLoading(true);
    try {
      await api.post('/shifts/open', { float_amount: parseFloat(floatAmount) });
      toast.success('Shift berhasil dibuka');
      setShowOpenForm(false);
      fetchCurrentShift();
      fetchShifts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuka shift');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async () => {
    if (!closeData.actual_amount) {
      toast.error('Masukkan jumlah uang di kasir');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/shifts/${currentShift.id}/close`, {
        actual_amount: parseFloat(closeData.actual_amount),
        discrepancy_notes: closeData.notes
      });
      toast.success('Shift berhasil ditutup');
      setShowCloseForm(false);
      setCloseData({ actual_amount: '', notes: '' });
      fetchCurrentShift();
      fetchShifts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menutup shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold page-title section-enter">Manajemen Shift</h1>
        {!currentShift && (
          <button
            onClick={() => setShowOpenForm(true)}
            className="btn-primary"
          >
            Buka Shift
          </button>
        )}
      </div>

      {/* Current Shift Card */}
      {currentShift && (
        <div className="card border-2 border-emerald-300/70 bg-emerald-50/50 section-enter">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
                <FiClock className="text-green-600" size={28} />
                Shift Aktif
              </h2>
              <p className="text-gray-600 mt-2">
                Kasir: <strong className="text-blue-900">{currentShift.first_name || currentShift.username}</strong> | Dibuka: {format24h(currentShift.opened_at)}
              </p>
              <p className="text-lg font-semibold mt-3">
                Float: Rp {parseInt(currentShift.float_amount).toLocaleString('id-ID')}
              </p>
              <p className="text-lg font-semibold">
                Total Penjualan: Rp {parseInt(currentShift.total_sales || 0).toLocaleString('id-ID')}
              </p>
              <p className="text-lg font-semibold">
                Ekspektasi Kasir: Rp {parseInt(currentShift.expected_amount || 0).toLocaleString('id-ID')}
              </p>
            </div>
            <button
              onClick={() => setShowCloseForm(true)}
              className="btn-danger px-6 py-3 font-semibold"
            >
              Tutup Shift
            </button>
          </div>
        </div>
      )}

      {/* Open Shift Form */}
      {showOpenForm && (
        <div className="modal-backdrop flex items-center justify-center p-4 z-50">
          <div className="modal-card rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-blue-950">Buka Shift Baru</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label mb-2">Nominal Float (Rp)</label>
                <input
                  type="number"
                  id="floatAmount"
                  defaultValue="1000000"
                  className="form-input"
                  placeholder="Jumlah uang awal di kasir"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const amount = document.getElementById('floatAmount').value;
                    handleOpenShift(amount);
                  }}
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Buka Shift'}
                </button>
                <button
                  onClick={() => setShowOpenForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close Shift Form */}
      {showCloseForm && currentShift && (
        <div className="modal-backdrop flex items-center justify-center p-4 z-50">
          <div className="modal-card rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-blue-950">Tutup Shift</h3>
            <div className="space-y-4">
              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200/70">
                <p className="text-sm text-blue-700">Ekspektasi</p>
                <p className="text-2xl font-bold">
                  Rp {parseInt(currentShift.expected_amount || 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <label className="form-label mb-2">Jumlah Uang Aktual (Rp)</label>
                <input
                  type="number"
                  value={closeData.actual_amount}
                  onChange={(e) => setCloseData({ ...closeData, actual_amount: e.target.value })}
                  className="form-input"
                  placeholder="Masukkan jumlah uang"
                />
              </div>
              <div>
                <label className="form-label mb-2">Catatan (jika ada selisih)</label>
                <textarea
                  value={closeData.notes}
                  onChange={(e) => setCloseData({ ...closeData, notes: e.target.value })}
                  className="form-input"
                  rows="3"
                  placeholder="Alasan jika ada selisih kas"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseShift}
                  disabled={loading}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Tutup Shift'}
                </button>
                <button
                  onClick={() => setShowCloseForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shift History */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4 text-blue-950">Riwayat Shift</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="table-head">
                <th className="pb-3">Kasir</th>
                <th className="pb-3">Waktu Buka / Tutup (24 Jam)</th>
                <th className="pb-3">Float</th>
                <th className="pb-3">Penjualan</th>
                <th className="pb-3">Ekspektasi</th>
                <th className="pb-3">Selisih</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Catatan</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id} className="table-row">
                  <td className="py-3">
                    <span className="font-semibold text-blue-950">{shift.first_name || shift.username || 'Staf'}</span>
                  </td>
                  <td className="py-3 text-xs">
                    <div className="flex items-center"><span className="text-green-700 font-bold text-[10px] uppercase bg-green-50 px-1 py-0.5 rounded border border-green-200 mr-1.5 w-12 text-center">Buka</span> {format24h(shift.opened_at)}</div>
                    <div className="mt-1 flex items-center"><span className="text-red-700 font-bold text-[10px] uppercase bg-red-50 px-1 py-0.5 rounded border border-red-200 mr-1.5 w-12 text-center">Tutup</span> {shift.closed_at ? format24h(shift.closed_at) : <span className="text-emerald-600 font-semibold">Aktif (Belum Tutup)</span>}</div>
                  </td>
                  <td className="py-3">
                    Rp {parseInt(shift.float_amount).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3">
                    Rp {parseInt(shift.total_sales || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3">
                    Rp {parseInt(shift.expected_amount || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3">
                    <span className={shift.discrepancy === 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      Rp {parseInt(shift.discrepancy || 0).toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="py-3">
                    {shift.status === 'CLOSED_OK' ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <FiCheckCircle size={16} /> Sesuai
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <FiAlertCircle size={16} /> Selisih
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-xs text-gray-600 max-w-[150px] truncate" title={shift.discrepancy_notes || ''}>
                    {shift.discrepancy_notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
