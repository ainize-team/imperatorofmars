export async function readStreamAsText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result;
}

export function parseClaudeRawOutputToMessage(raw: string): string {
  const lines = raw.split(/\n|(?=\d+:|[a-z]:)/g);
  const messageParts: string[] = [];

  for (const line of lines) {
    const match = line.match(/^\d+:\s*"(.*)"$/);
    if (match) {
      messageParts.push(match[1]);
    }
  }

  return messageParts.join("").replace(/\s+/g, " ").trim();
}

export function extractRegistrationMetadata(text: string) {
  const keys = ["ip_metadata_uri", "ip_metadata_hash", "nft_metadata_uri", "nft_metadata_hash"];

  const cleaned = text.replace(/\\"/g, '"');
  const result: Record<string, string | null> = {};

  for (const key of keys) {
    const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`);
    const match = cleaned.match(regex);
    console.log(key, match);
    result[key] = match ? match[1] : null;
  }

  return result;
}