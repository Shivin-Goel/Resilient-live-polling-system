import { useState, useCallback, useEffect } from 'react';
import { Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface PollOption {
    id: string;
    text: string;
}

export interface PollResult {
    optionId: string;
    count: number;
    percentage: number;
}

export interface IChatMessage {
    _id: string;
    senderName: string;
    senderRole: 'teacher' | 'student';
    text: string;
    createdAt: string;
}

export interface IParticipant {
    _id: string;
    name: string;
    status: 'active' | 'kicked';
    joinedAt: string;
}

export interface ActivePoll {
    _id: string;
    question: string;
    options: PollOption[];
    startTime: string;
    duration: number;
    status: 'active' | 'completed';
    remainingTime: number;
    results?: { totalVotes: number; options: PollResult[] };
    participants?: IParticipant[];
    chatMessages?: IChatMessage[];
}

export const usePollState = (socket: Socket | null, studentName?: string | null) => {
    const [activePoll, setActivePoll] = useState<ActivePoll | null>(null);
    const [loading, setLoading] = useState(true);
    const [isKicked, setIsKicked] = useState(false);

    const fetchActivePoll = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/polls/active`);
            const data = await response.json();
            if (data.success && data.data) {
                setActivePoll(data.data);

                // If student, check kick status
                if (studentName && data.data.participants) {
                    const me = data.data.participants.find((p: IParticipant) => p.name === studentName);
                    if (me && me.status === 'kicked') {
                        setIsKicked(true);
                    } else {
                        setIsKicked(false);
                    }
                }
            } else {
                setActivePoll(null);
                setIsKicked(false);
            }
        } catch (error) {
            console.error("Failed to fetch active poll:", error);
        } finally {
            setLoading(false);
        }
    }, [studentName]);

    useEffect(() => {
        fetchActivePoll();
    }, [fetchActivePoll]);

    useEffect(() => {
        if (!socket) return;

        // If we have a socket, a student name, and an active poll, emit join_poll (only when the ID changes to prevent spam)
        if (activePoll && activePoll._id && studentName && !isKicked) {
            socket.emit('join_poll', { pollId: activePoll._id, studentName });
        }

        const handlePollStarted = (poll: ActivePoll) => {
            setActivePoll(poll);
            setIsKicked(false);
            // Rejoin new poll if student
            if (studentName && poll._id) {
                socket.emit('join_poll', { pollId: poll._id, studentName });
            }
        };

        const handleVoteUpdated = (results: any) => {
            setActivePoll(prev => prev ? { ...prev, results } : null);
        };

        const handlePollEnded = (data: { pollId: string, results: any }) => {
            setActivePoll(prev => prev ? { ...prev, status: 'completed', results: data.results, remainingTime: 0 } : null);
        };

        const handleNewMessage = (msg: IChatMessage) => {
            setActivePoll(prev => prev ? { ...prev, chatMessages: [...(prev.chatMessages || []), msg] } : null);
        };

        const handleParticipantsUpdated = (participants: IParticipant[]) => {
            setActivePoll(prev => prev ? { ...prev, participants } : null);
        };

        const handleUserKicked = (data: { studentName: string }) => {
            if (studentName && data.studentName === studentName) {
                setIsKicked(true);
            }
        };

        socket.on('poll_started', handlePollStarted);
        socket.on('vote_updated', handleVoteUpdated);
        socket.on('poll_ended', handlePollEnded);
        socket.on('new_message', handleNewMessage);
        socket.on('participants_updated', handleParticipantsUpdated);
        socket.on('user_kicked', handleUserKicked);

        return () => {
            socket.off('poll_started', handlePollStarted);
            socket.off('vote_updated', handleVoteUpdated);
            socket.off('poll_ended', handlePollEnded);
            socket.off('new_message', handleNewMessage);
            socket.off('participants_updated', handleParticipantsUpdated);
            socket.off('user_kicked', handleUserKicked);
        };
    }, [socket, studentName, activePoll?._id]); // Run if socket, student, or poll ID changes

    return { activePoll, loading, isKicked, refresh: fetchActivePoll };
};
