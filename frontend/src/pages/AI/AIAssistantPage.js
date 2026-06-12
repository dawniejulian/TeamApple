import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const QUICK_PROMPTS = [
  'Berikan ringkasan performa toko hari ini.',
  'Apa rekomendasi untuk produk dengan stok rendah?',
  'Strategi sederhana untuk menaikkan penjualan minggu ini apa?',
  'Bantu analisis apakah perlu tambah purchase order sekarang.'
];

export default function AIAssistantPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitQuestion = async (inputQuestion) => {
    const payload = (inputQuestion || question).trim();
    if (!payload) {
      toast.warn('Masukkan pertanyaan untuk AI terlebih dahulu');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/ai/ask', { question: payload });
      setAnswer(response.data?.data?.answer || 'Tidak ada jawaban');
      setSnapshot(response.data?.data?.snapshot || null);
    } catch (error) {
      const message = error?.response?.data?.message || 'Gagal meminta jawaban AI';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold page-title section-enter">AI Assistant</h1>
        <p className="text-blue-800/80 mt-2">
          Asisten untuk analisis cepat performa toko dan rekomendasi operasional harian.
        </p>
      </div>

      <div className="card space-y-4">
        <label className="form-label">Tanyakan sesuatu ke AI</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          placeholder="Contoh: Dari data hari ini, langkah prioritas apa yang harus dilakukan?"
          className="form-input w-full"
        />

        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuestion(prompt);
                submitQuestion(prompt);
              }}
              disabled={loading}
              className="tab-pill"
            >
              {prompt}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => submitQuestion()}
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Kirim ke AI'}
        </button>
      </div>

      {snapshot && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-blue-800/75">Penjualan Hari Ini</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              Rp {Number(snapshot.today?.revenue || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-blue-700/70 mt-1">{snapshot.today?.transactions || 0} transaksi</p>
          </div>
          <div className="card">
            <p className="text-sm text-blue-800/75">Penjualan Bulan Ini</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              Rp {Number(snapshot.month?.revenue || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-blue-700/70 mt-1">{snapshot.month?.transactions || 0} transaksi</p>
          </div>
          <div className="card">
            <p className="text-sm text-blue-800/75">Stok Rendah</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">{snapshot.alerts?.lowStock || 0}</p>
            <p className="text-xs text-blue-700/70 mt-1">produk</p>
          </div>
          <div className="card">
            <p className="text-sm text-blue-800/75">PO Terbuka</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">{snapshot.alerts?.openPOs || 0}</p>
            <p className="text-xs text-blue-700/70 mt-1">purchase order</p>
          </div>
        </div>
      )}

      {answer && (
        <div className="card">
          <h2 className="text-xl font-bold text-blue-950 mb-3">Jawaban AI</h2>
          <div className="whitespace-pre-wrap text-blue-900/90 leading-relaxed">{answer}</div>
        </div>
      )}
    </div>
  );
}
