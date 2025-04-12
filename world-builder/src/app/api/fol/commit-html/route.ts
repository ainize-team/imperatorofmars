import { NextRequest, NextResponse } from "next/server";
import { GitHubService } from "@/lib/llm/github.service";
import { AnthropicService } from "@/lib/llm/anthropic.service";

/**
 * Extracts the "hash:" value from the file content (its own hash)
 */
function parseFileHash(content: string): string | null {
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.trim().match(/^hash:\s*(\S+)/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Extracts the "parent_hash:" value from the file content
 */
function parseParentHash(content: string): string | null {
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.trim().match(/^parent_hash:\s*(\S+)/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Extracts the branch name from the request
    const { branch } = await request.json();
    if (!branch) {
      return NextResponse.json({ error: "branch is required." }, { status: 400 });
    }
    if (["main", "master", "dev", "develop"].includes(branch)) {
      return NextResponse.json({ error: `${branch} branch cannot be used.` }, { status: 400 });
    }

    const githubService = new GitHubService();
    const anthropicService = new AnthropicService();

    // 2. Uses the given branch directly to create or get the branch
    const baseSha = await githubService.getMainBranchSha();
    await githubService.createOrGetBranch(branch, baseSha);
    // 3. Retrieves all FOL files within the "fol" folder of the given branch (complete list)
    const allFolFiles = await githubService.getFolderFiles("fol", branch);
    // Filters out only valid chain files (filename format: {id}_{title}.fol, id is a "number" or "number-number-number" etc)
    const chainFiles = allFolFiles.filter((file) => {
      const fileName = file.path.split("/").pop() || "";
      return /^(\d+(?:-\d+)*)_([^_]+)\.fol$/.test(fileName);
    });
    if (chainFiles.length === 0) {
      return NextResponse.json(
        { error: "No FOL files corresponding to the chain exist." },
        { status: 400 },
      );
    }
    // 4. Retrieves the list of files changed in the latest commit (using GitHub API)
    const changedFiles = await githubService.getLatestCommitChangedFiles(branch);
    // Selects only files that start with "fol/" and end with .fol from the changed files
    const changedFolFiles = changedFiles.filter(
      (fname) => fname.startsWith("fol/") && fname.endsWith(".fol"),
    );
    if (changedFolFiles.length === 0) {
      return NextResponse.json(
        { error: "No FOL file changes in the latest commit." },
        { status: 400 },
      );
    }
    // Uses the first changed FOL file as the tipFile
    const tipFilePath = changedFolFiles[0];
    const tipFile = chainFiles.find((file) => file.path === tipFilePath);
    if (!tipFile) {
      return NextResponse.json(
        { error: "Could not find the latest commit's FOL file in the chain." },
        { status: 400 },
      );
    }

    // 5. Tracks the parent chain up to genesis (starting from tipFile)
    const chain = []; // Stores in the order of Genesis to tip
    let currentFile = tipFile;

    // Maps chain files by their "hash:" (their own hash) for fast lookup
    const fileMap: { [key: string]: { path: string; content: string } } = {};
    for (const file of chainFiles) {
      const ownHash = parseFileHash(file.content);
      if (ownHash) {
        fileMap[ownHash] = file;
      }
    }
    console.log("fileMap", Object.keys(fileMap));
    // Chain tracking: reads the "parent_hash:" value from the current file's content to find the parent file
    while (currentFile) {
      console.log("currentFile", currentFile.path);
      chain.unshift(currentFile); // unshift to get the order of Genesis to tip
      const parentHash = parseParentHash(currentFile.content);
      console.log("parentHash", parentHash);
      if (!parentHash) break;
      const parentFile = fileMap[parentHash];
      if (!parentFile) break;
      currentFile = parentFile;
    }
    console.log("chain", chain);
    // 6. Creates an array of sorted FOL file names (e.g., ["0_genesis.fol", "1_auto.fol", ...])
    const sortedFolFiles = chain.map((file) => file.path.split("/").pop());
    // Array of HTML file names in the docs folder (same order, extension changed to .html)
    const sortedDocFiles = chain
      .map((file) => file.path.split("/").pop())
      .filter((f): f is string => f !== undefined)
      .map((f) => f.replace(/\.fol$/, ".html"))
      .slice(0, -1);
    console.log("sortedDocFiles", sortedDocFiles);
    // 7. Retrieves the actual content of the HTML files in the docs folder
    const docContents = await Promise.all(
      sortedDocFiles.map(async (docFile) => {
        const docFilePath = `docs/${docFile}`;
        const docContent = await githubService.getFileContent(docFilePath, branch);
        return docContent;
      }),
    );

    const folContents = chain.map((file) => file.content);
    const htmlStory = await anthropicService.generateHtmlStory(
      folContents,
      docContents,
      sortedDocFiles,
    );

    // 8. Creates a report file in the docs folder: same name as the tip file (extension changed to .html)
    const tipHtmlFileName =
      tipFilePath
        .split("/")
        .pop()
        ?.replace(/\.fol$/, ".html") || "";
    const htmlFilePath = `docs/${tipHtmlFileName}`;

    //docContents 와 sortedDocFiles 의 마지막 인덱스를 가져와서 안트로픽서비스 어펜트 next 버튼 메소드에 너허줘
    const lastDocContent = docContents[docContents.length - 1];
    const lastDocFile = sortedDocFiles[sortedDocFiles.length - 1];
    const appendedPrevHtml = await anthropicService.appendNextButton(
      lastDocContent,
      tipHtmlFileName,
    );

    // 이전 HTML 파일 업데이트
    const prevHtmlFilePath = `docs/${lastDocFile}`;
    const prevFileSha = await githubService.getFileSha(prevHtmlFilePath, branch);
    await githubService.createOrUpdateFile(
      prevHtmlFilePath,
      appendedPrevHtml,
      branch,
      prevFileSha || undefined,
    );

    const existingFileSha = await githubService.getFileSha(htmlFilePath, branch);
    await githubService.createOrUpdateFile(
      htmlFilePath,
      htmlStory,
      branch,
      existingFileSha || undefined,
    );

    // 9. Includes chain information in the final response
    const result = {
      message: "HTML files committed successfully.",
      htmlFile: htmlFilePath,
      folChain: sortedFolFiles, // e.g., ["0_genesis.fol", "1_auto.fol", ...]
      docsChain: sortedDocFiles, // e.g., ["0_genesis.html", "1_auto.html", ...]
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error committing HTML files:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
