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

dotenv.config();

const indexDocuments = async (docs) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await splitter.splitDocuments(docs);
  const vectorStore = getStore();
  await vectorStore.addDocuments(splitDocs);

  return { chunks: splitDocs.length };
};

const processFiles = async (files) => {
  const documents = [];

  for (const file of files) {
    const data = fs.readFileSync(file.path);

    if (file.mimetype === "application/pdf") {
      const parsed = await pdfParse(data);
      documents.push(
        new Document({
          pageContent: parsed.text,
          metadata: { source: file.originalname },
        })
      );
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: data });
      documents.push(
        new Document({
          pageContent: result.value,
          metadata: { source: file.originalname },
        })
      );
    } else {
      documents.push(
        new Document({
          pageContent: data.toString(),
          metadata: { source: file.originalname },
        })
      );
    }

    fs.unlinkSync(file.path); // cleanup
  }

  return await indexDocuments(documents);
};

const processWebLinks = async (links) => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const documents = [];

  for (const url of links) {
    try {
      await page.goto(url, { timeout: 15000 });
      const text = await page.locator("body").innerText();
      documents.push(
        new Document({ pageContent: text, metadata: { source: url } })
      );
    } catch (err) {
      console.error(`❌ Failed to fetch ${url}:`, err.message);
    }
  }

  await browser.close();
  return await indexDocuments(documents);
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

module.exports = { processFiles, processWebLinks, queryBot };
