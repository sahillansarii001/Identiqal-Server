import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "./src/config/env.config.js";
import { connectDatabase } from "./src/db/connection.js";

// Import Routes
import authRoutes from "./src/routes/auth.routes.js";
import cardRoutes from "./src/routes/cards.routes.js";
import themeRoutes from "./src/routes/themes.routes.js";
import leadRoutes from "./src/routes/leads.routes.js";
import analyticsRoutes from "./src/routes/analytics.routes.js";
import orgRoutes from "./src/routes/organizations.routes.js";
import billingRoutes from "./src/routes/billing.routes.js";
import onboardingRoutes from "./src/routes/onboardingRoutes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import presetRoutes from "./src/routes/presets.routes.js";
import templatesRoutes from "./src/routes/templates.routes.js";

// Import Controllers (for standalone public endpoints)
import { getPublicCard } from "./src/controllers/cardController.js";

// Import Middleware
import { errorHandler } from "./src/middleware/error.middleware.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
connectDatabase();

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/organizations", orgRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/presets", presetRoutes);
app.use("/api/templates", templatesRoutes);

// Public Card Retrieval endpoint (highest traffic, cached)
app.get("/api/public/cards/:slug", getPublicCard);

// Nested Card Routes (Cards CRUD + Leads nested routes)
app.use("/api/cards", cardRoutes);
app.use("/api/cards", leadRoutes);

// General Analytics Routes (Events POST + Aggregation GET)
app.use("/api", analyticsRoutes);

// Catch-all 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Listen
const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
