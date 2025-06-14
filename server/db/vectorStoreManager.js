// vectorStoreManager.js
const { QdrantClient } = require("@qdrant/js-client-rest");
const {
  QdrantVectorStore,
} = require("@langchain/community/vectorstores/qdrant");
const { MistralAIEmbeddings } = require("@langchain/mistralai");
require("dotenv").config();

const client = new QdrantClient({ url: process.env.QDRANT_HOST });
const embedder = new MistralAIEmbeddings({
  apiKey: process.env.MISTRAL_API_KEY,
});

const collectionName = process.env.COLLECTION_NAME;

let vectorStore = null;

const initStore = async () => {
  try {
    await client.getCollection(collectionName);
  } catch {
    await client.createCollection(collectionName, {
      vectors: { size: 1024, distance: "Cosine" },
    });
  }

  vectorStore = await QdrantVectorStore.fromExistingCollection(embedder, {
    client,
    collectionName,
  });
};

const getStore = () => {
  if (!vectorStore) throw new Error("Vector store not initialized");
  return vectorStore;
};

const resetStore = async () => {
  await client.deleteCollection(collectionName);
  await initStore();
};

module.exports = { initStore, getStore, resetStore };
