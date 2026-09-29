// testRoutes.ts
import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

router.get("/test", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

export default router;
