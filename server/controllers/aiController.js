import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Get AI advice for posture
// @route   POST /api/ai/advice
// @access  Private
export const getAdvice = async (req, res, next) => {
  try {
    const { score, imbalance, durationSec, lastAlerts } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: 'AI service not configured',
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Sebagai ahli postur duduk, berikan saran singkat dan praktis dalam bahasa Indonesia untuk memperbaiki postur duduk berdasarkan data berikut:
- Skor postur saat ini: ${score}/100
- Durasi duduk: ${Math.floor(durationSec / 60)} menit
- Status alert terakhir: ${lastAlerts || 'tidak ada'}

Berikan 2-3 kalimat saran yang jelas dan actionable. Fokus pada perbaikan yang bisa dilakukan segera.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      data: {
        advice: text,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI advice',
    });
  }
};

