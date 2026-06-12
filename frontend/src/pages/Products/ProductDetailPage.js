// frontend/src/pages/Products/ProductDetailPage.js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiSave, FiExternalLink, FiShoppingBag } from 'react-icons/fi';
import {
  FaInstagram, FaTiktok, FaFacebookF, FaWhatsapp
} from 'react-icons/fa';
import { SiShopee } from 'react-icons/si';
import api from '../../services/api';
import { toast } from 'react-toastify';

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

const Field = ({ label, required, note, children }) => (
  <div>
    <label className="text-xs font-semibold text-blue-800 mb-1 block">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {note && <p className="muted-note mt-1">{note}</p>}
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [failedImages, setFailedImages] = useState({});
  const [removeImage, setRemoveImage] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    barcode: '',
    category_id: '',
    condition_id: '',
    buy_price: '',
    selling_price: '',
    initial_stock: '',
    color: '',
    description: '',
    ram: '',
    internal: '',
    chip: '',
    camera: '',
  });

  const SOCIAL_PLATFORMS = [
    { key: 'instagram', label: 'Instagram', icon: FaInstagram,    color: '#E1306C', placeholder: 'https://instagram.com/p/...' },
    { key: 'tiktok',    label: 'TikTok',    icon: FaTiktok,        color: '#010101', placeholder: 'https://tiktok.com/@toko/video/...' },
    { key: 'facebook',  label: 'Facebook',  icon: FaFacebookF,    color: '#1877F2', placeholder: 'https://facebook.com/...' },
    { key: 'whatsapp',  label: 'WhatsApp',  icon: FaWhatsapp,     color: '#25D366', placeholder: 'https://wa.me/62812xxx?text=...' },
    { key: 'shopee',    label: 'Shopee',    icon: SiShopee,       color: '#EE4D2D', placeholder: 'https://shopee.co.id/...' },
    { key: 'tokopedia', label: 'Tokopedia', icon: FiShoppingBag,  color: '#03AC0E', placeholder: 'https://tokopedia.com/...' },
    { key: 'lazada',    label: 'Lazada',    icon: FiShoppingBag,  color: '#0F146D', placeholder: 'https://lazada.co.id/...' },
  ];

  const [socialLinks, setSocialLinks] = useState({
    instagram: '', tiktok: '', facebook: '', whatsapp: '', shopee: '', tokopedia: '', lazada: '',
  });

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    const base = api.defaults.baseURL?.replace('/api', '') || '';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const fetchProduct = useCallback(async () => {
    try {
      const res = await api.get(`/products/${id}`);
      const p = res.data.data;
      setFormData({
        sku: p.sku || '',
        name: p.name || '',
        barcode: p.barcode || '',
        category_id: p.category_id || '',
        condition_id: p.condition_id || '',
        buy_price: p.buy_price || '',
        selling_price: p.selling_price || '',
        initial_stock: p.stock_total || '0',
        color: p.specifications?.color || '',
        description: p.description || '',
        ram: p.specifications?.ram || '',
        internal: p.specifications?.internal || '',
        chip: p.specifications?.chip || '',
        camera: p.specifications?.camera || '',
      });
      // Load social links dari API
      const sl = res.data.data.social_links || {};
      setSocialLinks({
        instagram: sl.instagram || '',
        tiktok:    sl.tiktok    || '',
        facebook:  sl.facebook  || '',
        whatsapp:  sl.whatsapp  || '',
        shopee:    sl.shopee    || '',
        tokopedia: sl.tokopedia || '',
        lazada:    sl.lazada    || '',
      });
      setExistingImages(Array.isArray(res.data.data.images) ? res.data.data.images : []);
      setRemoveImage(false);
      setImageFiles([]);
      setNewImagePreviews([]);
      setFailedImages({});
      setActiveImageIndex(0);
    } catch (error) {
      toast.error('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/products/categories/list');
      setCategories(res.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchConditions = useCallback(async () => {
    try {
      const res = await api.get('/products/conditions/list');
      setConditions(res.data.data);
    } catch (error) {
      console.error('Error fetching conditions:', error);
    }
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchCategories();
    fetchConditions();
  }, [fetchProduct, fetchCategories, fetchConditions]);

  useEffect(() => {
    return () => {
      newImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [newImagePreviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) {
      return;
    }

    if (selectedFiles.some((file) => !file.type.startsWith('image/'))) {
      toast.error('Semua file harus berupa gambar');
      e.target.value = '';
      return;
    }

    const remainingSlots = Math.max(0, 10 - newImagePreviews.length);
    if (selectedFiles.length > remainingSlots) {
      toast.error(`Sisa slot upload foto baru: ${remainingSlots}`);
      return;
    }

    const previews = selectedFiles.map((file, index) => ({
      id: `${file.name}-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
    }));

    setImageFiles((prev) => [...prev, ...selectedFiles]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
    setRemoveImage(false);
  };

  const clearNewImages = () => {
    newImagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setImageFiles([]);
    setNewImagePreviews([]);
  };

  const galleryImages = useMemo(() => {
    if (removeImage) {
      return newImagePreviews.map((preview) => preview.url);
    }

    return [
      ...existingImages,
      ...newImagePreviews.map((preview) => preview.url),
    ];
  }, [removeImage, existingImages, newImagePreviews]);

  const validGalleryImages = useMemo(
    () => galleryImages.filter((img) => !failedImages[img]),
    [galleryImages, failedImages]
  );

  const markImageFailed = (imageUrl) => {
    if (!imageUrl) return;
    setFailedImages((prev) => ({
      ...prev,
      [imageUrl]: true,
    }));
  };

  useEffect(() => {
    if (validGalleryImages.length === 0) {
      setActiveImageIndex(0);
      return;
    }

    if (activeImageIndex > validGalleryImages.length - 1) {
      setActiveImageIndex(validGalleryImages.length - 1);
    }
  }, [validGalleryImages, activeImageIndex]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const specs = {};
      if (formData.ram) specs.ram = formData.ram;
      if (formData.internal) specs.internal = formData.internal;
      if (formData.chip) specs.chip = formData.chip;
      if (formData.camera) specs.camera = formData.camera;
      if (formData.color) specs.color = formData.color;

      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('barcode', formData.barcode || formData.sku);
      payload.append('buy_price', String(parseFloat(formData.buy_price) || 0));
      payload.append('selling_price', String(parseFloat(formData.selling_price)));
      payload.append('description', formData.description || '');
      payload.append('remove_image', String(removeImage));
      payload.append('social_links', JSON.stringify(socialLinks));
      payload.append('specifications', JSON.stringify(specs));

      imageFiles.forEach((file) => {
        payload.append('images', file);
      });

      await api.put(`/products/${id}`, payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Produk berhasil diperbarui');
      navigate('/products');
    } catch (error) {
      toast.error('Gagal menyimpan produk');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-blue-100 rounded-lg transition"
        >
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold page-title section-enter">Edit Produk</h1>
      </div>

      <div className="card max-w-2xl section-enter">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* IDENTITAS PRODUK */}
          <SECTION title="Identitas Produk">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Nama Produk" required>
                <input
                  type="text"
                  name="name"
                  className="form-input text-sm"
                  placeholder="Contoh: MacBook Pro 14 M3 Pro"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Field>

              <Field label="Kode Toko / SKU" note="SKU tidak dapat diubah">
                <input
                  type="text"
                  name="sku"
                  className="form-input text-sm bg-blue-50"
                  value={formData.sku}
                  disabled
                />
              </Field>

              <Field label="Barcode Fisik / UPC">
                <input
                  type="text"
                  name="barcode"
                  className="form-input text-sm"
                  placeholder="Scan atau ketik barcode produk"
                  value={formData.barcode}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Warna">
                <input
                  type="text"
                  name="color"
                  className="form-input text-sm"
                  placeholder="Contoh: Space Black, Silver, Starlight"
                  value={formData.color}
                  onChange={handleChange}
                />
              </Field>
            </div>
          </SECTION>

          {/* HARGA & STOK */}
          <SECTION title="Harga & Stok">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Stok" note="Stok dapat diubah melalui menu Stok/Inventory">
                <input
                  type="number"
                  name="initial_stock"
                  className="form-input text-sm bg-blue-50"
                  value={formData.initial_stock}
                  disabled
                />
              </Field>

              <Field label="Harga Beli (Rp)">
                <input
                  type="number"
                  name="buy_price"
                  className="form-input text-sm"
                  min="0"
                  placeholder="0"
                  value={formData.buy_price}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Harga Jual (Rp)" required>
                <input
                  type="number"
                  name="selling_price"
                  className="form-input text-sm"
                  min="0"
                  placeholder="0"
                  value={formData.selling_price}
                  onChange={handleChange}
                  required
                />
              </Field>
            </div>
          </SECTION>

          {/* SPESIFIKASI */}
          <SECTION title="Spesifikasi">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="RAM">
                <select name="ram" className="form-input text-sm" value={formData.ram} onChange={handleChange}>
                  {RAM_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o || '— Pilih RAM —'}</option>
                  ))}
                </select>
              </Field>

              <Field label="Internal">
                <select name="internal" className="form-input text-sm" value={formData.internal} onChange={handleChange}>
                  {INTERNAL_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o || '— Pilih Internal —'}</option>
                  ))}
                </select>
              </Field>

              <Field label="Chip / Processor">
                <select name="chip" className="form-input text-sm" value={formData.chip} onChange={handleChange}>
                  {CHIP_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o || '— Pilih Chip —'}</option>
                  ))}
                </select>
              </Field>

              <Field label="Kamera">
                <select name="camera" className="form-input text-sm" value={formData.camera} onChange={handleChange}>
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
              <Field label="Kategori" note="Kategori tidak dapat diubah">
                <select
                  name="category_id"
                  className="form-input text-sm bg-blue-50"
                  value={formData.category_id}
                  disabled
                >
                  <option value="">— Pilih Kategori —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="Kondisi" note="Kondisi tidak dapat diubah">
                <select
                  name="condition_id"
                  className="form-input text-sm bg-blue-50"
                  value={formData.condition_id}
                  disabled
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
              name="description"
              className="form-input text-sm resize-none"
              rows={3}
              placeholder="Tulis deskripsi singkat produk, kondisi layar, baterai, kelengkapan, dll..."
              value={formData.description}
              onChange={handleChange}
            />
          </SECTION>

          {/* ─── Social Media Links (HANYA PADA EDIT PRODUK) ─── */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
            <p className="text-sm font-semibold text-blue-900">🔗 Link Media Sosial Produk</p>
            <p className="text-xs text-blue-700/70">Simpan link postingan per platform agar mudah diupdate</p>
            <div className="space-y-2">
              {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, color, placeholder }) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: color }}
                  >
                    <Icon size={15} />
                  </div>
                  <input
                    type="url"
                    placeholder={placeholder}
                    className="form-input text-sm flex-1"
                    value={socialLinks[key]}
                    onChange={(e) => setSocialLinks((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                  {socialLinks[key] && (
                    <a
                      href={socialLinks[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition"
                      title={`Buka link ${label}`}
                    >
                      <FiExternalLink size={15} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FOTO PRODUK */}
          <SECTION title="Foto Produk">
            <label className="flex flex-col items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer bg-blue-50/40 hover:bg-blue-50 transition">
              <span className="text-2xl">📷</span>
              <span className="text-xs text-blue-700/70 font-medium">Klik untuk upload foto baru (maks 10)</span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>

            {galleryImages.length === 0 ? (
              <p className="muted-note mt-3">Belum ada foto produk.</p>
            ) : validGalleryImages.length === 0 ? (
              <p className="muted-note mt-3">Foto produk ada, tapi URL gambar tidak valid atau gagal dimuat.</p>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-blue-100 bg-white">
                  <img
                    src={getImageUrl(validGalleryImages[activeImageIndex])}
                    alt=""
                    className="w-full h-60 object-cover"
                    onError={() => {
                      markImageFailed(validGalleryImages[activeImageIndex]);
                    }}
                  />

                  {validGalleryImages.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex((prev) => (prev === 0 ? validGalleryImages.length - 1 : prev - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 text-white"
                      >
                        <FiChevronLeft />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex((prev) => (prev === validGalleryImages.length - 1 ? 0 : prev + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 text-white"
                      >
                        <FiChevronRight />
                      </button>
                    </>
                  ) : null}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {validGalleryImages.map((img, index) => (
                    <button
                      key={`${img}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`rounded-lg overflow-hidden border ${activeImageIndex === index ? 'border-blue-500' : 'border-blue-100'}`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt=""
                        className="h-14 w-20 object-cover"
                        onError={() => markImageFailed(img)}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mt-2">
              {existingImages.length > 0 ? (
                <label className="inline-flex items-center gap-2 text-sm text-blue-900/80">
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(e) => setRemoveImage(e.target.checked)}
                  />
                  Hapus semua foto lama saat simpan
                </label>
              ) : null}

              {newImagePreviews.length > 0 ? (
                <button
                  type="button"
                  onClick={clearNewImages}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold"
                >
                  Reset foto baru
                </button>
              ) : null}
            </div>
          </SECTION>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <FiSave /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="btn-secondary"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
