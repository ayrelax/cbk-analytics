require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const teamsRouter   = require('./routes/teams');
const gamesRouter   = require('./routes/games');
const oddsRouter    = require('./routes/odds');
const futuresRouter = require('./routes/futures');
const importRouter  = require('./routes/import');
const syncRouter    = require('./routes/sync');

const { runScoreSync } = require('./services/scoreSync');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/teams',   teamsRouter);
app.use('/api/games',   gamesRouter);
app.use('/api/odds',    oddsRouter);
app.use('/api/futures', futuresRouter);
app.use('/api/import',  importRouter);
app.use('/api/sync',    syncRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

cron.schedule('*/30 10-23 * * *', async () => {
  console.log('[cron] Running score sync...');
  try {
    const result = await runScoreSync();
    console.log('[cron] Sync complete:', result);
  } catch (err) {
    console.error('[cron] Sync failed:', err.message);
  }
});

app.listen(PORT, () => console.log(`CBK Analytics backend running on port ${PORT}`));
