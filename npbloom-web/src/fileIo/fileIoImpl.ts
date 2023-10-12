/**
 * IndexedDB-based simulation of file I/O.
 */

import { ContentState, contentStateFromFileContents, contentStateToFileContents } from 'npbloom-core';

const DB_NAME = 'NPBloomFiles';
const DB_VERSION = 1;

/**
 * The "metadata" database will contain entries of this form.
 * These will be listed as a table in the file I/O modal.
 */
export interface FileWithMetadata {
  name: string;
  size: number;
  type: 'forest';
  modifiedTime: Date;
}

/**
 * The "content" database will contain entries of this form. Each entry contains plot and tree data.
 * These will be called up individually by name.
 */
export interface FileWithBody {
  name: string;
  body: Int8Array;
}

const FILE_METADATA_STORE_NAME = 'fileMetadata';
const FILE_CONTENT_STORE_NAME = 'fileContent';
const FILE_STORE_KEY = 'name';
const FILE_STORE_INDEX_NAME = 'filenames';

/**
 * Creates the necessary stores for storing the files in the browser's IndexedDB.
 */
const createFileStores = (db: IDBDatabase) => {
  const fileMetadataStore = db.createObjectStore(FILE_METADATA_STORE_NAME, { keyPath: FILE_STORE_KEY });
  fileMetadataStore.createIndex(FILE_STORE_INDEX_NAME, FILE_STORE_KEY, { unique: true });
  const fileContentStore = db.createObjectStore(FILE_CONTENT_STORE_NAME, { keyPath: FILE_STORE_KEY });
  fileContentStore.createIndex(FILE_STORE_INDEX_NAME, FILE_STORE_KEY, { unique: true });
};

/**
 * Returns a promise resolving to the IndexedDB, creating it in the process if it does not exist.
 */
export const openFileDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const openRequest = indexedDB.open(DB_NAME, DB_VERSION);
  openRequest.onsuccess = () => resolve(openRequest.result);
  openRequest.onupgradeneeded = () => createFileStores(openRequest.result);
  openRequest.onerror = () => reject(openRequest.error);
});

/**
 * Returns a promise resolving to a list of files stored in the IndexedDB with their metadata.
 */
export const getFileMetadataList = (db: IDBDatabase): Promise<FileWithMetadata[]> =>
  new Promise((resolve, reject) => {
    const fileListRequest = db.transaction(FILE_METADATA_STORE_NAME)
      .objectStore(FILE_METADATA_STORE_NAME)
      .getAll();
    fileListRequest.onsuccess = event => resolve((event.currentTarget as IDBRequest<FileWithMetadata[]>).result);
    fileListRequest.onerror = () => reject(fileListRequest.error);
  });

const saveFileRaw = (
  db: IDBDatabase,
  rawContents: Int8Array,
  fileName: string,
  modifiedTime: Date = new Date(),
): Promise<[void, void]> => {
  const transaction = db.transaction([FILE_METADATA_STORE_NAME, FILE_CONTENT_STORE_NAME], 'readwrite');

  const addContentPromise = new Promise<void>((resolve, reject) => {
    const addContentRequest = transaction.objectStore(FILE_CONTENT_STORE_NAME)
      .put({ name: fileName, body: rawContents } as FileWithBody);
    addContentRequest.onsuccess = () => resolve();
    addContentRequest.onerror = () => reject(addContentRequest.error);
  });

  const addMetadataPromise = new Promise<void>((resolve, reject) => {
    const addMetadataRequest = transaction.objectStore(FILE_METADATA_STORE_NAME)
      .put({ name: fileName, size: rawContents.byteLength, type: 'forest', modifiedTime } as FileWithMetadata);
    addMetadataRequest.onsuccess = () => resolve();
    addMetadataRequest.onerror = () => reject(addMetadataRequest.error);
  });

  return Promise.all([addContentPromise, addMetadataPromise]);
};

const loadFileRaw = (db: IDBDatabase, fileName: string): Promise<Int8Array> =>
  new Promise((resolve, reject) => {
    const getContentRequest = db.transaction([FILE_CONTENT_STORE_NAME], 'readwrite')
      .objectStore(FILE_CONTENT_STORE_NAME)
      .get(fileName);
    getContentRequest.onsuccess = () => resolve((getContentRequest.result as FileWithBody).body);
    getContentRequest.onerror = () => reject(getContentRequest.error);
  });

/**
 * Saves the content state to a file in the IndexedDB under the given name.
 */
export const saveContentStateToFile = (
  db: IDBDatabase,
  contentState: ContentState,
  fileName: string,
  modifiedTime: Date = new Date(),
): Promise<[void, void]> =>
  saveFileRaw(db, contentStateToFileContents(contentState), fileName, modifiedTime);

/**
 * Retrieves the content of a file stored in the IndexedDB by name,
 * and returns a promise resolving to the reconstructed ContentState object.
 */
export const loadContentStateFromFile = (db: IDBDatabase, fileName: string): Promise<ContentState> =>
  loadFileRaw(db, fileName).then(contentStateFromFileContents);

export const renameFile = (db: IDBDatabase, oldFileName: string, newFileName: string): Promise<[void, void]> =>
  loadFileRaw(db, oldFileName)
    .then(rawContents => saveFileRaw(db, rawContents, newFileName))
    .then(() => deleteFile(db, oldFileName));

export const deleteFile = (db: IDBDatabase, fileName: string): Promise<[void, void]> => {
  const transaction = db.transaction([FILE_CONTENT_STORE_NAME, FILE_METADATA_STORE_NAME], 'readwrite');

  const deleteContentPromise = new Promise<void>((resolve, reject) => {
    const deleteContentRequest = transaction
      .objectStore(FILE_CONTENT_STORE_NAME)
      .delete(fileName);
    deleteContentRequest.onsuccess = () => resolve();
    deleteContentRequest.onerror = () => reject(deleteContentRequest.error);
  });

  const deleteMetadataPromise = new Promise<void>((resolve, reject) => {
    const deleteMetadataRequest = transaction
      .objectStore(FILE_METADATA_STORE_NAME)
      .delete(fileName);
    deleteMetadataRequest.onsuccess = () => resolve();
    deleteMetadataRequest.onerror = () => reject(deleteMetadataRequest.error);
  });

  return Promise.all([deleteContentPromise, deleteMetadataPromise]);
};
