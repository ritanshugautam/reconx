import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import reconcileRouter from './routes/reconcile.js'
import explainRouter from './routes/explain.js'

const app = express()

app.use(express.json({ limit: '10mb' }))
app.use(cors())

app.use('/api/reconcile', reconcileRouter)
app.use('/api/explain', explainRouter)

app.get('/', (req, res) => {
  res.json({ status: 'ok', app: 'ReconX API' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`ReconX API running on port ${PORT}`)
})
