import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './app';
import connectDB from './config/database';
import { setupPollSockets } from './sockets/PollSocketHandler';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

// Setup Socket.IO Server
const io = new Server(httpServer, {
    cors: {
        origin: '*', // Allow all origins for dev
        methods: ['GET', 'POST']
    }
});

// Initialize socket handlers
setupPollSockets(io);

// Connect to Database and start server
const startServer = async () => {
    await connectDB();

    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
