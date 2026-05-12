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
  const DEFAULT_PORT = Number(process.env.PORT || 5000);

  const start = async (port = DEFAULT_PORT) => {
    try {
      await connectDB();
      await bootstrapHost();

      const server = app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });

      server.on("error", async (error) => {
        if (error.code === "EADDRINUSE" && port === DEFAULT_PORT) {
          console.warn(`Port ${port} is already in use. Retrying on ${port + 1}...`);
          await start(port + 1);
          return;
        }

        console.error("Server start failed:", error.message);
        process.exit(1);
      });
    } catch (error) {
      console.error("Server start failed:", error.message);
      process.exit(1);
    }
  };

  start();
}