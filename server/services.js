// File: services.js
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const cheerio = require("cheerio");
const mammoth = require("mammoth");
const dotenv = require("dotenv");
const { chromium } = require("playwright");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { Document } = require("langchain/document");
const { getStore } = require("./db/vectorStoreManager");
const { addDataSource } = require("./db/dataSourceManager");

dotenv.config();

const BATCH_SIZE = 50;

const indexDocuments = async (docs, sourceId) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  // Add sourceId to each document's metadata
  const docsWithSourceId = splitDocs.map((doc) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      sourceId: sourceId,
    },
  }));

  const vectorStore = getStore();

  for (let i = 0; i < docsWithSourceId.length; i += BATCH_SIZE) {
    const batch = docsWithSourceId.slice(i, i + BATCH_SIZE);
    await vectorStore.addDocuments(batch);
  }

  return { chunks: splitDocs.length };
};

const processFiles = async (files) => {
  const documents = [];
  const processedSources = [];

  for (const file of files) {
    const data = fs.readFileSync(file.path);
    let fileContent = "";
    let fileType = "text";

    if (file.mimetype === "application/pdf") {
      const parsed = await pdfParse(data);
      fileContent = parsed.text;
      fileType = "pdf";
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: data });
      fileContent = result.value;
      fileType = "docx";
    } else {
      fileContent = data.toString();
      fileType = "text";
    }

    // Create data source entry
    const dataSource = await addDataSource("file", file.originalname, {
      type: fileType,
      size: file.size,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });

    documents.push({
      doc: new Document({
        pageContent: fileContent,
        metadata: { source: file.originalname },
      }),
      sourceId: dataSource.id,
    });

    processedSources.push(dataSource);
    fs.unlinkSync(file.path); // cleanup
  }

  // Process each file separately to maintain source tracking
  let totalChunks = 0;
  for (const { doc, sourceId } of documents) {
    const result = await indexDocuments([doc], sourceId);
    totalChunks += result.chunks;

    // Update the data source with chunk count
    const dataSource = processedSources.find((s) => s.id === sourceId);
    if (dataSource) {
      dataSource.chunks = result.chunks;
    }
  }

  return { chunks: totalChunks, sources: processedSources };
};

const processWebLinks = async (links) => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const processedSources = [];
  let totalChunks = 0;

  for (const url of links) {
    try {
      await page.goto(url, { timeout: 15000 });
      const text = await page.locator("body").innerText();

      // Create data source entry
      const dataSource = await addDataSource("weblink", url, {
        url: url,
        contentLength: text.length,
      });

      const document = new Document({
        pageContent: text,
        metadata: { source: url },
      });

      const result = await indexDocuments([document], dataSource.id);
      dataSource.chunks = result.chunks;
      totalChunks += result.chunks;
      processedSources.push(dataSource);
    } catch (err) {
      console.error(`❌ Failed to fetch ${url}:`, err.message);
    }
  }

  await browser.close();
  return { chunks: totalChunks, sources: processedSources };
};

const queryBot = async (question) => {
  const vectorStore = getStore();
  const retriever = vectorStore.asRetriever();
  const docs = await retriever.getRelevantDocuments(question);
  const context = docs.map((doc) => doc.pageContent).join("\n---\n");

  const { ChatMistralAI } = require("@langchain/mistralai");
  const chatModel = new ChatMistralAI({ apiKey: process.env.MISTRAL_API_KEY });

  const res = await chatModel.invoke(
    `Answer the question based on context:\n${context}\n\nQ: ${question}`
  );
  return res.content;
};

const processWordPressXML = async (xmlBody) => {
  const items = xmlBody?.rss?.channel?.item;
  if (!items) throw new Error("Invalid XML structure");

  const posts = Array.isArray(items) ? items : [items];

  const documents = posts
    .filter((post) => post["wp:post_type"] === "post")
    .map((post) => {
      const title = post.title || "Untitled";
      const content = post["content:encoded"] || "";
      return new Document({
        pageContent: `${title}\n\n${content}`,
        metadata: { source: post.link || "WordPress XML" },
      });
    });

  // Create data source entry for WordPress XML
  const dataSource = await addDataSource("wordpress", "WordPress XML Import", {
    postsCount: documents.length,
    importDate: new Date().toISOString(),
  });

  const result = await indexDocuments(documents, dataSource.id);
  dataSource.chunks = result.chunks;

  return { chunks: result.chunks, sources: [dataSource] };
};

module.exports = {
  processFiles,
  processWebLinks,
  queryBot,
  processWordPressXML,
};
