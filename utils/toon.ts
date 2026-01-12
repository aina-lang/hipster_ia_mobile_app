import { encode, decode } from '@toon-format/toon';

/**
 * Encodes a JSON object into TOON format to save tokens in AI prompts.
 */
export const encodeToon = (data: any): string => {
  try {
    return encode(data);
  } catch (error) {
    console.error('[TOON] Encoding error:', error);
    return JSON.stringify(data); // Fallback to JSON if encoding fails
  }
};

/**
 * Decodes a TOON string back into a JSON object.
 */
export const decodeToon = (toon: string): any => {
  try {
    return decode(toon);
  } catch (error) {
    console.error('[TOON] Decoding error:', error);
    return null;
  }
};

/**
 * Checks if a string contains TOON formatted data.
 * TOON usually starts with a key followed by [N] or {fields}.
 */
export const containsToon = (text: string): boolean => {
  // Simple heuristic for TOON structure: key[N] or key{fields} or key[N]{fields}
  const toonRegex = /[a-zA-Z0-9_]+(\[\d+\])?(\{.*\})?:/;
  return toonRegex.test(text);
};

/**
 * Extracts TOON blocks from a text response.
 */
export const extractToonBlocks = (text: string): string[] => {
  // We look for patterns that look like TOON headers at the start of a line
  // and continue until an empty line or end of text.
  const blocks: string[] = [];
  const lines = text.split('\n');
  let currentBlock: string[] = [];
  let inBlock = false;

  for (const line of lines) {
    if (!inBlock && containsToon(line)) {
      inBlock = true;
      currentBlock.push(line);
    } else if (inBlock) {
      if (line.trim() === '' && currentBlock.length > 1) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
        inBlock = false;
      } else {
        currentBlock.push(line);
      }
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }

  return blocks;
};
