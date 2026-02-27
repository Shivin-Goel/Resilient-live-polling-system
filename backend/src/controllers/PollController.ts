import { Request, Response } from 'express';
import { pollService } from '../services/PollService';

export const getActivePoll = async (req: Request, res: Response) => {
    try {
        const poll = await pollService.getActivePoll();
        if (!poll) {
            return res.status(200).json({ success: true, message: 'No active poll', data: null });
        }
        return res.status(200).json({ success: true, data: poll });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getPollHistory = async (req: Request, res: Response) => {
    try {
        const history = await pollService.getPollHistory();
        return res.status(200).json({ success: true, data: history });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
