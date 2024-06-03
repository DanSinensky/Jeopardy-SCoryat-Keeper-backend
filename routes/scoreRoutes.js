import { Router } from "express";
import * as scoreControllers from "../controllers/scoreController.js";

const router = Router();

router.get('/', scoreControllers.getScores);
router.post('/', scoreControllers.createScore);
router.put('/:scoreId', scoreControllers.updateScore);
router.delete('/:scoreId', scoreControllers.deleteScore);

export default router;