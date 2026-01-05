const express = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

// 🔑 PRIVATE KEY (same key uploaded in JAAS → API Keys)
const PRIVATE_KEY = fs.readFileSync("./jitsi_private_key.pem", "utf8");

// 🔹 JAAS TENANT / APP ID
const APP_ID = "vpaas-magic-cookie-2fbbf37f24184f5eb71ad71a6b5a3ac3";

// 🔹 FULL KEY ID (Tenant/KeyId)
const KID =
  "vpaas-magic-cookie-2fbbf37f24184f5eb71ad71a6b5a3ac3/c39c6e";

// 🔐 JWT ENDPOINT
app.get("/jwt", (req, res) => {
  const { name, moderator } = req.query;

  if (!name) {
    return res.status(400).send("Missing name");
  }

  const payload = {
    aud: "jitsi",
    iss: "chat",
    sub: APP_ID,

    // 🚨 REQUIRED FOR JAAS
    room: "*",

    exp: Math.floor(Date.now() / 1000) + 60 * 60,

    context: {
      user: {
        name,
        moderator: moderator === "true",
      },
      features: {
        livestreaming: false,
        recording: false,
        transcription: false,
      },
    },
  };

  const token = jwt.sign(payload, PRIVATE_KEY, {
    algorithm: "RS256",
    header: {
      kid: KID,
      typ: "JWT",
    },
  });

  res.json({ token });
});

// 🔹 ROOT CHECK
app.get("/", (_, res) => {
  res.send("JWT Server Running");
});

// 🚀 START SERVER
app.listen(3000, () => {
  console.log("✅ JWT server running on http://localhost:3000");
});
