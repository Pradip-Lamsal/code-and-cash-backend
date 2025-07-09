import express from "express";
import {
  checkAdminAccess,
  createTask,
  deleteTask,
  deleteUser,
  downloadSubmissionFile,
  getAdminStats,
  getAllTasks,
  getAllUsers,
  getUserSubmissions,
  getUserTaskApplications,
  updateTaskSubmissionStatus,
} from "../controllers/adminController.js";
import { protect } from "../middlewares/auth.js";
import Task from "../models/Task.js";
import TaskApplication from "../models/TaskApplication.js";
import User from "../models/User.js";

const router = express.Router();

// Admin middleware to check if user is admin
const adminAuth = (req, res, next) => {
  // First use the protect middleware
  protect(req, res, (err) => {
    if (err) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Then check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  });
};

// Admin access verification
router.get("/check-access", adminAuth, checkAdminAccess);

// Debug endpoint to check actual database data
router.get("/debug", adminAuth, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const taskCount = await Task.countDocuments();

    const users = await User.find()
      .limit(5)
      .select("name email role createdAt");
    const tasks = await Task.find()
      .limit(5)
      .select("title company status payout difficulty category createdAt");

    console.log("🔍 DEBUG - Database check:");
    console.log(`Users in DB: ${userCount}`);
    console.log(`Tasks in DB: ${taskCount}`);
    console.log("Sample users:", users);
    console.log("Sample tasks with payout details:", tasks);

    // Check payout specifically
    tasks.forEach((task, index) => {
      console.log(
        `Task ${index + 1}: "${task.title}" - Payout: ${
          task.payout
        } (type: ${typeof task.payout})`
      );
    });

    res.json({
      status: "success",
      data: {
        userCount,
        taskCount,
        sampleUsers: users,
        sampleTasks: tasks,
      },
    });
  } catch (error) {
    console.error("❌ Debug endpoint error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Admin dashboard stats
router.get("/stats", adminAuth, getAdminStats);

// User management routes
router.get("/users", adminAuth, getAllUsers);
router.delete("/users/:userId", adminAuth, deleteUser);

// Task management routes
router.get("/tasks", adminAuth, getAllTasks);
router.post("/tasks", adminAuth, createTask);
router.delete("/tasks/:taskId", adminAuth, deleteTask);

// Task application and submission routes
router.get("/task-applications", adminAuth, getUserTaskApplications);

// Admin endpoint to approve/reject applications
router.patch(
  "/applications/:applicationId/status",
  adminAuth,
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status, feedback } = req.body;

      const validStatuses = [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: "error",
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", "
          )}`,
        });
      }

      const application = await TaskApplication.findById(applicationId)
        .populate("taskId", "title")
        .populate("userId", "name email");

      if (!application) {
        return res.status(404).json({
          status: "error",
          message: "Application not found",
        });
      }

      // Update application status
      application.status = status;
      if (feedback) {
        application.feedback = {
          comment: feedback,
          providedAt: new Date(),
        };
      }

      // If accepted, update task to mark user as assigned
      if (status === "accepted") {
        await Task.findByIdAndUpdate(application.taskId._id, {
          assignedTo: application.userId._id,
          status: "in_progress",
        });
      }

      await application.save();

      console.log(
        `✅ Admin ${req.user.email} updated application ${applicationId} to ${status}`
      );

      res.status(200).json({
        status: "success",
        message: "Application status updated successfully",
        data: {
          applicationId,
          status,
          feedback,
          taskTitle: application.taskId.title,
          applicantName: application.userId.name,
        },
      });
    } catch (error) {
      console.error("❌ Error updating application status:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to update application status",
      });
    }
  }
);

router.get("/user-submissions/:userId", adminAuth, getUserSubmissions);

// Submission file management
router.get(
  "/submissions/:submissionId/download",
  adminAuth,
  downloadSubmissionFile
);
router.patch(
  "/submissions/:submissionId/status",
  adminAuth,
  updateTaskSubmissionStatus
);

export default router;
