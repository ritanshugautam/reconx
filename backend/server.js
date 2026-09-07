import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import reconcileRouter from './routes/reconcile.js'
import explainRouter from './routes/explain.js'

const app = express()

app.use(express.json({ limit: '10mb' }))
const ALLOWED = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://reconx-mu.vercel.app',
  'https://reconx-98sk8i4k2-solace7.vercel.app',
]
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || ALLOWED.some(o => origin.startsWith(o))) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}))

app.use('/api/reconcile', reconcileRouter)
app.use('/api/explain', explainRouter)

app.get('/', (req, res) => {
  res.json({ status: 'ok', app: 'ReconX API' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`ReconX API running on port ${PORT}`)
})
