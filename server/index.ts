import express from 'express';
import cors from 'cors';
import tenderRoutes from './routes/tenders.js';
import { testConnection } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tenders', tenderRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({ 
    status: dbConnected ? 'OK' : 'Database Error', 
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'Connected' : 'Disconnected'
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 BancaDati server running on port ${PORT}`);
  try {
    const dbConnected = await testConnection();
    console.log(`Database connection test result: ${dbConnected ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    console.error('Error testing database connection:', error);
  }
});