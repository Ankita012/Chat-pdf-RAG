import express from 'express'
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import { Queue } from 'bullmq';
import { QdrantVectorStore } from "@langchain/qdrant";
import dotenv from 'dotenv';
import { Ollama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";

dotenv.config();

const llm = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "llama3.2",
});

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize job queue
const queue = new Queue("file-upload-queue", {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const safeFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${safeFilename}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  return res.json({
    status: 'PDF Chat Server Running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Enhanced PDF upload endpoint
app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log('📄 File uploaded:', req.file.originalname);

    // Add job to queue for processing
    const job = await queue.add(
      'file-ready',
      JSON.stringify({
        filename: req.file.originalname,
        destination: req.file.destination,
        path: req.file.path,
        size: req.file.size,
        uploadTime: new Date().toISOString()
      }),
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10, // Keep last 10 completed jobs
        removeOnFail: 5, // Keep last 5 failed jobs
      }
    );

    return res.json({
      message: 'PDF uploaded successfully and queued for processing',
      file: req.file.originalname,
      jobId: job.id,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      details: error.message
    });
  }
});

// Get job status endpoint
app.get('/job/:jobId', async (req, res) => {
  try {
    const job = await queue.getJob(req.params.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    return res.json({
      id: job.id,
      state: state,
      progress: job.progress,
      data: job.data,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason
    });

  } catch (error) {
    console.error('Error getting job status:', error);
    return res.status(500).json({ error: 'Failed to get job status' });
  }
});

// Enhanced chat endpoint with better RAG implementation
app.get('/chat', async (req, res) => {
  try {
    const userQuery = req.query.message;
    if (!userQuery || typeof userQuery !== 'string') {
      return res.status(400).json({
        error: 'Message query parameter is required and must be a string'
      });
    }

    console.log('💬 Received query:', userQuery);

    // Initialize embeddings (same model as worker)
    const embeddings = new OllamaEmbeddings({
      model: "nomic-embed-text",
    });

    console.log('🔗 Connecting to vector store...');
    let vectorStore;
    try {
      vectorStore = await QdrantVectorStore.fromExistingCollection(
        embeddings, {
          url: process.env.QDRANT_URL || 'http://localhost:6333',
          collectionName: "pdf-chat-collection",
        }
      );
    } catch (error) {
      return res.status(404).json({
        error: 'No documents found. Please upload a PDF first.',
        details: error.message
      });
    }

    console.log('🔍 Performing similarity search...');
    // Perform similarity search to find relevant documents
    const relevantDocs = await vectorStore.similaritySearch(userQuery, 3);

    if (relevantDocs.length === 0) {
      return res.json({
        response: "I couldn't find any relevant information in the uploaded documents to answer your question.",
        sources: []
      });
    }

    // Prepare context from relevant documents
    const context = relevantDocs.map((doc, index) => 
      `Document ${index + 1} (${doc.metadata.filename}): ${doc.pageContent}`
    ).join('\n\n');

    // Create a more structured prompt
    const prompt = `Based on the following context from uploaded PDF documents, answer the user's question. If the answer cannot be found in the context, say so clearly.

Context:
${context}

Question: ${userQuery}

Answer:`;

    console.log('🤖 Generating response...');
    // Generate response using LLM
    const response = await llm.call(prompt);

    // Extract sources information
    const sources = relevantDocs.map(doc => ({
      filename: doc.metadata.filename,
      page: doc.metadata.loc?.pageNumber || 'Unknown',
      content: doc.pageContent.substring(0, 200) + '...'
    }));

    return res.json({
      response: response.trim(),
      sources: sources,
      query: userQuery
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    return res.status(500).json({
      error: 'Failed to process chat request',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
