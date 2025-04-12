/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHash } from "crypto";

export const generateCid = (content: any) => {
  const sha256 = createHash('sha256');
  if (content.message) {
      sha256.update(content.message);
  } 
  if (content.data) {
      sha256.update(content.data);
  }   
  if (content.children && content.children.length > 0) {
      content.children.forEach((cid: string) => sha256.update(cid));
  }
  return sha256.digest('hex');
}