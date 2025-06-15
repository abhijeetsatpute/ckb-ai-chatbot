// File: db/dataSourceManager.js
const { QdrantClient } = require("@qdrant/js-client-rest");
const crypto = require("crypto");
require("dotenv").config();

const client = new QdrantClient({ url: process.env.QDRANT_HOST });
const SOURCES_COLLECTION =
  process.env.SOURCES_COLLECTION_NAME || "data_sources";

// Initialize sources collection
const initSourcesCollection = async () => {
  try {
    await client.getCollection(SOURCES_COLLECTION);
  } catch {
    await client.createCollection(SOURCES_COLLECTION, {
      vectors: { size: 1, distance: "Cosine" }, // Minimal vector since we only need storage
    });
  }
};

// Generate unique ID for data source
const generateId = () => {
  return crypto.randomUUID();
};

// Add a new data source
const addDataSource = async (type, name, metadata = {}) => {
  const id = generateId();
  const sourceData = {
    id,
    type, // 'file', 'weblink', 'wordpress'
    name,
    timestamp: new Date().toISOString(),
    metadata,
    chunks: metadata.chunks || 0,
  };

  try {
    await client.upsert(SOURCES_COLLECTION, {
      points: [
        {
          id: id,
          vector: [0], // Dummy vector since we only need storage
          payload: sourceData,
        },
      ],
    });

    return sourceData;
  } catch (error) {
    console.error("Error adding data source:", error);
    throw error;
  }
};

// Remove a data source by ID
const removeDataSource = async (id) => {
  try {
    // First get the source to return it
    const result = await client.retrieve(SOURCES_COLLECTION, {
      ids: [id],
      with_payload: true,
    });

    if (result.length === 0) {
      throw new Error("Data source not found");
    }

    const removedSource = result[0].payload;

    // Delete the source
    await client.delete(SOURCES_COLLECTION, {
      points: [id],
    });

    return removedSource;
  } catch (error) {
    console.error("Error removing data source:", error);
    throw error;
  }
};

// Get all data sources
const getAllDataSources = async () => {
  try {
    const result = await client.scroll(SOURCES_COLLECTION, {
      with_payload: true,
      with_vector: false,
      limit: 1000, // Adjust based on your needs
    });

    return result.points.map((point) => point.payload);
  } catch (error) {
    console.error("Error getting all data sources:", error);
    throw error;
  }
};

// Get data source by ID
const getDataSourceById = async (id) => {
  try {
    const result = await client.retrieve(SOURCES_COLLECTION, {
      ids: [id],
      with_payload: true,
    });

    if (result.length === 0) {
      return null;
    }

    return result[0].payload;
  } catch (error) {
    console.error("Error getting data source by ID:", error);
    throw error;
  }
};

// Clear all data sources (used during reset)
const clearAllDataSources = async () => {
  try {
    // Delete and recreate the collection
    await client.deleteCollection(SOURCES_COLLECTION);
    await initSourcesCollection();
  } catch (error) {
    console.error("Error clearing all data sources:", error);
    throw error;
  }
};

// Update data source
const updateDataSource = async (id, updates) => {
  try {
    // Get current source
    const current = await getDataSourceById(id);
    if (!current) {
      throw new Error("Data source not found");
    }

    // Merge updates
    const updatedSource = { ...current, ...updates };

    // Update in Qdrant
    await client.upsert(SOURCES_COLLECTION, {
      points: [
        {
          id: id,
          vector: [0], // Dummy vector
          payload: updatedSource,
        },
      ],
    });

    return updatedSource;
  } catch (error) {
    console.error("Error updating data source:", error);
    throw error;
  }
};

// Search data sources by type
const getDataSourcesByType = async (type) => {
  try {
    const result = await client.scroll(SOURCES_COLLECTION, {
      filter: {
        must: [
          {
            key: "type",
            match: {
              value: type,
            },
          },
        ],
      },
      with_payload: true,
      with_vector: false,
      limit: 1000,
    });

    return result.points.map((point) => point.payload);
  } catch (error) {
    console.error("Error getting data sources by type:", error);
    throw error;
  }
};

// Get data sources count
const getDataSourcesCount = async () => {
  try {
    const result = await client.count(SOURCES_COLLECTION);
    return result.count;
  } catch (error) {
    console.error("Error getting data sources count:", error);
    throw error;
  }
};

// Get data sources with pagination
const getDataSourcesPaginated = async (offset = 0, limit = 50) => {
  try {
    const result = await client.scroll(SOURCES_COLLECTION, {
      with_payload: true,
      with_vector: false,
      limit: limit,
      offset: offset,
    });

    return {
      sources: result.points.map((point) => point.payload),
      hasMore: result.points.length === limit,
    };
  } catch (error) {
    console.error("Error getting paginated data sources:", error);
    throw error;
  }
};

module.exports = {
  initSourcesCollection,
  addDataSource,
  removeDataSource,
  getAllDataSources,
  getDataSourceById,
  clearAllDataSources,
  updateDataSource,
  getDataSourcesByType,
  getDataSourcesCount,
  getDataSourcesPaginated,
};
