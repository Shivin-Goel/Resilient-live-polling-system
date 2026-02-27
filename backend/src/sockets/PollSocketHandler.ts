import { Server, Socket } from 'socket.io';
import { pollService } from '../services/PollService';

export const setupPollSockets = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Student joins poll
        socket.on('join_poll', async (data: { pollId: string, studentName: string }) => {
            try {
                const participant = await pollService.joinPoll(data.pollId, data.studentName);
                if (participant) {
                    const participants = await pollService.getParticipants(data.pollId);
                    io.emit('participants_updated', participants);
                }
            } catch (error: any) {
                socket.emit('error_event', { message: error.message });
            }
        });

        // Teacher creates a poll
        socket.on('create_poll', async (data: { question: string, options: any[], duration: number }) => {
            try {
                const poll = await pollService.createPoll(data.question, data.options, data.duration);
                io.emit('poll_started', poll); // Broadcast to all clients
            } catch (error: any) {
                socket.emit('error_event', { message: error.message });
            }
        });

        // Student submits a vote
        socket.on('submit_vote', async (data: { pollId: string, studentName: string, selectedOption: string }) => {
            try {
                const results = await pollService.submitVote(data.pollId, data.studentName, data.selectedOption);
                io.emit('vote_updated', results); // Broadcast updated results to all clients
            } catch (error: any) {
                socket.emit('error_event', { message: error.message });
            }
        });

        // Send chat message
        socket.on('send_message', async (data: { pollId: string, senderName: string, senderRole: 'teacher' | 'student', text: string }) => {
            try {
                const message = await pollService.addChatMessage(data.pollId, data.senderName, data.senderRole, data.text);
                io.emit('new_message', message);
            } catch (error: any) {
                socket.emit('error_event', { message: error.message });
            }
        });

        // Teacher kicks out student
        socket.on('kick_user', async (data: { pollId: string, studentName: string }) => {
            try {
                const participants = await pollService.kickParticipant(data.pollId, data.studentName);
                io.emit('participants_updated', participants);
                io.emit('user_kicked', { studentName: data.studentName });
            } catch (error: any) {
                socket.emit('error_event', { message: error.message });
            }
        });

        // Teacher manually ends poll (optional, auto-ends via service)
        socket.on('end_poll', async (data: { pollId: string }) => {
            try {
                await pollService.completePoll(data.pollId);
                const results = await pollService.getPollResults(data.pollId);
                io.emit('poll_ended', { pollId: data.pollId, results });
            } catch (error: any) {
                socket.emit('error_event', { message: error.message });
            }
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};
