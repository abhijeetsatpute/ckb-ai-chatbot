// File: index.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const xmlparser = require("express-xml-bodyparser");
const xml2js = require("xml2js");

const {
  processFiles,
  processWebLinks,
  queryBot,
  processWordPressXML,
} = require("./services");

const {
  initStore,
  resetStore,
  deleteDocumentsBySource,
} = require("./db/vectorStoreManager");
const {
  getAllDataSources,
  removeDataSource,
  getDataSourceById,
  getDataSourcesByType,
  getDataSourcesCount,
  getDataSourcesPaginated,
} = require("./db/dataSourceManager");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(xmlparser({ trim: false, explicitArray: false }));

// Serve React static files
app.use(express.static(path.join(__dirname, "..", "client", "dist")));

// Get all data sources
app.get("/api/data-sources", async (req, res) => {
  try {
    const { type, page, limit } = req.query;

    if (type) {
      // Filter by type
      const dataSources = await getDataSourcesByType(type);
      res.json({ status: "success", dataSources });
    } else if (page && limit) {
      // Paginated results
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const result = await getDataSourcesPaginated(offset, parseInt(limit));
      const totalCount = await getDataSourcesCount();
      res.json({
        status: "success",
        dataSources: result.sources,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          hasMore: result.hasMore,
        },
      });
    } else {
      // Get all
      const dataSources = await getAllDataSources();
      res.json({ status: "success", dataSources });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get data sources statistics
app.get("/api/data-sources/stats", async (req, res) => {
  try {
    const totalCount = await getDataSourcesCount();
    const filesSources = await getDataSourcesByType("file");
    const weblinkSources = await getDataSourcesByType("weblink");
    const wordpressSources = await getDataSourcesByType("wordpress");

    const totalChunks = (await getAllDataSources()).reduce(
      (sum, source) => sum + source.chunks,
      0
    );

    res.json({
      status: "success",
      stats: {
        totalSources: totalCount,
        totalChunks: totalChunks,
        byType: {
          files: filesSources.length,
          weblinks: weblinkSources.length,
          wordpress: wordpressSources.length,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a specific data source
app.delete("/api/data-sources/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if data source exists
    const dataSource = await getDataSourceById(id);
    if (!dataSource) {
      return res.status(404).json({ error: "Data source not found" });
    }

    // Delete documents from vector store
    await deleteDocumentsBySource(id);

    // Remove from tracking
    const removedSource = await removeDataSource(id);

    res.json({
      status: "success",
      message: `Data source "${removedSource.name}" deleted successfully`,
      deletedSource: removedSource,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    const result = await queryBot(question);
    res.json({
      answer: result.answer,
      sources: result.sources,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/wordpress-xml", upload.single("file"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ error: "No XML file uploaded" });

    const xmlString = fs.readFileSync(req.file.path, "utf8");
    const parser = new xml2js.Parser({ explicitArray: false });

    const parsed = await parser.parseStringPromise(xmlString);
    fs.unlinkSync(req.file.path); // Clean up uploaded file

    const result = await processWordPressXML(parsed);
    res.json({ status: "success", result });
  } catch (err) {
    console.error("WordPress XML processing error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, async () => {
  await initStore();
  console.log("🚀 Server running on port 3000");
});
