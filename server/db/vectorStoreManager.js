// File: db/vectorStoreManager.js
const { QdrantClient } = require("@qdrant/js-client-rest");
const {
  QdrantVectorStore,
} = require("@langchain/community/vectorstores/qdrant");
const { MistralAIEmbeddings } = require("@langchain/mistralai");
const {
  clearAllDataSources,
  initSourcesCollection,
} = require("./dataSourceManager");
require("dotenv").config();

const client = new QdrantClient({
  url: process.env.QDRANT_HOST,
  apiKey: process.env.QDRANT_API_KEY,
});
const embedder = new MistralAIEmbeddings({
  apiKey: process.env.MISTRAL_API_KEY,
});

const collectionName = process.env.KB_COLLECTION_NAME;

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

  // Initialize sources collection
  await initSourcesCollection();
};

const getStore = () => {
  if (!vectorStore) throw new Error("Vector store not initialized");
  return vectorStore;
};

const resetStore = async () => {
  await client.deleteCollection(collectionName);
  await initStore();
  // Clear all tracked data sources when resetting
  await clearAllDataSources();
};

// New function to delete documents by metadata filter
const deleteDocumentsBySource = async (sourceId) => {
  try {
    // Delete documents with matching sourceId in metadata
    await client.delete(collectionName, {
      filter: {
        must: [
          {
            key: "metadata.sourceId",
            match: {
              value: sourceId,
            },
          },
        ],
      },
    });
    return true;
  } catch (error) {
    console.error("Error deleting documents by source:", error);
    throw error;
  }
};

module.exports = { initStore, getStore, resetStore, deleteDocumentsBySource };
