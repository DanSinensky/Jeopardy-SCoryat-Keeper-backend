import { Router } from "express";
import * as gameSessionControllers from "../controllers/gameSessionController.js";

const router = Router();

router.post('/', gameSessionControllers.createGameSession);
router.get('/session/:sessionId', gameSessionControllers.getGameSession);
router.get('/user/:userId', gameSessionControllers.getUserGameSessions);
router.post('/:sessionId', gameSessionControllers.updateGameSession);
router.delete('/:sessionId', gameSessionControllers.deleteGameSession);



export default router;