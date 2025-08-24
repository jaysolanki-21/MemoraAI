// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const memoraai = pc.Index('memora-ai');

async function createMemory({messageId, vector, metadata}){
    await memoraai.upsert([{ id: messageId, values: vector, metadata }]);
}

async function queryMemory(queryVector,limit = 5, metadata) {
    const data = await memoraai.query({ vector: queryVector, topK: limit, filter: metadata ? { metadata } : undefined , includeMetadata: true });
    return data.matches;
}

module.exports = {
    createMemory,
    queryMemory
};
