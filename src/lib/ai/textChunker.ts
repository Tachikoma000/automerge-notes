// Function to split text into semantic chunks
export function chunkDocument(
  text: string,
  options: {
    chunkSize?: number;
    overlap?: number;
  } = {}
): Array<{ text: string; position: number; wordCount: number }> {
  const { chunkSize = 1000, overlap = 200 } = options;
  
  // If text is empty, return empty array
  if (!text.trim()) {
    return [];
  }
  
  // Split by paragraphs first (most semantic approach)
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: Array<{ text: string; position: number; wordCount: number }> = [];
  
  let currentChunk = '';
  let currentPosition = 0;
  
  for (const paragraph of paragraphs) {
    // Skip empty paragraphs
    if (!paragraph.trim()) continue;
    
    // If adding this paragraph exceeds chunk size, finalize current chunk
    if (currentChunk && (currentChunk.length + paragraph.length > chunkSize)) {
      // Calculate word count
      const wordCount = currentChunk.split(/\s+/).filter(Boolean).length;
      
      // Add chunk
      chunks.push({
        text: currentChunk,
        position: currentPosition,
        wordCount
      });
      
      // Create overlap for next chunk
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(overlap / 5)); // Approx 5 chars per word
      currentChunk = overlapWords.join(' ');
      currentPosition = text.indexOf(currentChunk, currentPosition);
    }
    
    // Add paragraph to current chunk
    currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
  }
  
  // Add the last chunk if it has content
  if (currentChunk) {
    const wordCount = currentChunk.split(/\s+/).filter(Boolean).length;
    chunks.push({
      text: currentChunk,
      position: currentPosition,
      wordCount
    });
  }
  
  return chunks;
}
