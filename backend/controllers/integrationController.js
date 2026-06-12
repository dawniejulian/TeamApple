const DEFAULT_TIMEOUT_MS = 7000;

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

exports.testMarketplaceConnection = async (req, res) => {
  try {
    const { apiBaseUrl, storeId, apiKey, apiSecret } = req.body;

    if (!apiBaseUrl || !storeId) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'apiBaseUrl dan storeId wajib diisi'
      });
    }

    const normalizedBaseUrl = String(apiBaseUrl).replace(/\/+$/, '');
    const encodedStoreId = encodeURIComponent(String(storeId));

    const candidates = [
      `${normalizedBaseUrl}/health`,
      `${normalizedBaseUrl}/api/health`,
      `${normalizedBaseUrl}/stores/${encodedStoreId}`,
      `${normalizedBaseUrl}/api/stores/${encodedStoreId}`
    ];

    const headers = {
      Accept: 'application/json',
      'x-api-key': apiKey || '',
      'x-api-secret': apiSecret || ''
    };

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const attempts = [];

    for (const url of candidates) {
      try {
        const response = await fetchWithTimeout(url, { method: 'GET', headers }, DEFAULT_TIMEOUT_MS);
        attempts.push({
          url,
          status: response.status,
          ok: response.ok
        });

        if (response.ok) {
          return res.json({
            status: 'SUCCESS',
            message: 'Koneksi marketplace berhasil',
            data: {
              endpoint: url,
              statusCode: response.status
            },
            attempts
          });
        }
      } catch (error) {
        attempts.push({
          url,
          ok: false,
          error: error.name === 'AbortError' ? 'Request timeout' : error.message
        });
      }
    }

    return res.status(502).json({
      status: 'ERROR',
      message: 'Gagal terhubung ke marketplace. Periksa URL, store ID, atau kredensial API.',
      attempts
    });
  } catch (error) {
    return res.status(500).json({
      status: 'ERROR',
      message: error.message || 'Terjadi kesalahan saat test koneksi marketplace'
    });
  }
};
