import { Router } from 'express'
import { GoogleGenAI } from '@google/genai'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { summary, sample_mismatches = [] } = req.body

    if (!summary) {
      return res.status(400).json({ error: 'summary is required' })
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'AI not configured' })
    }

    const sampleText = sample_mismatches.length > 0
      ? 'Sample mismatches:\n' + sample_mismatches.map(m =>
          `  TXN ${m.id}: our records show Rs ${m.internal_amount}, counterparty shows Rs ${m.external_amount} (difference: Rs ${m.discrepancy})`
        ).join('\n')
      : ''

    const prompt = `You are a senior financial reconciliation analyst explaining results to a junior operations team member at a bank or payment company. Be specific, professional, and concise.

Reconciliation results:
- Total transactions compared: ${summary.total}
- Matched perfectly: ${summary.matched}
- Amount mismatches: ${summary.amount_mismatch}
- Missing in our records: ${summary.missing_in_internal}
- Missing in counterparty statement: ${summary.missing_in_external}

${sampleText}

Provide:
1. A 2-sentence overall assessment of the reconciliation quality
2. The most likely causes of the discrepancies (be specific — timing differences, fee deductions, currency rounding, data entry errors)
3. Recommended next steps for the operations team
Keep the entire response under 200 words.`

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: prompt,
    })

    res.json({ explanation: response.text })
  } catch (err) {
    console.error('AI explain error:', err.message)
    res.status(500).json({ error: 'AI explanation failed. Try again.' })
  }
})

export default router
