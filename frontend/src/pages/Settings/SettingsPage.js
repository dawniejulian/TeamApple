// frontend/src/pages/Settings/SettingsPage.js
import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const SETTINGS_STORAGE_KEY = 'kasirin_settings_v1';

const DEFAULT_SETTINGS = {
  storeProfile: {
    storeName: 'Kasirin Store',
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

const TABS = [
  { key: 'storeProfile', label: 'Profil Toko' },
  { key: 'taxAndPricing', label: 'Pajak & Harga' },
  { key: 'payment', label: 'Pembayaran' },
  { key: 'stockAndAlerts', label: 'Stok & Alert' },
  { key: 'receiptAndPrinter', label: 'Struk & Printer' },
  { key: 'accessControl', label: 'Hak Akses' }
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
  const [activeTab, setActiveTab] = useState('storeProfile');
  const [settings, setSettings] = useState(getInitialSettings);

  const activeTabLabel = useMemo(
    () => TABS.find((tab) => tab.key === activeTab)?.label || 'Pengaturan',
    [activeTab]
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
              placeholder="Contoh: Kasirin Mart"
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

    if (activeTab === 'taxAndPricing') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsInput label="Pajak Default (%)">
            <input
              type="number"
              min="0"
              max="100"
              className="form-input"
              value={settings.taxAndPricing.taxPercent}
              onChange={(e) => updateSection('taxAndPricing', { taxPercent: Number(e.target.value || 0) })}
            />
          </SettingsInput>

          <SettingsInput label="Mode Pembulatan">
            <select
              className="form-input"
              value={settings.taxAndPricing.roundingMode}
              onChange={(e) => updateSection('taxAndPricing', { roundingMode: e.target.value })}
            >
              <option value="NONE">Tanpa Pembulatan</option>
              <option value="UP_100">Bulatkan Ke Atas 100</option>
              <option value="DOWN_100">Bulatkan Ke Bawah 100</option>
            </select>
          </SettingsInput>

          <label className="flex items-center gap-3 text-sm font-medium text-blue-900/85">
            <input
              type="checkbox"
              checked={settings.taxAndPricing.taxIncludedInPrice}
              onChange={(e) => updateSection('taxAndPricing', { taxIncludedInPrice: e.target.checked })}
            />
            Harga jual sudah termasuk pajak
          </label>
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
          PO harus disetujui Manager/Admin
        </label>
      </div>
    );
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
