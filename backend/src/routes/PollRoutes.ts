import { Router } from 'express';
import { getActivePoll, getPollHistory } from '../controllers/PollController';

const router = Router();

router.get('/active', getActivePoll);
router.get('/history', getPollHistory);

export default router;
