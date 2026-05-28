import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Main API routes
app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'CATalyst API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
