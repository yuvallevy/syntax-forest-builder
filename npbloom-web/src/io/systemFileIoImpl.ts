/**
 * This file contains the implementation of native file I/O functions, which are used to open and save files
 * using the system's native file picker dialogs.
 * If supported, these use the modern File System Access API, which allows for more seamless file access,
 * falling back to the traditional method of using file input elements and blob URLs if the API is not supported.
 *
 * Copyright 2024 Google LLC
 *
 * Portions of this file are modifications based on work created and shared by Thomas Steiner (@tomayac) under the
 * Apache License, Version 2.0 (found at https://www.apache.org/licenses/LICENSE-2.0).
 * The original work can be found at https://web.dev/patterns/files.
 *
 * Modifications made by Yuval Levy (@yuvallevy) 2024.
 */

const FOREST_EXTENSION = '.npbf';

type FilePickerType = { description: string; accept: Record<string, string[]> };

/**
 * Returns whether the file system API is supported in the current environment.
 */
const isFileSystemApiSupported = () => {
  // If the window doesn't have showOpenFilePicker or showSaveFilePicker, it's not supported
  if (!('showOpenFilePicker' in window) || !('showSaveFilePicker' in window)) return false;

  // If this is not the top window, for example in a frame, the file system API is not supported
  // In the case of a cross-origin iframe, the below check will throw a SecurityError, hence the try-catch block
  try {
    return window.self === window.top;
  } catch {
    return false;
  }
};

// Opens a file picker, writes the blob to the selected file, and returns the handle.
// Throws if the user cancels.
const saveWithPicker = async (blob: Blob, suggestedName: string, types: FilePickerType[]): Promise<FileSystemFileHandle> => {
  // @ts-ignore
  const handle: FileSystemFileHandle = await window.showSaveFilePicker({ types, suggestedName });
  // @ts-ignore
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
  return handle;
};

// Downloads a blob by creating a temporary <a> element with a blob URL.
const downloadViaAnchor = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.append(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 1000);
};

/**
 * Saves a blob using whichever file-saving method is available:
 * the File System Access API's save picker if supported, a fallback anchor-download otherwise.
 * Silently does nothing if the user cancels the picker.
 */
export const saveBlob = async (blob: Blob, filename: string, types: FilePickerType[]): Promise<void> => {
  if (isFileSystemApiSupported()) {
    await saveWithPicker(blob, filename, types).catch(() => {}); // user cancelled
  } else {
    downloadViaAnchor(blob, filename);
  }
};

/**
 * Opens a file picker dialog to select a file to open.
 * Once a file is selected, the function returns a promise that resolves to a tuple containing the file name
 * and the file's contents as a Uint8Array.
 */
const openFileNativeModern = async (): Promise<[string, Uint8Array]> => {
  // @ts-ignore
  const handles: FileSystemFileHandle[] = await window.showOpenFilePicker({
    types: [
      {
        description: 'NPBloom forest',
        accept: { 'application/octet-stream': [FOREST_EXTENSION] },
      },
    ],
  });
  const file = await handles[0].getFile();
  const arrayBuffer = await file.arrayBuffer();
  return [file.name, new Uint8Array(arrayBuffer)];
};

/**
 * Saves a file using a file picker dialog.
 * The function takes a Uint8Array containing the file's contents and an optional suggested name for the file.
 * Once the file is saved, the function returns a promise that resolves to the name of the saved file.
 */
const saveFileNativeModern = async (data: Uint8Array, suggestedName?: string): Promise<string> => {
  const filename = (suggestedName || 'forest') +
    (suggestedName && !suggestedName.endsWith(FOREST_EXTENSION) ? FOREST_EXTENSION : '');
  const blob = new Blob([data as unknown as BlobPart], { type: 'application/octet-stream' });
  const handle = await saveWithPicker(blob, filename, [
    { description: 'NPBloom forest', accept: { 'application/octet-stream': [FOREST_EXTENSION] } },
  ]);
  return handle.name.endsWith(FOREST_EXTENSION)
    ? handle.name.slice(0, -FOREST_EXTENSION.length) : handle.name;
};

/**
 * Opens a file picker dialog using a spontaneously-created file input element.
 * Once a file is selected, the function returns a promise that resolves to a tuple containing the file name
 * and the file's contents as a Uint8Array.
 */
const openFileNativeFallback = (): Promise<[string, Uint8Array]> =>
  new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.style.display = 'none';
    input.type = 'file';
    input.accept = FOREST_EXTENSION;
    input.addEventListener('change', async () => {
      input.remove();
      const file = input.files?.[0];
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        resolve([file.name, new Uint8Array(arrayBuffer)]);
      } else {
        reject(new Error('No file selected'));
      }
    });
    input.addEventListener('cancel', () => {
      input.remove();
      reject(new DOMException('File selection cancelled', 'AbortError'));
    });
    document.body.append(input);
    if ('showPicker' in HTMLInputElement.prototype) {
      input.showPicker();
    } else {
      input.click();
    }
  });

/**
 * Saves a file using a spontaneously-created anchor element leading to a blob URL.
 * The function takes a Uint8Array containing the file's contents and an optional suggested name for the file.
 * Once the file is saved, the function returns a promise that resolves to `undefined`,
 * in order to match the behavior of `saveFileNativeModern`.
 */
const saveFileNativeFallback = (data: Uint8Array, suggestedName?: string): Promise<undefined> => {
  const filename = (suggestedName || 'forest') +
    (!suggestedName || !suggestedName.endsWith(FOREST_EXTENSION) ? FOREST_EXTENSION : '');
  downloadViaAnchor(new Blob([data as unknown as BlobPart], { type: 'application/octet-stream' }), filename);
  // There's no way to know what name the file was saved as, so we resolve to undefined
  return Promise.resolve(undefined);
};

/**
 * Opens a file using the native file picker dialog, using whatever method is supported in the current environment.
 * The function returns a promise that resolves to a tuple containing the file name and the file's contents as a Uint8Array.
 */
export const openFileNative = isFileSystemApiSupported() ? openFileNativeModern : openFileNativeFallback;

/**
 * Saves a file using the native file picker dialog, using whatever method is supported in the current environment.
 * The function takes a Uint8Array containing the file's contents and an optional suggested name for the file.
 */
export const saveFileNative = isFileSystemApiSupported() ? saveFileNativeModern : saveFileNativeFallback;
