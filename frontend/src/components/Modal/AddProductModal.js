// frontend/src/components/Modal/AddProductModal.js
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiPackage } from 'react-icons/fi';
import api from '../../services/api';

const RAM_OPTIONS = ['', '2 GB', '3 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB', '18 GB', '24 GB', '32 GB', '36 GB', '48 GB', '64 GB', '96 GB', '128 GB', 'Lainnya'];
const INTERNAL_OPTIONS = ['', '32 GB', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB', '4 TB', 'Lainnya'];
const CHIP_OPTIONS = ['', 'Apple M1', 'Apple M1 Pro', 'Apple M1 Max', 'Apple M1 Ultra', 'Apple M2', 'Apple M2 Pro', 'Apple M2 Max', 'Apple M2 Ultra', 'Apple M3', 'Apple M3 Pro', 'Apple M3 Max', 'Apple M4', 'Apple M4 Pro', 'Apple M4 Max', 'Apple A13 Bionic', 'Apple A14 Bionic', 'Apple A15 Bionic', 'Apple A16 Bionic', 'Apple A17 Pro', 'Apple A18', 'Apple A18 Pro', 'Lainnya'];
const CAMERA_OPTIONS = ['', '12 MP', '48 MP', '108 MP', '200 MP', '12 MP + 12 MP', '12 MP + 48 MP', '48 MP + 12 MP + 12 MP', '12 MP + 12 MP + 12 MP', '48 MP + 12 MP + 12 MP', '50 MP', 'Lainnya'];

const SECTION = ({ title, children }) => (
  <div className="space-y-3">
    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-blue-100/60 pb-1">{title}</p>
    {children}
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label className="text-xs font-semibold text-blue-800 mb-1 block">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

export default function AddProductModal({ onClose, onSuccess, initialBarcode, duplicateProduct }) {
  const [formData, setFormData] = useState({
    name: duplicateProduct?.name || '',
    sku: '',
    barcode: duplicateProduct?.barcode || initialBarcode || '',
    category_id: duplicateProduct?.category_id || '',
    condition_id: '',
    buy_price: duplicateProduct?.buy_price || '',
    selling_price: duplicateProduct?.selling_price || '',
    initial_stock: '1',
    color: duplicateProduct?.specifications?.color || '',
    description: '',
    // specs
    ram: duplicateProduct?.specifications?.ram || '',
    internal: duplicateProduct?.specifications?.internal || '',
    chip: duplicateProduct?.specifications?.chip || '',
    camera: duplicateProduct?.specifications?.camera || '',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, condRes] = await Promise.all([
          api.get('/products/categories/list'),
          api.get('/products/conditions/list'),
        ]);
        setCategories(catRes.data.data || []);
        setConditions(condRes.data.data || []);
      } catch {
        toast.error('Gagal memuat data kategori/kondisi');
      }
    };
    load();
  }, []);

  useEffect(() => {
    return () => imagePreviews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [imagePreviews]);

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (files.length > 10) { toast.error('Maksimal 10 foto'); return; }
    if (files.some((f) => !f.type.startsWith('image/'))) {
      toast.error('Semua file harus berupa gambar'); e.target.value = ''; return;
    }
    imagePreviews.forEach((p) => URL.revokeObjectURL(p.url));
    const previews = files.map((f, i) => ({ id: `${f.name}-${i}-${Date.now()}`, url: URL.createObjectURL(f) }));
    setImageFiles(files);
    setImagePreviews(previews);
  };

  const removePreview = (id) => {
    const p = imagePreviews.find((x) => x.id === id);
    if (p) URL.revokeObjectURL(p.url);
    const idx = imagePreviews.findIndex((x) => x.id === id);
    setImagePreviews((prev) => prev.filter((x) => x.id !== id));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Nama produk wajib diisi'); return; }
    if (!formData.sku.trim()) { toast.error('Kode Toko (SKU) wajib diisi'); return; }
    if (!formData.category_id) { toast.error('Kategori wajib dipilih'); return; }
    if (!formData.condition_id) { toast.error('Kondisi produk wajib dipilih'); return; }
    if (!formData.selling_price) { toast.error('Harga jual wajib diisi'); return; }

    setLoading(true);
    try {
      const specs = {};
      if (formData.ram) specs.ram = formData.ram;
      if (formData.internal) specs.internal = formData.internal;
      if (formData.chip) specs.chip = formData.chip;
      if (formData.camera) specs.camera = formData.camera;
      if (formData.color) specs.color = formData.color;

      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('sku', formData.sku.trim());
      payload.append('barcode', formData.barcode.trim() || formData.sku.trim());
      payload.append('category_id', String(parseInt(formData.category_id, 10)));
      payload.append('condition_id', String(parseInt(formData.condition_id, 10)));
      payload.append('buy_price', String(parseFloat(formData.buy_price) || 0));
      payload.append('selling_price', String(parseFloat(formData.selling_price) || 0));
      payload.append('initial_stock', String(parseInt(formData.initial_stock || '1', 10)));
      payload.append('description', formData.description.trim() || '');
      payload.append('specifications', JSON.stringify(specs));
      imageFiles.forEach((f) => payload.append('images', f));

      await api.post('/products', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Produk berhasil ditambahkan!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop flex items-center justify-center z-50 p-4">
      <div
        className="modal-card rounded-2xl shadow-2xl w-full flex flex-col"
        style={{ maxWidth: '720px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <FiPackage className="text-white" size={16} />
            </div>
            <h2 className="text-lg font-bold text-blue-950">Tambah Produk</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-50 text-blue-700 transition"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">

            {/* IDENTITAS PRODUK */}
            <SECTION title="Identitas Produk">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Nama Produk" required>
                  <input
                    type="text"
                    className="form-input text-sm"
                    placeholder="Contoh: MacBook Pro 14 M3 Pro"
                    value={formData.name}
                    onChange={set('name')}
                    required
                  />
                </Field>

                <Field label="Kode Toko / SKU" required>
                  <input
                    type="text"
                    className="form-input text-sm"
                    placeholder="Contoh: MBP-14-M3-001"
                    value={formData.sku}
                    onChange={set('sku')}
                    required
                  />
                </Field>

                <Field label="Barcode Fisik / UPC">
                  <input
                    type="text"
                    className="form-input text-sm"
                    placeholder="Scan atau ketik barcode produk"
                    value={formData.barcode}
                    onChange={set('barcode')}
                  />
                </Field>

                <Field label="Warna">
                  <input
                    type="text"
                    className="form-input text-sm"
                    placeholder="Contoh: Space Black, Silver, Starlight"
                    value={formData.color}
                    onChange={set('color')}
                  />
                </Field>
              </div>
            </SECTION>

            {/* HARGA & STOK */}
            <SECTION title="Harga & Stok">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Stok" required>
                  <input
                    type="number"
                    className="form-input text-sm"
                    min="0"
                    value={formData.initial_stock}
                    onChange={set('initial_stock')}
                    required
                  />
                </Field>

                <Field label="Harga Beli (Rp)">
                  <input
                    type="number"
                    className="form-input text-sm"
                    min="0"
                    placeholder="0"
                    value={formData.buy_price}
                    onChange={set('buy_price')}
                  />
                </Field>

                <Field label="Harga Jual (Rp)" required>
                  <input
                    type="number"
                    className="form-input text-sm"
                    min="0"
                    placeholder="0"
                    value={formData.selling_price}
                    onChange={set('selling_price')}
                    required
                  />
                </Field>
              </div>
            </SECTION>

            {/* SPESIFIKASI */}
            <SECTION title="Spesifikasi">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Field label="RAM">
                  <select className="form-input text-sm" value={formData.ram} onChange={set('ram')}>
                    {RAM_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o || '— Pilih RAM —'}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Internal">
                  <select className="form-input text-sm" value={formData.internal} onChange={set('internal')}>
                    {INTERNAL_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o || '— Pilih Internal —'}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Chip / Processor">
                  <select className="form-input text-sm" value={formData.chip} onChange={set('chip')}>
                    {CHIP_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o || '— Pilih Chip —'}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Kamera">
                  <select className="form-input text-sm" value={formData.camera} onChange={set('camera')}>
                    {CAMERA_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o || '— Pilih Kamera —'}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </SECTION>

            {/* KATEGORI & KONDISI */}
            <SECTION title="Kategori & Kondisi">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Kategori" required>
                  <select
                    className="form-input text-sm"
                    value={formData.category_id}
                    onChange={set('category_id')}
                    required
                  >
                    <option value="">— Pilih Kategori —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Kondisi" required>
                  <select
                    className="form-input text-sm"
                    value={formData.condition_id}
                    onChange={set('condition_id')}
                    required
                  >
                    <option value="">— Pilih Kondisi —</option>
                    {conditions.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </SECTION>

            {/* DESKRIPSI */}
            <SECTION title="Deskripsi">
              <textarea
                className="form-input text-sm resize-none"
                rows={3}
                placeholder="Tulis deskripsi singkat produk, kondisi layar, baterai, kelengkapan, dll..."
                value={formData.description}
                onChange={set('description')}
              />
            </SECTION>

            {/* FOTO */}
            <SECTION title="Foto Produk">
              <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer bg-blue-50/40 hover:bg-blue-50 transition">
                <span className="text-2xl">📷</span>
                <span className="text-xs text-blue-700/70 font-medium">Klik untuk upload foto (maks 10)</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {imagePreviews.map((p) => (
                    <div key={p.id} className="relative group">
                      <img
                        src={p.url}
                        alt="Preview"
                        className="h-16 w-full object-cover rounded-lg border border-blue-100"
                      />
                      <button
                        type="button"
                        onClick={() => removePreview(p.id)}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SECTION>

          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-blue-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 btn-secondary"
          >
            Batal
          </button>
          <button
            type="submit"
            form="add-product-form"
            disabled={loading}
            className="flex-1 btn-primary"
          >
            {loading ? '⏳ Menyimpan...' : '💾 Simpan Produk'}
          </button>
        </div>
      </div>
    </div>
  );
}
