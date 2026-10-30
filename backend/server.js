const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { connectRedis } = require("./redis");

// Routers
const userRouter = require("./routes/UserRouter");
const productRouter = require("./routes/ProductRouter");
const stockRouter = require("./routes/StockRouter");
const reportRouter = require("./routes/ReportRouter");
const exportRouter = require("./routes/ExportRouter");

// Error handler
const globalErrorHandler = require("./middlewares/GlobalErrorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Stock Market API running"
  });
});

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
  })
);

// API routes
app.use("/api/users", userRouter);
app.use("/api/auth", userRouter);
app.use("/api/products", productRouter);
app.use("/api/stock", stockRouter);
app.use("/api/reports", reportRouter);
app.use("/api/exports", exportRouter);

// Error handler must come after routes
app.use(globalErrorHandler);

async function startServer() {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Redis is optional: the API can start without caching
    try {
      await connectRedis();
      console.log("Redis connected:", await require("./redis").redisClient.ping());
    } catch (error) {
      console.error("Redis unavailable; continuing without cache:", error.message);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();