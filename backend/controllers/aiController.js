const OpenAI = require('openai');
const pool = require('../config/database');

const MAX_QUESTION_LENGTH = 800;

function buildClient() {
  const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
  const isPlaceholderKey = /^your_openai_api_key$/i.test(apiKey);

  if (!apiKey || isPlaceholderKey) {
    return null;
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined
  });
}

async function getBusinessSnapshot() {
  const today = new Date().toISOString().split('T')[0];

  const [todaySales, monthSales, lowStock, openPOs] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS revenue, COUNT(*)::int AS transactions
       FROM sales
       WHERE DATE(created_at) = $1`,
      [today]
    ),
    pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS revenue, COUNT(*)::int AS transactions
       FROM sales
       WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())`
    ),
    pool.query(
      `SELECT COUNT(DISTINCT product_id)::int AS low_stock
       FROM inventory
       WHERE quantity_available < 5`
    ),
    pool.query(
      `SELECT COUNT(*)::int AS open_pos
       FROM purchase_orders
       WHERE status IN ('DRAFT', 'APPROVED', 'SENT')`
    )
  ]);

  return {
    today: {
      revenue: Number(todaySales.rows[0].revenue),
      transactions: Number(todaySales.rows[0].transactions)
    },
    month: {
      revenue: Number(monthSales.rows[0].revenue),
      transactions: Number(monthSales.rows[0].transactions)
    },
    alerts: {
      lowStock: Number(lowStock.rows[0].low_stock),
      openPOs: Number(openPOs.rows[0].open_pos)
    }
  };
}

class AIController {
  static async askAssistant(req, res) {
    try {
      const question = String(req.body?.question || '').trim();

      if (!question) {
        return res.status(400).json({
          success: false,
          message: 'Pertanyaan wajib diisi'
        });
      }

      if (question.length > MAX_QUESTION_LENGTH) {
        return res.status(400).json({
          success: false,
          message: `Pertanyaan terlalu panjang (maksimal ${MAX_QUESTION_LENGTH} karakter)`
        });
      }

      const client = buildClient();
      if (!client) {
        return res.status(503).json({
          success: false,
          message: 'AI belum dikonfigurasi. Set OPENAI_API_KEY di .env root project (untuk Docker Compose) atau backend/.env (untuk jalan lokal tanpa Docker).'
        });
      }

      const snapshot = await getBusinessSnapshot();

      const systemPrompt = [
        'Anda adalah Asisten AI untuk aplikasi POS Kasirin.',
        'Jawab dalam Bahasa Indonesia yang ringkas, jelas, dan praktis.',
        'Jika memberi rekomendasi, berikan poin tindakan konkret.',
        'Gunakan konteks bisnis berikut saat relevan:',
        `- Penjualan hari ini: Rp ${snapshot.today.revenue.toLocaleString('id-ID')} dari ${snapshot.today.transactions} transaksi`,
        `- Penjualan bulan ini: Rp ${snapshot.month.revenue.toLocaleString('id-ID')} dari ${snapshot.month.transactions} transaksi`,
        `- Produk stok rendah: ${snapshot.alerts.lowStock}`,
        `- Purchase order terbuka: ${snapshot.alerts.openPOs}`,
        'Jangan mengarang data di luar konteks yang diberikan.'
      ].join('\n');

      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ]
      });

      const answer = completion.choices?.[0]?.message?.content?.trim();

      if (!answer) {
        return res.status(502).json({
          success: false,
          message: 'AI tidak mengembalikan jawaban.'
        });
      }

      return res.json({
        success: true,
        data: {
          answer,
          snapshot
        }
      });
    } catch (error) {
      console.error('AI assistant error:', error);

      if (error?.code === 'insufficient_quota' || error?.type === 'insufficient_quota') {
        return res.status(429).json({
          success: false,
          message: 'Kuota OpenAI habis/ belum tersedia. Cek billing dan limit usage di OpenAI dashboard.'
        });
      }

      if (error?.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'OPENAI_API_KEY tidak valid atau tidak punya akses ke project/model ini.'
        });
      }

      if (error?.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'Model OpenAI tidak ditemukan. Periksa OPENAI_MODEL di konfigurasi.'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Gagal memproses permintaan AI assistant.'
      });
    }
  }
}

module.exports = AIController;
