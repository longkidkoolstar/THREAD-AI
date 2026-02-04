import express from 'express';
import ViteExpress from 'vite-express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './api/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRouter);

ViteExpress.listen(app, Number(PORT), () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
