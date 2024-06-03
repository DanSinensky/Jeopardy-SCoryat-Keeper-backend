import { Router } from "express";
import userRoutes from "./userRoutes.js";
import gameRoutes from "./gameRoutes.js";
import scoreRoutes from "./scoreRoutes.js";

const router = Router();

router.use("/users", userRoutes);
router.use("/games", gameRoutes);
router.use("/scores", scoreRoutes)

export default router;