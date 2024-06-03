import { Router } from "express";
import * as gameControllers from "../controllers/gameController.js";

const router = Router();

router.get('/', gameControllers.getGames);
router.post('/', gameControllers.createGame);
router.put('/:gameId', gameControllers.updateGame);
router.delete('/:gameId', gameControllers.deleteGame);

export default router;