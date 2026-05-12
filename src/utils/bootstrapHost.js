const bcrypt = require("bcryptjs");
const User = require("../models/User");

const bootstrapHost = async () => {
  const hostEmail = (process.env.HOST_EMAIL || "").toLowerCase().trim();
  const hostPassword = (process.env.HOST_PASSWORD || "").trim();
  const hostName = process.env.HOST_NAME || "System Host";

  if (!hostEmail || !hostPassword) {
    console.warn(
      "HOST_EMAIL or HOST_PASSWORD missing. Host bootstrap skipped.",
    );
    return;
  }

  const hashedPassword = await bcrypt.hash(hostPassword, 10);

  // Update in place instead of delete+create so existing user id stays stable.
  // This prevents active JWT sessions from breaking after app restarts.
  await User.findOneAndUpdate(
    { email: hostEmail },
    {
      $set: {
        name: hostName,
        email: hostEmail,
        password: hashedPassword,
        role: "host",
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  console.log("Host account synced from environment.");
};

module.exports = bootstrapHost;
