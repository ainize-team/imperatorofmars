import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { GitHubService } from "@/lib/llm/github.service";
import { AnthropicService } from "@/lib/llm/anthropic.service";

// A function that extracts the "hash:" value from the file content (its own hash) (from the metadata)
function parseHash(content: string): string | null {
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.trim().match(/^hash:\s*(\S+)/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

// A function that extracts the identifier from the file name (file name format: {identifier}_{title}.fol)
// The identifier is a string of numbers connected by "-" (e.g., "0", "0-1", "0-1-2")
function extractIdentifier(fileName: string): string | null {
  const regex = /^([\d\-]+)_([^_]+)\.fol$/;
  const match = fileName.match(regex);
  if (match) {
    return match[1];
  }
  return null;
}
/**
 * A function that generates a new identifier based on the parent identifier and the set of existing identifiers.
 *
 * The default candidate is the last number of the parent identifier +1.
 * If that value already exists, a branch is applied to the parent identifier to return a unique identifier.
 *
 * Example:
 *  - If the parent is "3", the default candidate is "4"; if "4" exists, "3-1-1", "3-2-1", "3-3-1", ...
 *  - If the parent is "3-2-1", the default candidate is "3-2-2"; if "3-2-2" exists, "3-2-1-1", "3-2-1-2", ...
 */
function generateNewIdentifier(parentIdentifier: string, existingSet: Set<string>): string {
  // Split the parent identifier with "-" and extract the last number
  const parts = parentIdentifier.split("-");
  const lastNum = parseInt(parts[parts.length - 1], 10);

  // Default candidate: +1 to the last number of the parent identifier (if the parent is a single number, it remains the same, if it includes a hyphen, only the last number increases)
  let baseCandidate: string;
  if (parts.length === 1) {
    baseCandidate = (lastNum + 1).toString();
  } else {
    baseCandidate = parts.slice(0, parts.length - 1).join("-") + "-" + (lastNum + 1).toString();
  }

  // If the base candidate is not used, return it as it is
  if (!existingSet.has(baseCandidate)) {
    return baseCandidate;
  }

  // If the base candidate already exists, apply the branch logic
  let candidate: string;
  let branchSuffix = 1;
  if (parts.length === 1) {
    // If the parent identifier is a single number: candidate "parent-branch-1" example: "3" -> "3-1-1", "3-2-1", ...
    candidate = `${parentIdentifier}-${branchSuffix}-1`;
    while (existingSet.has(candidate)) {
      branchSuffix++;
      candidate = `${parentIdentifier}-${branchSuffix}-1`;
    }
  } else {
    // If the parent identifier already includes a hyphen: candidate "parentIdentifier-1" example: "3-2-1" -> "3-2-1-1", "3-2-1-2", ...
    candidate = `${parentIdentifier}-1`;
    while (existingSet.has(candidate)) {
      branchSuffix++;
      candidate = `${parentIdentifier}-${branchSuffix}`;
    }
  }
  return candidate;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Extract contents, parentHash, title, signature from the request
    const { contents, parentHash, title, signature } = await request.json();
    if (!contents || parentHash === undefined || !title || !signature) {
      return NextResponse.json(
        { error: "contents, parentHash, title, signature are required." },
        { status: 400 },
      );
    }

    const anthropicService = new AnthropicService();
    const shortenedTitle = await anthropicService.shortenTitle(title);

    // 2. Process the title: replace spaces with hyphens
    const processed_title = shortenedTitle.replace(/\s+/g, "-");
    const githubService = new GitHubService();

    const baseSha = await githubService.getMainBranchSha();

    // 3. Retrieve all FOL files in the fol folder of the main branch
    //    The file name format is {identifier}_{title}.fol
    const folFiles = await githubService.getFolderFiles("fol", "main");
    // Filter out valid node files (those that match the specified format)
    const nodeFiles = folFiles.filter((file) => {
      const fileName = file.path.split("/").pop() || "";
      return /^([\d\-]+)_([^_]+)\.fol$/.test(fileName);
    });
    if (nodeFiles.length === 0) {
      return NextResponse.json(
        { error: "No FOL file corresponding to the node exists." },
        { status: 400 },
      );
    }

    // 4. Search for the parent file
    // Compare the "hash:" value of each file to find the parent file that matches the requested parentHash
    let parentIdentifier = null;
    // identifierSet: set that collects existing identifiers
    const identifierSet: Set<string> = new Set();
    for (const file of nodeFiles) {
      const fileName = file.path.split("/").pop() || "";
      const id = extractIdentifier(fileName);
      if (id) {
        identifierSet.add(id);
      }
      // Read the "hash:" value of the file to find the parent file
      const fileHash = parseHash(file.content);
      if (fileHash === parentHash) {
        parentIdentifier = id;
      }
    }
    if (parentIdentifier === null || parentIdentifier === "") {
      return NextResponse.json(
        { error: "Could not find the parent file corresponding to the requested parentHash." },
        { status: 400 },
      );
    }

    // 5. Generate a new identifier: the last number of the parent identifier +1 (if it already exists, add a branch)
    const newIdentifier = generateNewIdentifier(parentIdentifier, identifierSet);

    // 6. Calculate the new file hash: when calculating the hash, exclude the metadata (hash: line), and use parentHash, signature, and actual contents
    const newFileHash = crypto
      .createHash("sha256")
      .update(parentHash + signature + contents)
      .digest("hex");

    // 7. The new file name is in the "{newIdentifier}_{title}.fol" format
    const name = `${newIdentifier}_${processed_title}`;
    const newFileName = `${name}.fol`;
    const newFilePath = `fol/${newFileName}`;

    // 8. Compose the new file content: add 3 lines of metadata at the top, followed by a blank line, and then the contents
    const newFileContent = `hash: ${newFileHash}
parent_hash: ${parentHash}
signature: ${signature}

${contents}`;

    // 9. Create a new branch in the "node/<name>" format
    const newBranch = `node/${newFileHash}`;
    await githubService.createOrGetBranch(newBranch, baseSha);

    // 10. Create a new FOL file in the branch (update if it already exists)
    const fileSha = await githubService.getFileSha(newFilePath, newBranch);
    await githubService.createOrUpdateFile(
      newFilePath,
      newFileContent,
      newBranch,
      fileSha || undefined,
    );

    // 11. Create a PR targeting the main branch (from the newBranch to the main branch)
    const { data: pullRequest } = await githubService.createPullRequest(
      `World Builder: ${name}`,
      newBranch,
      `A majestic creation from World Builder: the \`${newFilePath}\` has been added to the realm.`,
    );

    return NextResponse.json({
      message: "PR creation successful",
      pullRequestLink: pullRequest.html_url,
      hash: newFileHash,
    });
  } catch (error) {
    console.error("Error in create-file API:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
