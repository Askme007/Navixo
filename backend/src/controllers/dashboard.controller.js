import { DashboardService } from "../services/dashboard.service.js";

export async function getDashboard(req, res) {
  try {
    const data = await DashboardService.getDashboard(req.user.id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to load dashboard",
    });
  }
}