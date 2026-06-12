import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const INTEGRATIONS_STORAGE_KEY = 'kasirin_integrations_v1';

const DEFAULT_INTEGRATIONS = {
  whatsapp: {
    enabled: false,
    businessPhoneNumber: '',
    apiKey: '',
    senderName: ''
  },
  instagram: {
    enabled: false,
    username: '',
    accessToken: '',
    webhookSecret: ''
  },
  marketplace: {
    enabled: false,
    marketplaceName: '',
    storeId: '',
    apiBaseUrl: '',
    apiKey: '',
    apiSecret: '',
    webhookUrl: ''
  }
};

function getInitialIntegrationSettings() {
  try {
    const raw = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
    if (!raw) return DEFAULT_INTEGRATIONS;
    const parsed = JSON.parse(raw);

    return {
      whatsapp: { ...DEFAULT_INTEGRATIONS.whatsapp, ...(parsed.whatsapp || {}) },
      instagram: { ...DEFAULT_INTEGRATIONS.instagram, ...(parsed.instagram || {}) },
      marketplace: { ...DEFAULT_INTEGRATIONS.marketplace, ...(parsed.marketplace || {}) }
    };
  } catch (_) {
    return DEFAULT_INTEGRATIONS;
  }
}

function InputField({ label, children }) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(getInitialIntegrationSettings);
  const [testingMarketplace, setTestingMarketplace] = useState(false);

  const connectedCount = useMemo(() => {
    const values = Object.values(integrations);
    return values.filter((item) => item.enabled).length;
  }, [integrations]);

  const updateSection = (section, patch) => {
    setIntegrations((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...patch
      }
    }));
  };

  const saveAll = () => {
    localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(integrations));
    toast.success('Konfigurasi integrasi berhasil disimpan');
  };

  const resetAll = () => {
    setIntegrations(DEFAULT_INTEGRATIONS);
    localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_INTEGRATIONS));
    toast.info('Konfigurasi integrasi dikembalikan ke default');
  };

  const testMarketplaceConnection = async () => {
    const payload = integrations.marketplace;

    if (!payload.apiBaseUrl || !payload.storeId) {
      toast.warn('Base URL API Marketplace dan Store ID wajib diisi sebelum test koneksi');
      return;
    }

    setTestingMarketplace(true);
    try {
      const response = await api.post('/integrations/marketplace/test', {
        apiBaseUrl: payload.apiBaseUrl,
        storeId: payload.storeId,
        apiKey: payload.apiKey,
        apiSecret: payload.apiSecret
      });

      const endpoint = response?.data?.data?.endpoint;
      toast.success(`Koneksi marketplace berhasil${endpoint ? ` (${endpoint})` : ''}`);
    } catch (error) {
      const message = error?.response?.data?.message || 'Koneksi marketplace gagal';
      toast.error(message);
    } finally {
      setTestingMarketplace(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold page-title section-enter">Integrasi Kanal</h1>
          <p className="text-sm text-blue-700/75 mt-1">
            Hubungkan sistem kasir dengan WhatsApp, Instagram, dan marketplace toko Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hourglass-chip">{connectedCount}/3 Aktif</span>
          <button type="button" className="btn-secondary" onClick={resetAll}>Reset</button>
          <button type="button" className="btn-primary" onClick={saveAll}>Simpan</button>
        </div>
      </div>

      <div className="card space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-950">WhatsApp Business</h2>
            <p className="text-sm text-blue-800/75 mt-1">Untuk kirim notifikasi pesanan dan update status ke pelanggan.</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-900/85">
            <input
              type="checkbox"
              checked={integrations.whatsapp.enabled}
              onChange={(e) => updateSection('whatsapp', { enabled: e.target.checked })}
            />
            Aktifkan
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Nomor Business (E.164)">
            <input
              className="form-input"
              value={integrations.whatsapp.businessPhoneNumber}
              onChange={(e) => updateSection('whatsapp', { businessPhoneNumber: e.target.value })}
              placeholder="Contoh: +6281234567890"
            />
          </InputField>

          <InputField label="Sender Name">
            <input
              className="form-input"
              value={integrations.whatsapp.senderName}
              onChange={(e) => updateSection('whatsapp', { senderName: e.target.value })}
              placeholder="Contoh: Kasirin Official"
            />
          </InputField>

          <InputField label="API Key">
            <input
              className="form-input"
              value={integrations.whatsapp.apiKey}
              onChange={(e) => updateSection('whatsapp', { apiKey: e.target.value })}
              placeholder="Masukkan API key WhatsApp"
            />
          </InputField>
        </div>
      </div>

      <div className="card space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-950">Instagram</h2>
            <p className="text-sm text-blue-800/75 mt-1">Untuk integrasi DM, auto-reply, dan sinkronisasi katalog promosi.</p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-900/85">
            <input
              type="checkbox"
              checked={integrations.instagram.enabled}
              onChange={(e) => updateSection('instagram', { enabled: e.target.checked })}
            />
            Aktifkan
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Username Instagram">
            <input
              className="form-input"
              value={integrations.instagram.username}
              onChange={(e) => updateSection('instagram', { username: e.target.value })}
              placeholder="Contoh: toko_saya"
            />
          </InputField>

          <InputField label="Access Token">
            <input
              className="form-input"
              value={integrations.instagram.accessToken}
              onChange={(e) => updateSection('instagram', { accessToken: e.target.value })}
              placeholder="Masukkan token API Instagram"
            />
          </InputField>

          <InputField label="Webhook Secret">
            <input
              className="form-input"
              value={integrations.instagram.webhookSecret}
              onChange={(e) => updateSection('instagram', { webhookSecret: e.target.value })}
              placeholder="Masukkan secret webhook"
            />
          </InputField>
        </div>
      </div>

      <div className="card space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-950">Marketplace Toko</h2>
            <p className="text-sm text-blue-800/75 mt-1">
              Sambungkan ke marketplace toko yang sudah Anda buat agar order dan stok bisa tersinkron otomatis.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-blue-900/85">
              <input
                type="checkbox"
                checked={integrations.marketplace.enabled}
                onChange={(e) => updateSection('marketplace', { enabled: e.target.checked })}
              />
              Aktifkan
            </label>

            <button
              type="button"
              className="btn-secondary"
              onClick={testMarketplaceConnection}
              disabled={testingMarketplace}
            >
              {testingMarketplace ? 'Mengetes...' : 'Test Koneksi'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Nama Marketplace">
            <input
              className="form-input"
              value={integrations.marketplace.marketplaceName}
              onChange={(e) => updateSection('marketplace', { marketplaceName: e.target.value })}
              placeholder="Contoh: Marketplace Toko Internal"
            />
          </InputField>

          <InputField label="Store ID">
            <input
              className="form-input"
              value={integrations.marketplace.storeId}
              onChange={(e) => updateSection('marketplace', { storeId: e.target.value })}
              placeholder="ID toko pada marketplace"
            />
          </InputField>

          <InputField label="Base URL API Marketplace">
            <input
              className="form-input"
              value={integrations.marketplace.apiBaseUrl}
              onChange={(e) => updateSection('marketplace', { apiBaseUrl: e.target.value })}
              placeholder="Contoh: https://marketplace.tokoanda.com/api"
            />
          </InputField>

          <InputField label="API Key">
            <input
              className="form-input"
              value={integrations.marketplace.apiKey}
              onChange={(e) => updateSection('marketplace', { apiKey: e.target.value })}
              placeholder="Masukkan API key marketplace"
            />
          </InputField>

          <InputField label="API Secret">
            <input
              className="form-input"
              value={integrations.marketplace.apiSecret}
              onChange={(e) => updateSection('marketplace', { apiSecret: e.target.value })}
              placeholder="Masukkan API secret marketplace"
            />
          </InputField>

          <InputField label="Webhook URL (opsional)">
            <input
              className="form-input"
              value={integrations.marketplace.webhookUrl}
              onChange={(e) => updateSection('marketplace', { webhookUrl: e.target.value })}
              placeholder="Endpoint webhook dari marketplace"
            />
          </InputField>
        </div>
      </div>
    </div>
  );
}
