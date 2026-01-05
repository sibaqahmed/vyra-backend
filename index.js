const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());

// ✅ READ FROM ENV VARIABLES (RENDER)
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const APP_ID = process.env.APP_ID;
const KID = process.env.KID;

if (!PRIVATE_KEY || !APP_ID || !KID) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

app.get("/jwt", (req, res) => {
  const { name, moderator } = req.query;

  if (!name) {
    return res.status(400).send("Missing name");
  }

  const payload = {
    aud: "jitsi",
    iss: "chat",
    sub: APP_ID,
    room: "*",
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    context: {
      user: {
        name,
        moderator: moderator === "true",
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

app.get("/", (_, res) => {
  res.send("JWT Server Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ JWT server running on port ${PORT}`);
});
