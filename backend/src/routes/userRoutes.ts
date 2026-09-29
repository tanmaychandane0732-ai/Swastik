import { Request, Response, Router } from "express";
import prisma from "../config/prisma";

const router = Router();

router.get("/test", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
});
router.post("/seed", async (_req: Request, res: Response) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Shreyas",
        email: "shreyas@test.com",
        passwordHash: "demo123",
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Database error",
    });
  }
});

export default router;