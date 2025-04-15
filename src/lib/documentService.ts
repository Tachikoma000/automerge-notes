import repo, { NoteDoc, FolderDoc } from '../repo';
import { AutomergeUrl } from '@automerge/automerge-repo';
import { aiSettings } from './ai/aiSettings';
import { indexingService } from './ai/indexingService';

// Local storage keys
const STORAGE_KEYS = {
  USER_ID: 'userId',
  DOCUMENT_IDS: 'document-ids',
  FOLDER_IDS: 'folder-ids',
  LAST_DOCUMENT: 'last-document'
};

// Generate a user ID if not already set
export function getUserId(): string {
  const savedUserId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (savedUserId) return savedUserId;
  
  const newUserId = `user-${Math.floor(Math.random() * 10000)}`;
  localStorage.setItem(STORAGE_KEYS.USER_ID, newUserId);
  return newUserId;
}

// Document Operations
export async function createDocument(title: string = 'Untitled Document', folderId?: string): Promise<string> {
  const handle = repo.create<NoteDoc>();
  
  handle.change(doc => {
    doc.text = '';
    doc.title = title;
    doc.createdAt = Date.now();
    doc.updatedAt = Date.now();
    doc.comments = [];
    if (folderId) doc.folderId = folderId;
  });
  
  const docUrl = handle.url;
  addDocumentToStorage(docUrl);
  
  // Index document if indexing is enabled and set to onSave
  const settings = aiSettings.getSettings();
  if (settings.indexing.enabled && settings.indexing.frequency === 'onSave') {
    indexingService.indexDocument(docUrl);
  }
  
  return docUrl;
}

export function getDocument(docUrl: string) {
  try {
    return repo.find<NoteDoc>(docUrl as AutomergeUrl);
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
}

export async function getAllDocuments() {
  const docUrls = getDocumentUrlsFromStorage();
  const documents = await Promise.all(
    docUrls.map(async (url) => {
      const handle = repo.find<NoteDoc>(url as AutomergeUrl);
      try {
        const doc = await handle.doc();
        return { id: url, doc };
      } catch (error) {
        console.error('Error loading document:', error);
        return { id: url, doc: null };
      }
    })
  );
  
  // Filter out any null documents (might happen if a document was deleted or corrupted)
  return documents.filter(item => item.doc !== null);
}

export async function getDocumentsInFolder(folderId: string | undefined) {
  const docs = await getAllDocuments();
  
  if (folderId === undefined) {
    // Return documents that don't have a folderId
    return docs.filter(item => !item.doc?.folderId);
  }
  
  // Return documents that have the specified folderId
  return docs.filter(item => item.doc?.folderId === folderId);
}

export function updateDocument(docUrl: string, updates: Partial<NoteDoc>): void {
  const handle = repo.find<NoteDoc>(docUrl as AutomergeUrl);
  
  handle.change(doc => {
    // Update each field if it exists in the updates object
    if (updates.title !== undefined) doc.title = updates.title;
    if (updates.text !== undefined) doc.text = updates.text;
    if (updates.folderId !== undefined) doc.folderId = updates.folderId;
    
    // Always update the updatedAt timestamp
    doc.updatedAt = Date.now();
  });
  
  // Index document if content changed and indexing is enabled and set to onSave
  if (updates.text !== undefined) {
    const settings = aiSettings.getSettings();
    if (settings.indexing.enabled && settings.indexing.frequency === 'onSave') {
      indexingService.indexDocument(docUrl);
    }
  }
}

export async function deleteDocument(docUrl: string): Promise<boolean> {
  try {
    // Remove from local storage
    removeDocumentFromStorage(docUrl);
    
    // If document is in a folder, we should check if we need to update any folder stats
    const handle = getDocument(docUrl);
    if (handle) {
      const doc = await handle.doc();
      // We could potentially handle folder document counts here if we implement that feature
    }
    
    // Note: Automerge doesn't have a direct way to delete documents from the repo
    // The document will still exist in the repo but won't be referenced in our app anymore
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

// Folder Operations
export async function createFolder(name: string = 'New Folder', parentId?: string): Promise<string> {
  const handle = repo.create<FolderDoc>();
  
  handle.change(doc => {
    doc.name = name;
    doc.createdAt = Date.now();
    doc.updatedAt = Date.now();
    if (parentId) doc.parentId = parentId;
  });
  
  const folderUrl = handle.url;
  addFolderToStorage(folderUrl);
  return folderUrl;
}

export function getFolder(folderUrl: string) {
  try {
    return repo.find<FolderDoc>(folderUrl as AutomergeUrl);
  } catch (error) {
    console.error('Error getting folder:', error);
    return null;
  }
}

export async function getAllFolders() {
  const folderUrls = getFolderUrlsFromStorage();
  const folders = await Promise.all(
    folderUrls.map(async (url) => {
      const handle = repo.find<FolderDoc>(url as AutomergeUrl);
      try {
        const doc = await handle.doc();
        return { id: url, doc };
      } catch (error) {
        console.error('Error loading folder:', error);
        return { id: url, doc: null };
      }
    })
  );
  
  // Filter out any null folders
  return folders.filter(item => item.doc !== null);
}

export async function getTopLevelFolders() {
  const folders = await getAllFolders();
  
  // Return folders that don't have a parentId
  return folders.filter(item => !item.doc?.parentId);
}

export async function getSubFolders(parentId: string) {
  const folders = await getAllFolders();
  
  // Return folders that have the specified parentId
  return folders.filter(item => item.doc?.parentId === parentId);
}

export function updateFolder(folderUrl: string, updates: Partial<FolderDoc>): void {
  const handle = repo.find<FolderDoc>(folderUrl as AutomergeUrl);
  
  handle.change(doc => {
    // Update each field if it exists in the updates object
    if (updates.name !== undefined) doc.name = updates.name;
    if (updates.parentId !== undefined) doc.parentId = updates.parentId;
    
    // Always update the updatedAt timestamp
    doc.updatedAt = Date.now();
  });
}

export async function deleteFolder(folderUrl: string): Promise<boolean> {
  try {
    // First, get all documents in this folder
    const docs = await getDocumentsInFolder(folderUrl);
    
    // Update documents to remove them from the folder (instead of deleting them)
    for (const doc of docs) {
      const handle = getDocument(doc.id);
      if (handle) {
        handle.change(docData => {
          delete docData.folderId;
          docData.updatedAt = Date.now();
        });
      }
    }
    
    // Get all subfolders of this folder
    const allFolders = await getAllFolders();
    const subfolders = allFolders.filter(folder => folder.doc?.parentId === folderUrl);
    
    // Recursively delete all subfolders
    for (const subfolder of subfolders) {
      await deleteFolder(subfolder.id);
    }
    
    // Remove from local storage
    removeFolderFromStorage(folderUrl);
    
    // Note: Automerge doesn't have a direct way to delete folders from the repo
    // The folder will still exist in the repo but won't be referenced in our app anymore
    return true;
  } catch (error) {
    console.error('Error deleting folder:', error);
    return false;
  }
}

// User Activity
export async function getRecentDocuments(limit: number = 4) {
  const docs = await getAllDocuments();
  
  // Sort by updatedAt in descending order and limit the result
  return docs
    .sort((a, b) => {
      const aTime = a.doc?.updatedAt || 0;
      const bTime = b.doc?.updatedAt || 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

// Local Storage Helpers
function getDocumentUrlsFromStorage(): string[] {
  const storedIds = localStorage.getItem(STORAGE_KEYS.DOCUMENT_IDS);
  return storedIds ? JSON.parse(storedIds) : [];
}

function getFolderUrlsFromStorage(): string[] {
  const storedIds = localStorage.getItem(STORAGE_KEYS.FOLDER_IDS);
  return storedIds ? JSON.parse(storedIds) : [];
}

function addDocumentToStorage(docUrl: string): void {
  const docIds = getDocumentUrlsFromStorage();
  if (!docIds.includes(docUrl)) {
    docIds.push(docUrl);
    localStorage.setItem(STORAGE_KEYS.DOCUMENT_IDS, JSON.stringify(docIds));
  }
}

function removeDocumentFromStorage(docUrl: string): void {
  const docIds = getDocumentUrlsFromStorage();
  const updatedIds = docIds.filter(id => id !== docUrl);
  localStorage.setItem(STORAGE_KEYS.DOCUMENT_IDS, JSON.stringify(updatedIds));
}

function addFolderToStorage(folderUrl: string): void {
  const folderIds = getFolderUrlsFromStorage();
  if (!folderIds.includes(folderUrl)) {
    folderIds.push(folderUrl);
    localStorage.setItem(STORAGE_KEYS.FOLDER_IDS, JSON.stringify(folderIds));
  }
}

function removeFolderFromStorage(folderUrl: string): void {
  const folderIds = getFolderUrlsFromStorage();
  const updatedIds = folderIds.filter(id => id !== folderUrl);
  localStorage.setItem(STORAGE_KEYS.FOLDER_IDS, JSON.stringify(updatedIds));
}

// First-time setup
export async function isFirstTimeUser(): Promise<boolean> {
  const docIds = getDocumentUrlsFromStorage();
  const folderIds = getFolderUrlsFromStorage();
  return docIds.length === 0 && folderIds.length === 0;
}

export async function setUpDemoContent(): Promise<void> {
  // Create a few initial folders
  const workFolderId = await createFolder('Work Documents');
  const personalFolderId = await createFolder('Personal Notes');
  
  // Create a few sample documents
  await createDocument('Getting Started with MarkFlow', undefined);
  await createDocument('Project Ideas', workFolderId);
  await createDocument('Meeting Notes', workFolderId);
  await createDocument('Personal Journal', personalFolderId);
}
