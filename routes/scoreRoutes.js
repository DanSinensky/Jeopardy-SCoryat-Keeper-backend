import { Router } from "express";
import * as scoreControllers from "../controllers/scoreController.js";

const router = Router();

router.get('/', scoreControllers.getScores);
router.get('/:scoreId', scoreControllers.getScoreById);
router.get('/game/:gameId', scoreControllers.getScoresByGame);
router.post('/', scoreControllers.createScore);
router.put('/:scoreId', scoreControllers.updateScore);
router.delete('/:scoreId', scoreControllers.deleteScore);

export default router;