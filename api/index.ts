import express from 'express';
import cors from 'cors';
import { apiRouter } from '../src/api/routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Thread AI API is running',
        env: {
            hasDeepSeekKey: !!process.env.DEEPSEEK_API_KEY
        }
    });
});

app.use('/api', apiRouter);

export default app;
