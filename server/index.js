// File: index.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const { processFiles, processWebLinks, queryBot } = require("./services");
const { initStore, resetStore } = require("./db/vectorStoreManager");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

// Serve React static files
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

app.post("/api/reset", async (req, res) => {
  try {
    await resetStore();
    res.json({ status: "reset", message: "Knowledge base has been cleared." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/upload", upload.array("files"), async (req, res) => {
  try {
    const results = await processFiles(req.files);
    res.json({ status: "processed", results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/weblinks", async (req, res) => {
  const { links } = req.body;
  try {
    const result = await processWebLinks(links);
    res.json({ status: "success", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/chat", async (req, res) => {
  const { question } = req.body;
  try {
    const answer = await queryBot(question);
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, async () => {
  await initStore();
  console.log("🚀 Server running on port 3000");
});
