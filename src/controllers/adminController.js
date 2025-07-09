import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Task from "../models/Task.js";
import User from "../models/User.js";
import catchAsync from "../utils/catchAsync.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Check if user has admin access
 */
export const checkAdminAccess = catchAsync(async (req, res) => {
  // If this route is accessed, the user is already authenticated as admin
  // due to the adminAuth middleware
  logger.info(`👑 Admin access verified for user: ${req.user.email}`);

  res.status(200).json({
    status: "success",
    message: "Admin access verified",
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    },
  });
});

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = catchAsync(async (req, res) => {
  console.log("🔍 Getting admin stats...");

  const totalUsers = await User.countDocuments();
  const totalTasks = await Task.countDocuments();
  const openTasks = await Task.countDocuments({ status: "open" }); // Open tasks
  const completedTasks = await Task.countDocuments({ status: "completed" });

  console.log(
    `📊 Stats: Users: ${totalUsers}, Tasks: ${totalTasks}, Open: ${openTasks}, Completed: ${completedTasks}`
  );

  // Get users registered in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Get tasks created in the last 30 days
  const recentTasks = await Task.countDocuments({
    createdAt: { $gte: thirtyDaysAgo },
  });

  // Get task applications count
  const taskApplications = await Task.aggregate([
    { $unwind: "$applicants" },
    { $count: "total" },
  ]);

  // Get task submissions count
  const taskSubmissions = await Task.aggregate([
    { $unwind: "$submissions" },
    { $count: "total" },
  ]);

  // Get pending reviews (submissions that need review)
  const pendingReviews = await Task.aggregate([
    { $unwind: "$submissions" },
    {
      $match: {
        "submissions.status": { $in: ["pending", "submitted"] },
      },
    },
    { $count: "total" },
  ]);

  // Get approved submissions
  const approvedSubmissions = await Task.aggregate([
    { $unwind: "$submissions" },
    { $match: { "submissions.status": "approved" } },
    { $count: "total" },
  ]);

  // Get rejected submissions
  const rejectedSubmissions = await Task.aggregate([
    { $unwind: "$submissions" },
    { $match: { "submissions.status": "rejected" } },
    { $count: "total" },
  ]);

  logger.info(`🔍 Admin stats accessed by user: ${req.user.email}`);

  res.status(200).json({
    status: "success",
    data: {
      totalUsers,
      totalTasks,
      openTasks,
      completedTasks,
      recentUsers,
      recentTasks,
      totalApplications:
        taskApplications.length > 0 ? taskApplications[0].total : 0,
      totalSubmissions:
        taskSubmissions.length > 0 ? taskSubmissions[0].total : 0,
      pendingReviews: pendingReviews.length > 0 ? pendingReviews[0].total : 0,
      approvedSubmissions:
        approvedSubmissions.length > 0 ? approvedSubmissions[0].total : 0,
      rejectedSubmissions:
        rejectedSubmissions.length > 0 ? rejectedSubmissions[0].total : 0,
      lastUpdated: new Date().toISOString(),
    },
  });
});

/**
 * Get all registered users
 */
export const getAllUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .select("-password -sessions") // Exclude sensitive information
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalUsers = await User.countDocuments();
  const totalPages = Math.ceil(totalUsers / limit);

  logger.info(`📋 Admin ${req.user.email} retrieved ${users.length} users`);

  res.status(200).json({
    status: "success",
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

/**
 * Get all tasks posted on the platform
 */
export const getAllTasks = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const tasks = await Task.find()
    .populate("applicants.user", "name email")
    .populate("submissions.user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Debug payout values
  console.log("🔍 getAllTasks - Checking payout values:");
  tasks.forEach((task, index) => {
    console.log(
      `Task ${index + 1}: "${task.title}" - Payout: ${
        task.payout
      } (type: ${typeof task.payout})`
    );
  });

  const totalTasks = await Task.countDocuments();
  const totalPages = Math.ceil(totalTasks / limit);

  logger.info(`📋 Admin ${req.user.email} retrieved ${tasks.length} tasks`);

  res.status(200).json({
    status: "success",
    data: {
      tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
});

/**
 * View which users have applied to which tasks
 */
export const getUserTaskApplications = catchAsync(async (req, res) => {
  const applications = await Task.aggregate([
    { $unwind: "$applicants" },
    {
      $lookup: {
        from: "users",
        localField: "applicants.user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
    {
      $project: {
        taskId: "$_id",
        taskTitle: "$title",
        taskCategory: "$category",
        taskPayout: "$payout",
        userId: "$applicants.user",
        userName: "$userInfo.name",
        userEmail: "$userInfo.email",
        applicationDate: "$applicants.appliedAt",
        applicationStatus: "$applicants.status",
      },
    },
    { $sort: { applicationDate: -1 } },
  ]);

  logger.info(
    `📋 Admin ${req.user.email} retrieved ${applications.length} task applications`
  );

  res.status(200).json({
    status: "success",
    data: {
      applications,
      total: applications.length,
    },
  });
});

/**
 * Get user submissions for a specific user
 */
export const getUserSubmissions = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("name email");
  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  const submissions = await Task.aggregate([
    { $unwind: "$submissions" },
    { $match: { "submissions.user": userId } },
    {
      $project: {
        taskId: "$_id",
        taskTitle: "$title",
        taskCategory: "$category",
        taskPayout: "$payout",
        submissionId: "$submissions._id",
        submissionFile: "$submissions.file",
        submissionDate: "$submissions.submittedAt",
        submissionStatus: "$submissions.status",
        feedback: "$submissions.feedback",
      },
    },
    { $sort: { submissionDate: -1 } },
  ]);

  logger.info(
    `📋 Admin ${req.user.email} retrieved ${submissions.length} submissions for user ${user.name}`
  );

  res.status(200).json({
    status: "success",
    data: {
      user,
      submissions,
      total: submissions.length,
    },
  });
});

/**
 * Download submission file
 */
export const downloadSubmissionFile = catchAsync(async (req, res) => {
  const { submissionId } = req.params;

  const task = await Task.findOne({ "submissions._id": submissionId });
  if (!task) {
    return res.status(404).json({
      status: "error",
      message: "Submission not found",
    });
  }

  const submission = task.submissions.id(submissionId);
  if (!submission) {
    return res.status(404).json({
      status: "error",
      message: "Submission not found",
    });
  }

  const filePath = path.join(
    __dirname,
    "..",
    "..",
    "uploads",
    "submissions",
    submission.file
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      status: "error",
      message: "File not found",
    });
  }

  logger.info(
    `📥 Admin ${req.user.email} downloaded submission file: ${submission.file}`
  );

  res.download(filePath, submission.file);
});

/**
 * Update task submission status
 */
export const updateTaskSubmissionStatus = catchAsync(async (req, res) => {
  const { submissionId } = req.params;
  const { status, feedback } = req.body;

  const validStatuses = ["pending", "submitted", "approved", "rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      status: "error",
      message:
        "Invalid status. Must be one of: pending, submitted, approved, rejected",
    });
  }

  const task = await Task.findOne({ "submissions._id": submissionId });
  if (!task) {
    return res.status(404).json({
      status: "error",
      message: "Submission not found",
    });
  }

  const submission = task.submissions.id(submissionId);
  if (!submission) {
    return res.status(404).json({
      status: "error",
      message: "Submission not found",
    });
  }

  // Update submission status
  submission.status = status;
  if (feedback) {
    submission.feedback = feedback;
  }
  submission.reviewedAt = new Date();
  submission.reviewedBy = req.user._id;

  await task.save();

  logger.info(
    `✅ Admin ${req.user.email} updated submission ${submissionId} status to ${status}`
  );

  res.status(200).json({
    status: "success",
    message: "Submission status updated successfully",
    data: {
      submissionId,
      status,
      feedback,
      reviewedAt: submission.reviewedAt,
      reviewedBy: req.user.name,
    },
  });
});

/**
 * Create/post new task (Admin only)
 */
export const createTask = catchAsync(async (req, res) => {
  const {
    title,
    description,
    category,
    difficulty,
    payout,
    deadline,
    requirements,
    tags,
    company,
    duration,
    status,
  } = req.body;

  // Validate required fields
  if (!title || !description || !category || !difficulty || !payout) {
    return res.status(400).json({
      status: "error",
      message:
        "Missing required fields: title, description, category, difficulty, payout",
    });
  }

  const task = new Task({
    title,
    description,
    category,
    difficulty,
    payout,
    company: company || "Code and Cash",
    clientId: req.user._id, // Admin is the client
    duration: duration || 7, // Default 7 days
    status: status || "open",
    deadline: deadline ? new Date(deadline) : null,
    requirements: requirements || [],
    tags: tags || [],
    createdBy: req.user._id,
    isActive: true,
  });

  await task.save();

  logger.info(`✅ Admin ${req.user.email} created new task: ${title}`);

  res.status(201).json({
    status: "success",
    message: "Task created successfully",
    data: {
      task,
    },
  });
});

/**
 * Delete any user
 */
export const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  // Prevent deleting other admin users
  if (
    user.role === "admin" &&
    user._id.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({
      status: "error",
      message: "Cannot delete other admin users",
    });
  }

  // Remove user from all task applications and submissions
  await Task.updateMany(
    { "applicants.user": userId },
    { $pull: { applicants: { user: userId } } }
  );

  await Task.updateMany(
    { "submissions.user": userId },
    { $pull: { submissions: { user: userId } } }
  );

  await User.findByIdAndDelete(userId);

  logger.info(
    `🗑️ Admin ${req.user.email} deleted user: ${user.name} (${user.email})`
  );

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});

/**
 * Delete any task
 */
export const deleteTask = catchAsync(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) {
    return res.status(404).json({
      status: "error",
      message: "Task not found",
    });
  }

  await Task.findByIdAndDelete(taskId);

  logger.info(`🗑️ Admin ${req.user.email} deleted task: ${task.title}`);

  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});
