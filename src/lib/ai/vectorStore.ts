import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define database schema
interface VectorDBSchema extends DBSchema {
  documents: {
    key: string; // documentId
    value: {
      title: string;
      updatedAt: number;
      chunkCount: number;
    }
  };
  
  chunks: {
    key: string; // chunkId (documentId + index)
    value: {
      documentId: string;
      text: string;
      embedding: number[];
      metadata: {
        position: number;
        wordCount: number;
      }
    },
    indexes: {
      'by_document': string; // documentId
    }
  };
}

// Vector Store class
export class VectorStore {
  private db: IDBPDatabase<VectorDBSchema> | null = null;
  private dbName = 'markflow-vector-store';
  private dbVersion = 1;
  
  // Initialize database
  async init(): Promise<void> {
    if (this.db) return;
    
    try {
      this.db = await openDB<VectorDBSchema>(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Create document store
          if (!db.objectStoreNames.contains('documents')) {
            db.createObjectStore('documents');
          }
          
          // Create chunks store with index
          if (!db.objectStoreNames.contains('chunks')) {
            const chunkStore = db.createObjectStore('chunks');
            chunkStore.createIndex('by_document', 'documentId');
          }
        }
      });
      console.log('Vector store database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize vector store database:', error);
      // Set a flag to indicate initialization failed but allow the app to continue
      this.db = null;
    }
  }
  
  // Store document metadata
  async storeDocument(documentId: string, title: string): Promise<void> {
    await this.init();
    if (!this.db) {
      console.warn('Skipping document storage - database not available');
      return;
    }
    
    await this.db.put('documents', {
      title,
      updatedAt: Date.now(),
      chunkCount: 0
    }, documentId);
  }
  
  // Store document chunks with embeddings
  async storeChunks(documentId: string, chunks: Array<{
    text: string,
    embedding: number[],
    position: number,
    wordCount: number
  }>): Promise<void> {
    await this.init();
    if (!this.db) {
      console.warn('Skipping chunk storage - database not available');
      return;
    }
    
    // Store document if it doesn't exist
    const doc = await this.db.get('documents', documentId);
    if (!doc) {
      await this.storeDocument(documentId, 'Untitled');
    }
    
    // Delete existing chunks for this document
    const existingChunkKeys = await this.db.getAllKeysFromIndex('chunks', 'by_document', documentId);
    const tx = this.db.transaction('chunks', 'readwrite');
    for (const chunkKey of existingChunkKeys) {
      await tx.store.delete(chunkKey);
    }
    await tx.done;
    
    // Store new chunks
    const chunkTx = this.db.transaction('chunks', 'readwrite');
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = `${documentId}-${i}`;
      
      await chunkTx.store.put({
        documentId,
        text: chunk.text,
        embedding: chunk.embedding,
        metadata: {
          position: chunk.position,
          wordCount: chunk.wordCount
        }
      }, chunkId);
    }
    await chunkTx.done;
    
    // Update document metadata
    await this.db.put('documents', {
      ...(doc || { title: 'Untitled' }),
      updatedAt: Date.now(),
      chunkCount: chunks.length
    }, documentId);
  }
  
  // Find similar documents using cosine similarity
  async findSimilar(
    queryEmbedding: number[],
    limit: number = 5,
    threshold: number = 0.75
  ): Promise<Array<{
    documentId: string,
    chunkId: string,
    text: string,
    score: number
  }>> {
    await this.init();
    if (!this.db) {
      console.warn('Cannot search vectors - database not available');
      return [];
    }
    
    // Validate query embedding
    if (!queryEmbedding || !Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
      console.warn('Invalid query embedding provided');
      return [];
    }
    
    // Get all chunks
    const allChunks = await this.db.getAll('chunks');
    
    // Calculate similarity scores
    const allChunkKeys = await this.db.getAllKeys('chunks');
    const results = await Promise.all(allChunks.map(async (chunk, index) => {
      const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        documentId: chunk.documentId,
        chunkId: allChunkKeys[index] as string,
        text: chunk.text,
        score
      };
    }));
    
    // Filter by threshold and sort by score
    return results
      .filter(result => result.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }
  
  // Get all documents
  async getAllDocuments(): Promise<Array<{
    id: string;
    title: string;
    updatedAt: number;
    chunkCount: number;
  }>> {
    await this.init();
    if (!this.db) {
      console.warn('Cannot get documents - database not available');
      return [];
    }
    
    const docs = await this.db.getAll('documents');
    const keys = await this.db.getAllKeys('documents');
    
    return docs.map((doc, index) => ({
      id: keys[index] as string,
      title: doc.title,
      updatedAt: doc.updatedAt,
      chunkCount: doc.chunkCount
    }));
  }
  
  // Delete document and its chunks
  async deleteDocument(documentId: string): Promise<void> {
    await this.init();
    if (!this.db) {
      console.warn('Cannot delete document - database not available');
      return;
    }
    
    // Delete document
    await this.db.delete('documents', documentId);
    
    // Delete all chunks for this document
    const existingChunkKeys = await this.db.getAllKeysFromIndex('chunks', 'by_document', documentId);
    const tx = this.db.transaction('chunks', 'readwrite');
    for (const chunkKey of existingChunkKeys) {
      await tx.store.delete(chunkKey);
    }
    await tx.done;
  }
}

export const vectorStore = new VectorStore();
