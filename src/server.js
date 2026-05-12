require("dotenv").config();

const connectDB = require("./config/db");
const bootstrapHost = require("./utils/bootstrapHost");
const app = require("./app");

// For Vercel serverless deployment
if (process.env.VERCEL) {
  // Export the app for Vercel
  module.exports = app;

  // Connect to database on cold start
  connectDB().then(() => {
    console.log("Database connected");
    return bootstrapHost();
  }).then(() => {
    console.log("Host bootstrapped");
  }).catch((error) => {
    console.error("Initialization failed:", error.message);
  });
} else {
  // For local development
  const PORT = process.env.PORT || 5000;

  const start = async () => {
    try {
      await connectDB();
      await bootstrapHost();

      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("Server start failed:", error.message);
      process.exit(1);
    }
  };

  start();
}