import { Router } from "express";
import { databaseManager } from "../config/database";
import { dataRepository } from "../repositories/dataRepository";

const router = Router();

router.get("/test", async (_req, res) => {
  try {
    const users = await dataRepository.getAllUsers();
    res.json({
      success: true,
      database: databaseManager.getDatabaseDiagnostics(),
      userCount: users.length,
      users,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || "Database error" });
  }
});

export default router;
