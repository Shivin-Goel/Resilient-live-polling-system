import { Poll, IPoll } from '../models/Poll';
import { Vote } from '../models/Vote';
import { ChatMessage } from '../models/ChatMessage';
import { Participant } from '../models/Participant';
import mongoose from 'mongoose';

export class PollService {
    /**
     * Initializes a new poll if no active poll exists
     */
    async createPoll(question: string, options: { id: string; text: string }[], duration: number): Promise<IPoll> {
        const activePoll = await Poll.findOne({ status: 'active' });
        if (activePoll) {
            throw new Error("An active poll already exists. Cannot create a new one until it completes.");
        }

        const poll = new Poll({
            question,
            options,
            duration,
            startTime: new Date()
        });

        await poll.save();

        // Auto complete poll after duration
        setTimeout(() => {
            this.completePoll(poll._id as string);
        }, duration * 1000);

        return poll;
    }

    /**
     * Completes an active poll
     */
    async completePoll(pollId: string) {
        await Poll.findByIdAndUpdate(pollId, { status: 'completed' });
    }

    /**
     * Gets the currently active poll, including calculated remaining time
     */
    async getActivePoll() {
        const poll = await Poll.findOne({ status: 'active' }).lean();
        if (!poll) return null;

        const remainingTime = this.calculateRemainingTime(poll.startTime, poll.duration);
        if (remainingTime <= 0) {
            await this.completePoll(poll._id.toString());
            return null;
        }

        // Get live vote counts
        const results = await this.getPollResults(poll._id.toString());
        const participants = await this.getParticipants(poll._id.toString());
        const chatMessages = await this.getChatMessages(poll._id.toString());

        return {
            ...poll,
            remainingTime,
            results,
            participants,
            chatMessages
        };
    }

    /**
     * Calculates the remaining time based on server start time and duration
     */
    private calculateRemainingTime(startTime: Date, duration: number): number {
        const elapsed = Math.floor((new Date().getTime() - new Date(startTime).getTime()) / 1000);
        return Math.max(0, duration - elapsed);
    }

    /**
     * Submits a vote for a student
     */
    async submitVote(pollId: string, studentName: string, selectedOption: string) {
        const poll = await Poll.findById(pollId);
        if (!poll) throw new Error("Poll not found");
        if (poll.status !== 'active') throw new Error("Poll is no longer active");

        const remainingTime = this.calculateRemainingTime(poll.startTime, poll.duration);
        if (remainingTime <= 0) {
            await this.completePoll(pollId);
            throw new Error("Poll duration has expired");
        }

        try {
            const vote = new Vote({
                pollId: new mongoose.Types.ObjectId(pollId),
                studentName,
                selectedOption
            });
            await vote.save();
        } catch (error: any) {
            if (error.code === 11000) {
                throw new Error("You have already voted on this poll");
            }
            throw error;
        }

        return await this.getPollResults(pollId);
    }

    /**
     * Gets aggregated vote results for a poll
     */
    async getPollResults(pollId: string) {
        const votes = await Vote.aggregate([
            { $match: { pollId: new mongoose.Types.ObjectId(pollId) } },
            { $group: { _id: "$selectedOption", count: { $sum: 1 } } }
        ]);

        const totalVotes = await Vote.countDocuments({ pollId });

        return {
            totalVotes,
            options: votes.map(v => ({
                optionId: v._id,
                count: v.count,
                percentage: totalVotes > 0 ? Math.round((v.count / totalVotes) * 100) : 0
            }))
        };
    }

    /**
     * Gets history of all completed polls with results
     */
    async getPollHistory() {
        const completedPolls = await Poll.find().sort({ createdAt: -1 }).lean();

        const history = await Promise.all(completedPolls.map(async (poll) => {
            const results = await this.getPollResults(poll._id.toString());
            return {
                ...poll,
                results
            };
        }));

        return history;
    }

    // --- Participant Logic ---

    async joinPoll(pollId: string, studentName: string) {
        const poll = await Poll.findById(pollId);
        if (!poll || poll.status !== 'active') return null;

        try {
            const participant = await Participant.findOneAndUpdate(
                { pollId: new mongoose.Types.ObjectId(pollId), name: studentName },
                { $setOnInsert: { pollId: new mongoose.Types.ObjectId(pollId), name: studentName, status: 'active' } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            return participant;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getParticipants(pollId: string) {
        return await Participant.find({ pollId: new mongoose.Types.ObjectId(pollId) }).sort({ joinedAt: 1 }).lean();
    }

    async kickParticipant(pollId: string, studentName: string) {
        await Participant.findOneAndUpdate(
            { pollId: new mongoose.Types.ObjectId(pollId), name: studentName },
            { status: 'kicked' }
        );
        return await this.getParticipants(pollId);
    }

    // --- Chat Logic ---

    async addChatMessage(pollId: string, senderName: string, senderRole: 'teacher' | 'student', text: string) {
        const poll = await Poll.findById(pollId);
        if (!poll || poll.status !== 'active') throw new Error("Poll is not active");

        const message = new ChatMessage({
            pollId: new mongoose.Types.ObjectId(pollId),
            senderName,
            senderRole,
            text
        });

        await message.save();
        return message;
    }

    async getChatMessages(pollId: string) {
        return await ChatMessage.find({ pollId: new mongoose.Types.ObjectId(pollId) }).sort({ createdAt: 1 }).lean();
    }
}

export const pollService = new PollService();
