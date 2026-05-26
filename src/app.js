import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import authRoutes from './modules/auth/auth.routes.js';
import  errorHandler  from './common/middlewares/errorHandler.js';
import groupRoutes from './modules/groups/group.routes.js';
import extractorRoutes from './modules/extractor/extractor.routes.js';
import summarizerRoutes from './modules/summarizer/summarizer.router.js';
import gapRoutes from './modules/gap/gap.routes.js';
import topicRoutes from './modules/topic/topic.routes.js';
import integrationRoutes from './modules/integration/integration.routes.js';
import rrlRoutes from './modules/rrl/rrl.routes.js';
import objectiveRoutes from './modules/objective/objective.routes.js';
const app = express();

app.use(
  cors({
    // origin: process.env.FRONTEND_URL, 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
// app.options('*', cors());
app.get('/status', (_req, res) => {
  res.json({
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});
app.get('/', (_req, res) => {
  res.send('Backend is running!');
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', routes);
app.use('/api/auth',authRoutes);
app.use('/api/groups',groupRoutes);
app.use('/api/extractor',extractorRoutes);
app.use('/api/summarizer',summarizerRoutes);
app.use('/api/gap',gapRoutes);
app.use('/api/topic',topicRoutes)
app.use('/api/integration', integrationRoutes);
app.use('/api/rrl', rrlRoutes);
app.use('/api/objective', objectiveRoutes);

app.use(errorHandler);

export default app;
