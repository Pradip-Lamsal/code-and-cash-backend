import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import config from "./config/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger.js";

// Import routes
import adminRouter from "./routes/admin.js";
import applicationRouter from "./routes/applications.js";
import authRouter from "./routes/auth.js";
import completedTaskRouter from "./routes/completedTask.js";
import profileRouter from "./routes/profile.js";
import taskRouter from "./routes/tasks.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Configure CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.use(express.json({ limit: "10mb" })); // Increase payload limit for image uploads
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Morgan logging in development mode
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// API routes
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/admin", adminRouter);
app.use("/api/completed-tasks", completedTaskRouter);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy",
  });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to Code and Cash API",
    version: "1.0.0",
    environment: config.nodeEnv,
  });
});

// 404 handler
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Error handler middleware
app.use(errorHandler);

// Start server
const PORT = config.port || 5001;
const server = app.listen(PORT, () => {
  logger.info(
    `Server running in ${config.nodeEnv} mode on http://localhost:${PORT}`
  );
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);

  try {
    // Import mongoose here to avoid circular dependency
    const mongoose = (await import("mongoose")).default;
    const User = mongoose.model("User");

    // Log all active sessions before shutdown
    const usersWithSessions = await User.find({
      "activeSessions.0": { $exists: true },
    });

    let totalActiveSessions = 0;
    for (const user of usersWithSessions) {
      totalActiveSessions += user.activeSessions.length;

      // Log each active session that will be terminated
      user.activeSessions.forEach((session) => {
        const sessionDuration = new Date() - new Date(session.createdAt);

        console.log("\n" + "=".repeat(60));
        console.log(`🛑 SESSION ENDED (SERVER SHUTDOWN)`);
        console.log("=".repeat(60));
        console.log(`👤 User: ${user.name} (${user.email})`);
        console.log(`🆔 User ID: ${user._id}`);
        console.log(`📱 Device: ${session.device}`);
        console.log(`🌐 IP Address: ${session.ipAddress || "Unknown"}`);
        console.log(`⏰ Started: ${new Date(session.createdAt).toISOString()}`);
        console.log(`⏰ Ended: ${new Date().toISOString()}`);
        console.log(
          `⏱️  Duration: ${Math.round(sessionDuration / 1000 / 60)} minutes`
        );
        console.log(`🎯 Reason: Server shutdown`);
        console.log(`🔑 Token: ${session.token.substring(0, 20)}...`);
        console.log("=".repeat(60) + "\n");
      });
    }

    if (totalActiveSessions > 0) {
      console.log(
        `\n🛑 SERVER SHUTDOWN: ${totalActiveSessions} active sessions terminated\n`
      );
    }

    // Close server
    server.close(() => {
      console.log("📡 HTTP server closed");

      // Close database connection
      mongoose.connection.close(false, () => {
        console.log("🗄️  MongoDB connection closed");
        console.log("✅ Graceful shutdown completed");
        process.exit(0);
      });
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.log("⚠️  Forcing shutdown after 10 seconds...");
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error("❌ Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Handle different shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGQUIT", () => gracefulShutdown("SIGQUIT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});
