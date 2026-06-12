// frontend/src/pages/Settings/SettingsPage.js
import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { getDeviceId } from '../../utils/deviceFingerprint';
import {
  FiSmartphone,
  FiCopy,
  FiCheck,
  FiPlus,
  FiRefreshCw,
  FiTrash2
} from 'react-icons/fi';

const SETTINGS_STORAGE_KEY = 'kasirin_settings_v1';

const DEFAULT_SETTINGS = {
  storeProfile: {
    storeName: 'TeamApple.Hub',
    phone: '',
    address: '',
    receiptFooter: 'Terima kasih sudah berbelanja'
  },
  taxAndPricing: {
    taxPercent: 11,
    taxIncludedInPrice: false,
    roundingMode: 'NONE'
  },
  payment: {
    enabledMethods: {
      cash: true,
      transfer: true,
      qris: false,
      ewallet: false
    },
    defaultMethod: 'CASH',
    allowChange: true
  },
  stockAndAlerts: {
    globalMinStock: 5,
    enableLowStockAlert: true,
    blockSaleWhenOutOfStock: true
  },
  receiptAndPrinter: {
    paperSize: '58MM',
    autoPrint: false,
    showCashierName: true
  },
  accessControl: {
    staffCanEditPrice: false,
    staffCanGiveDiscount: true,
    managerMustApprovePO: true
  }
};

const DEFAULT_TABS = [
  { key: 'stockAndAlerts', label: 'Stok & Alert' }
];

function getInitialSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      storeProfile: { ...DEFAULT_SETTINGS.storeProfile, ...(parsed.storeProfile || {}) },
      taxAndPricing: { ...DEFAULT_SETTINGS.taxAndPricing, ...(parsed.taxAndPricing || {}) },
      payment: {
        ...DEFAULT_SETTINGS.payment,
        ...(parsed.payment || {}),
        enabledMethods: {
          ...DEFAULT_SETTINGS.payment.enabledMethods,
          ...(parsed.payment?.enabledMethods || {})
        }
      },
      stockAndAlerts: { ...DEFAULT_SETTINGS.stockAndAlerts, ...(parsed.stockAndAlerts || {}) },
      receiptAndPrinter: { ...DEFAULT_SETTINGS.receiptAndPrinter, ...(parsed.receiptAndPrinter || {}) },
      accessControl: { ...DEFAULT_SETTINGS.accessControl, ...(parsed.accessControl || {}) }
    };
  } catch (_) {
    return DEFAULT_SETTINGS;
  }
}

function SettingsInput({ label, children }) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

export default function SettingsPage() {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';

  const TABS = useMemo(() => {
    if (isAdmin) {
      return [...DEFAULT_TABS, { key: 'storeDevices', label: 'Perangkat Toko' }];
    }
    return DEFAULT_TABS;
  }, [isAdmin]);

  const [activeTab, setActiveTab] = useState('stockAndAlerts');
  const [settings, setSettings] = useState(getInitialSettings);

  // Device management state
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');
  const [useCurrentDevice, setUseCurrentDevice] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  const fetchDevices = async () => {
    setDevicesLoading(true);
    try {
      const res = await api.get('/devices');
      if (res.data.status === 'SUCCESS') {
        setDevices(res.data.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil daftar perangkat');
    } finally {
      setDevicesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'storeDevices' && isAdmin) {
      fetchDevices();
      setNewDeviceId(getDeviceId());
    }
  }, [activeTab, isAdmin]);

  const handleRegisterDevice = async (e) => {
    e.preventDefault();
    if (!newDeviceName.trim()) {
      toast.warning('Nama perangkat harus diisi');
      return;
    }
    const targetId = useCurrentDevice ? getDeviceId() : newDeviceId;
    if (!targetId.trim()) {
      toast.warning('Device ID harus diisi');
      return;
    }

    try {
      const res = await api.post('/devices/register', {
        device_id: targetId.trim(),
        device_name: newDeviceName.trim()
      });
      if (res.data.status === 'SUCCESS') {
        toast.success(res.data.message || 'Perangkat berhasil didaftarkan');
        setNewDeviceName('');
        if (!useCurrentDevice) setNewDeviceId('');
        fetchDevices();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mendaftarkan perangkat');
    }
  };

  const handleDeleteDevice = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menonaktifkan perangkat ini?')) return;
    try {
      const res = await api.delete(`/devices/${id}`);
      if (res.data.status === 'SUCCESS') {
        toast.success(res.data.message || 'Perangkat berhasil dinonaktifkan');
        fetchDevices();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menonaktifkan perangkat');
    }
  };

  const activeTabLabel = useMemo(
    () => TABS.find((tab) => tab.key === activeTab)?.label || 'Pengaturan',
    [activeTab, TABS]
  );

  const updateSection = (section, patch) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...patch
      }
    }));
  };

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    toast.success('Pengaturan berhasil disimpan');
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    toast.info('Pengaturan dikembalikan ke default');
  };

  const renderTabContent = () => {
    if (activeTab === 'storeProfile') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsInput label="Nama Toko">
            <input
              className="form-input"
              value={settings.storeProfile.storeName}
              onChange={(e) => updateSection('storeProfile', { storeName: e.target.value })}
              placeholder="Contoh: TeamApple.Hub"
            />
          </SettingsInput>

          <SettingsInput label="Telepon">
            <input
              className="form-input"
              value={settings.storeProfile.phone}
              onChange={(e) => updateSection('storeProfile', { phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
            />
          </SettingsInput>

          <SettingsInput label="Alamat">
            <textarea
              className="form-input min-h-[88px]"
              value={settings.storeProfile.address}
              onChange={(e) => updateSection('storeProfile', { address: e.target.value })}
              placeholder="Alamat toko"
            />
          </SettingsInput>

          <SettingsInput label="Footer Struk">
            <textarea
              className="form-input min-h-[88px]"
              value={settings.storeProfile.receiptFooter}
              onChange={(e) => updateSection('storeProfile', { receiptFooter: e.target.value })}
              placeholder="Pesan di bagian bawah struk"
            />
          </SettingsInput>
        </div>
      );
    }



    if (activeTab === 'payment') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85">
              <input
                type="checkbox"
                checked={settings.payment.enabledMethods.cash}
                onChange={(e) => updateSection('payment', {
                  enabledMethods: { ...settings.payment.enabledMethods, cash: e.target.checked }
                })}
              />
              Cash
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85">
              <input
                type="checkbox"
                checked={settings.payment.enabledMethods.transfer}
                onChange={(e) => updateSection('payment', {
                  enabledMethods: { ...settings.payment.enabledMethods, transfer: e.target.checked }
                })}
              />
              Transfer
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85">
              <input
                type="checkbox"
                checked={settings.payment.enabledMethods.qris}
                onChange={(e) => updateSection('payment', {
                  enabledMethods: { ...settings.payment.enabledMethods, qris: e.target.checked }
                })}
              />
              QRIS
            </label>

            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={settings.payment.enabledMethods.ewallet}
                onChange={(e) => updateSection('payment', {
                  enabledMethods: { ...settings.payment.enabledMethods, ewallet: e.target.checked }
                })}
              />
              E-Wallet
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsInput label="Metode Pembayaran Default">
              <select
                className="form-input"
                value={settings.payment.defaultMethod}
                onChange={(e) => updateSection('payment', { defaultMethod: e.target.value })}
              >
                <option value="CASH">Cash</option>
                <option value="TRANSFER">Transfer</option>
                <option value="QRIS">QRIS</option>
                <option value="EWALLET">E-Wallet</option>
              </select>
            </SettingsInput>

            <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85 mt-7">
              <input
                type="checkbox"
                checked={settings.payment.allowChange}
                onChange={(e) => updateSection('payment', { allowChange: e.target.checked })}
              />
              Izinkan perubahan metode pembayaran saat transaksi
            </label>
          </div>
        </div>
      );
    }

    if (activeTab === 'stockAndAlerts') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsInput label="Batas Minimal Stok Global">
            <input
              type="number"
              min="0"
              className="form-input"
              value={settings.stockAndAlerts.globalMinStock}
              onChange={(e) => updateSection('stockAndAlerts', { globalMinStock: Number(e.target.value || 0) })}
            />
          </SettingsInput>

          <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85 mt-7">
            <input
              type="checkbox"
              checked={settings.stockAndAlerts.enableLowStockAlert}
              onChange={(e) => updateSection('stockAndAlerts', { enableLowStockAlert: e.target.checked })}
            />
            Aktifkan notifikasi stok menipis
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85">
            <input
              type="checkbox"
              checked={settings.stockAndAlerts.blockSaleWhenOutOfStock}
              onChange={(e) => updateSection('stockAndAlerts', { blockSaleWhenOutOfStock: e.target.checked })}
            />
            Blokir penjualan saat stok habis
          </label>
        </div>
      );
    }

    if (activeTab === 'receiptAndPrinter') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsInput label="Ukuran Kertas">
            <select
              className="form-input"
              value={settings.receiptAndPrinter.paperSize}
              onChange={(e) => updateSection('receiptAndPrinter', { paperSize: e.target.value })}
            >
              <option value="58MM">58 mm</option>
              <option value="80MM">80 mm</option>
              <option value="A4">A4</option>
            </select>
          </SettingsInput>

          <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85 mt-7">
            <input
              type="checkbox"
              checked={settings.receiptAndPrinter.autoPrint}
              onChange={(e) => updateSection('receiptAndPrinter', { autoPrint: e.target.checked })}
            />
            Cetak otomatis setelah pembayaran berhasil
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85">
            <input
              type="checkbox"
              checked={settings.receiptAndPrinter.showCashierName}
              onChange={(e) => updateSection('receiptAndPrinter', { showCashierName: e.target.checked })}
            />
            Tampilkan nama kasir di struk
          </label>
        </div>
      );
    }

    if (activeTab === 'accessControl') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85">
            <input
              type="checkbox"
              checked={settings.accessControl.staffCanEditPrice}
              onChange={(e) => updateSection('accessControl', { staffCanEditPrice: e.target.checked })}
            />
            Staff boleh ubah harga jual
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85">
            <input
              type="checkbox"
              checked={settings.accessControl.staffCanGiveDiscount}
              onChange={(e) => updateSection('accessControl', { staffCanGiveDiscount: e.target.checked })}
            />
            Staff boleh memberi diskon
          </label>

          <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85">
            <input
              type="checkbox"
              checked={settings.accessControl.managerMustApprovePO}
              onChange={(e) => updateSection('accessControl', { managerMustApprovePO: e.target.checked })}
            />
            PO harus disetujui Admin / Pemilik
          </label>
        </div>
      );
    }

    if (activeTab === 'storeDevices') {
      const currentDeviceId = getDeviceId();
      return (
        <div className="space-y-6">
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 sm:p-5">
            <h3 className="text-base font-bold text-[#1e355f] mb-2 flex items-center gap-2">
              <FiSmartphone className="text-blue-600" /> Perangkat Anda Saat Ini
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#5675ad] font-semibold uppercase tracking-wider mb-1">Device ID Browser ini</p>
                <code className="bg-white px-3 py-1.5 rounded-lg border border-blue-100 font-mono text-xs text-gray-700 block sm:inline-block break-all">
                  {currentDeviceId}
                </code>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(currentDeviceId);
                  setCopiedId(true);
                  toast.success('Device ID disalin!');
                  setTimeout(() => setCopiedId(false), 2000);
                }}
                className="flex items-center justify-center gap-2 self-start sm:self-center border border-blue-200 bg-white hover:bg-blue-50 text-[#2d4f89] text-xs font-bold px-3 py-2 rounded-xl transition whitespace-nowrap"
              >
                {copiedId ? <><FiCheck size={14} /> Tersalin</> : <><FiCopy size={14} /> Salin Device ID</>}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800">Daftarkan Perangkat Baru</h3>
              <form onSubmit={handleRegisterDevice} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Nama Perangkat
                  </label>
                  <input
                    type="text"
                    required
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    placeholder="Contoh: iPad Kasir Utama"
                    className="form-input text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <input
                      type="checkbox"
                      checked={useCurrentDevice}
                      onChange={(e) => {
                        setUseCurrentDevice(e.target.checked);
                        if (e.target.checked) {
                          setNewDeviceId(currentDeviceId);
                        } else {
                          setNewDeviceId('');
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    Gunakan Perangkat Ini
                  </label>

                  {!useCurrentDevice && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Device ID Perangkat Lain
                      </label>
                      <input
                        type="text"
                        required
                        value={newDeviceId}
                        onChange={(e) => setNewDeviceId(e.target.value)}
                        placeholder="Tempel Device ID perangkat kasir"
                        className="form-input text-xs font-mono"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 btn-primary text-xs py-2 rounded-xl"
                >
                  <FiPlus size={14} /> Daftarkan Perangkat
                </button>
              </form>
            </div>

            {/* List */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800">Daftar Perangkat Terdaftar</h3>
                <button
                  type="button"
                  onClick={fetchDevices}
                  disabled={devicesLoading}
                  className="p-1 text-blue-600 hover:text-blue-700 transition"
                  title="Segarkan daftar"
                >
                  <FiRefreshCw size={14} className={devicesLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              {devicesLoading && devices.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="text-xs">Memuat perangkat...</p>
                </div>
              ) : devices.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center">
                  <FiSmartphone size={32} className="mb-2 opacity-40" />
                  <p className="text-xs">Belum ada perangkat kasir terdaftar</p>
                  <p className="text-[10px] max-w-xs mt-1">
                    Staff kasir tidak akan bisa mengakses halaman Kasir POS jika tidak ada perangkat yang didaftarkan.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 pb-2 text-gray-400 uppercase tracking-wider font-semibold">
                        <th className="pb-2">Nama Perangkat</th>
                        <th className="pb-2">Device ID</th>
                        <th className="pb-2">IP Address</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {devices.map((device) => (
                        <tr key={device.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 font-semibold text-gray-800">{device.device_name}</td>
                          <td className="py-2.5 font-mono text-[10px] text-gray-500 max-w-[120px] truncate" title={device.device_id}>
                            {device.device_id}
                          </td>
                          <td className="py-2.5 text-gray-500 font-mono text-[10px]">{device.ip_address || '-'}</td>
                          <td className="py-2.5">
                            <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                              device.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {device.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            {device.is_active && (
                              <button
                                onClick={() => handleDeleteDevice(device.id)}
                                className="text-red-500 hover:text-red-700 p-1 transition"
                                title="Nonaktifkan perangkat"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold page-title section-enter">Pengaturan</h1>
          <p className="text-sm text-blue-700/75 mt-1">Kelola konfigurasi operasional toko dan kasir</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={resetSettings}>Reset Default</button>
          <button className="btn-primary" onClick={saveSettings}>Simpan Pengaturan</button>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-2 border-b border-blue-100 pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-pill ${
                activeTab === tab.key
                  ? 'tab-pill-active'
                  : ''
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pt-6 space-y-4">
          <h2 className="text-xl font-semibold text-blue-950">{activeTabLabel}</h2>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
