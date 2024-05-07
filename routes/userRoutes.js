import { Router } from "express";
import * as userControllers from "../controllers/userController.js";

const router = Router();

router.get("/", userControllers.getUsers);
router.post("/sign-up", userControllers.signUp);
router.post("/sign-in", userControllers.signIn);
router.get("/verify", userControllers.verify);

export default router;