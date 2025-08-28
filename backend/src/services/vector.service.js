const { Pinecone } = require('@pinecone-database/pinecone')
const uuid = require("uuid")

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const memoraai = pc.Index('memora-ai');

async function createMemory({ messageId, vector, metadata }) {

  const safeMetadata = Object.fromEntries(
    Object.entries(metadata).map(([key, val]) => [key, String(val)])
  );

  await memoraai.upsert([
    { id: messageId, values: vector, metadata: safeMetadata }
  ]);
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
  const filter = metadata
    ? Object.fromEntries(
        Object.entries(metadata).map(([key, val]) => [key, { $eq: String(val) }])
      )
    : undefined;

  const data = await memoraai.query({
    vector: queryVector,
    topK: limit,
    filter,
    includeMetadata: true,
  });

  return data.matches;
}

module.exports = {
  createMemory,
  queryMemory
};