import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint - works even if other modules fail to load
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Thread AI API is running',
        env: {
            hasDeepSeekKey: !!process.env.DEEPSEEK_API_KEY
        }
    });
});

// Dynamic import wrapper to catch loading errors
app.use('/api', async (req, res, next) => {
    try {
        // Dynamically import the routes to prevent top-level crashes
        // and allow for better error reporting
        const { apiRouter } = await import('../src/api/routes');
        apiRouter(req, res, next);
    } catch (error) {
        console.error('Failed to load API routes:', error);
        res.status(500).json({ 
            error: 'Internal Server Error during route loading', 
            details: error instanceof Error ? error.message : String(error) 
        });
    }
});

export default app;
