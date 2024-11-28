import { Router } from "express";
import * as scoreControllers from "../controllers/scoreController.js";

const router = Router();

router.get('/', scoreControllers.getScores);
router.get('/:id', scoreControllers.getScoreById);
router.get('/game/:gameId', scoreControllers.getScoresByGame);
router.get('/user/:userId', scoreControllers.getScoresByUser);
router.post('/', scoreControllers.createScore);
router.put('/:id', scoreControllers.updateScore);
// router.post('/scores', scoreControllers.createOrUpdateScore);
router.delete('/:id', scoreControllers.deleteScore);

export default router;