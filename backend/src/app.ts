import express from 'express';
import cors from 'cors';
import pollRoutes from './routes/PollRoutes';

const app = express();

app.use(cors({
    origin: '*', // Allow all origins for dev, restrict in production
    methods: ['GET', 'POST']
}));

app.use(express.json());

// Main App Routes
app.use('/api/polls', pollRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Resilient Live Polling System API is running.' });
});

export default app;
