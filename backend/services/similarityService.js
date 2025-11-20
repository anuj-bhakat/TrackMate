import axios from "axios";
import { createHash } from "crypto";

// Get file buffer from URL
export async function getFileBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
}

// Compute SHA256 hash
export function getHash(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

// Compare hashes
export function isExactMatch(hash1, hash2) {
  return hash1 === hash2;
}

// Check similarity of target file with other files
export async function checkFileSimilarity(targetUrl, otherUrls) {
  const targetBuffer = await getFileBuffer(targetUrl);
  const targetHash = getHash(targetBuffer);

  const similarFiles = [];

  for (const url of otherUrls) {
    const buffer = await getFileBuffer(url);
    const hash = getHash(buffer);

    if (isExactMatch(targetHash, hash)) {
      similarFiles.push(url);
    }
  }

  return similarFiles;
}
