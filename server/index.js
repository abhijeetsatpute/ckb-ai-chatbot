// File: index.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { processFiles, processWebLinks, queryBot } = require("./services");
const fs = require("fs");
const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

app.post("/api/reset", async (req, res) => {
  try {
    if (fs.existsSync("./faiss-index")) {
      fs.rmSync("./faiss-index", { recursive: true, force: true });
    }
    vectorStore = null;
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

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
