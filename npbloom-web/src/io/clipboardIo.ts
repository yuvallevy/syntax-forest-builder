import { treeFromFileContents, treeToFileContents, UnpositionedTree } from 'npbloom-core';

/**
 * Converts an Int8Array to a hex string. Negative bytes are represented as two's complement.
 * e.g. [0, 1, -1, -128, 127] -> '0001ff807f'
 */
const int8ArrayToHexString = (data: Int8Array) =>
  Array.from(data).map(byte => (byte < 0 ? (byte + 256) : byte).toString(16).padStart(2, '0')).join('');

/**
 * Splits a string into chunks of the given size.
 * e.g. chunked('abcdef', 2) -> ['ab', 'cd', 'ef']
 */
const chunked = (str: string, chunkSize: number) => {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Converts a hex string to an Int8Array. Two's complement is used for negative bytes.
 * e.g. '0001ff807f' -> [0, 1, -1, -128, 127]
 */
const hexStringToInt8Array = (hexString: string) => {
  const byteStrings = chunked(hexString, 2);
  if (!byteStrings) throw new Error('Invalid hex string');
  return new Int8Array(byteStrings.map(byteString => {
    const uint = parseInt(byteString, 16);
    return uint > 127 ? uint - 256 : uint;
  }));
}

/**
 * Copies the given Int8Array to the clipboard as a hex string.
 * If the browser supports the Clipboard API, it will be used. Otherwise, a textarea will be temporarily added to the
 * document to copy the text using the deprecated document.execCommand method.
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
const copyInt8ArrayToClipboard = async (data: Int8Array): Promise<void> => {
  const hexString = int8ArrayToHexString(data);
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(hexString);
  } else {
    await new Promise<void>((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '-100%';
      textarea.value = hexString;
      document.body.appendChild(textarea);
      textarea.select();
      // noinspection JSDeprecatedSymbols - execCommand is deprecated, but it's the only option on older browsers
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) {
        resolve();
      } else {
        reject(new Error('Failed to copy to clipboard'));
      }
    });
  }
};

/**
 * Copies the given tree to the clipboard as a hex string.
 */
export const copyTreeToClipboard = (tree: UnpositionedTree): Promise<void> =>
  copyInt8ArrayToClipboard(treeToFileContents(tree));

/**
 * Attempts to read the hex string from the clipboard as a tree and returns the tree if successful.
 */
export const extractTreeFromClipboardData = async (data: string): Promise<UnpositionedTree> =>
  treeFromFileContents(hexStringToInt8Array(data))
