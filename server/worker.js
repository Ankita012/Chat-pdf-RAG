import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { OllamaEmbeddings } from "@langchain/ollama";

dotenv.config();

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
});

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const worker = new Worker(
  'file-upload-queue',
  async (job) => {
    const startTime = Date.now();
    console.log(`🚀 Starting job ${job.id}:`, job.data);

    try {
      const data = JSON.parse(job.data);
      const filePath = path.resolve(data.path);

      // Verify file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      console.log(`📄 Loading PDF from: ${filePath}`);
      // Load the PDF with error handling
      const loader = new PDFLoader(filePath);
      const docs = await loader.load();

      if (!docs || docs.length === 0) {
        throw new Error('Failed to extract content from PDF');
      }

      console.log(`📑 Loaded ${docs.length} pages from PDF`);
      // Add filename to metadata for better tracking
      docs.forEach(doc => {
        doc.metadata = {
          ...doc.metadata,
          filename: data.filename,
          uploadPath: data.path
        };
      });

      // Split documents into smaller chunks for better retrieval
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: ["\n\n", "\n", ". ", " ", ""],
      });

      const splitDocs = await textSplitter.splitDocuments(docs);
      console.log(`✂️ Split into ${splitDocs.length} chunks`);

      // Validate chunks
      const validChunks = splitDocs.filter(doc => doc.pageContent.trim().length > 10);
      if (validChunks.length === 0) {
        throw new Error('No valid content chunks found in PDF');
      }

      console.log(`✅ ${validChunks.length} valid chunks ready for embedding`);

      // Initialize embeddings with retry logic
        const embeddings = new OllamaEmbeddings({
            model: "nomic-embed-text",
        });

      // Test embeddings with a small sample first
      console.log('🧪 Testing embeddings...');
      await embeddings.embedQuery("test");
      console.log('✅ Embeddings working correctly');

      console.log('🔗 Connecting to Qdrant...');
      // Try to create or connect to existing collection
      let vectorStore;
      const qdrantConfig = {
        url: process.env.QDRANT_URL || 'http://localhost:6333',
        collectionName: "pdf-chat-collection",
      };

      try {
        // Try to connect to existing collection
        vectorStore = await QdrantVectorStore.fromExistingCollection(
          embeddings,
          qdrantConfig
        );
        console.log('📦 Connected to existing collection');
        // Add all documents to existing collection
        console.log('📝 Adding documents to vector store...');
        await vectorStore.addDocuments(validChunks);
      } catch (error) {
        console.log('📦 Collection does not exist, creating new one...');
        // Create new collection with all documents
        vectorStore = await QdrantVectorStore.fromDocuments(
          validChunks,
          embeddings,
          qdrantConfig
        );
        console.log('🎉 Created new collection with all documents');
      }

      // Clean up uploaded file after successful processing (optional)
      try {
        fs.unlinkSync(filePath);
        console.log('🗑️ Cleaned up uploaded file');
      } catch (cleanupError) {
        console.warn('⚠️ Could not clean up file:', cleanupError.message);
      }

      const processingTime = Date.now() - startTime;
      console.log(`✅ Successfully processed ${validChunks.length} document chunks in ${processingTime}ms`);

      // Return success data
      return {
        success: true,
        documentsProcessed: validChunks.length,
        filename: data.filename,
        processingTimeMs: processingTime
      };

    } catch (error) {
      console.error('❌ Error processing PDF:', error);
      // Enhanced error reporting
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        jobData: job.data,
        timestamp: new Date().toISOString()
      };
      console.error('Full error details:', errorDetails);
      throw error; // This will mark the job as failed
    }
  },
  {
    concurrency: 1, // Process one file at a time to avoid overwhelming the system
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    // Add job retry configuration
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  }
);

// Enhanced event handlers
worker.on('completed', (job, result) => {
  console.log(`🎉 Job ${job.id} completed successfully:`, result);
});

worker.on('failed', (job, err) => {
  console.error(`💥 Job ${job.id} failed:`, err.message);
  console.error('Job data:', job?.data);
});

worker.on('progress', (job, progress) => {
  console.log(`📊 Job ${job.id} progress: ${progress}%`);
});

worker.on('stalled', (jobId) => {
  console.warn(`⏰ Job ${jobId} stalled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, closing worker gracefully...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, closing worker gracefully...');
  await worker.close();
  process.exit(0);
});

console.log('🔄 Worker started and waiting for jobs...');