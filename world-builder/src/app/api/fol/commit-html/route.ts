// app/api/fol/commit-html/route.js
import { NextRequest, NextResponse } from "next/server";
import { GitHubService } from "@/lib/llm/github.service";
import { AnthropicService } from "@/lib/llm/anthropic.service";

/**
 * 파일 내용에서 "hash:" 값을 추출하는 함수 (파일 자신의 해시)
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
 * 파일 내용에서 "parenthash:" 값을 추출하는 함수
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
    // 1. 요청에서 branch 이름만 추출
    const { branch } = await request.json();
    if (!branch) {
      return NextResponse.json({ error: "branch가 필요합니다." }, { status: 400 });
    }
    if (["main", "master", "dev", "develop"].includes(branch)) {
      return NextResponse.json(
        { error: `${branch} 브랜치는 사용할 수 없습니다.` },
        { status: 400 },
      );
    }

    const githubService = new GitHubService();
    const anthropicService = new AnthropicService();

    // 2. 주어진 branch를 그대로 사용하여 브랜치 생성/획득
    const baseSha = await githubService.getMainBranchSha();
    await githubService.createOrGetBranch(branch, baseSha);
    // 3. 해당 branch의 "fol" 폴더 내 모든 FOL 파일들을 가져옴 (전체 목록)
    const allFolFiles = await githubService.getFolderFiles("fol", branch);
    // 유효한 체인 파일만 필터 (파일명 형식: {id}_{title}.fol, id는 "숫자" 또는 "숫자-숫자-숫자" 등)
    const chainFiles = allFolFiles.filter((file) => {
      const fileName = file.path.split("/").pop() || "";
      return /^(\d+(?:-\d+)*)_([^_]+)\.fol$/.test(fileName);
    });
    if (chainFiles.length === 0) {
      return NextResponse.json({ error: "체인에 해당하는 FOL 파일이 없습니다." }, { status: 400 });
    }
    // 4. 최신 커밋에서 변경된 파일 목록을 조회 (GitHub API 사용)
    const changedFiles = await githubService.getLatestCommitChangedFiles(branch);
    // 변경된 파일 중 "fol/"로 시작하고 .fol로 끝나는 파일만 선택
    const changedFolFiles = changedFiles.filter(
      (fname) => fname.startsWith("fol/") && fname.endsWith(".fol"),
    );
    if (changedFolFiles.length === 0) {
      return NextResponse.json(
        { error: "최신 커밋에 FOL 파일 변경 사항이 없습니다." },
        { status: 400 },
      );
    }
    // 최신 커밋에서 변경된 FOL 파일 중 첫 번째 파일을 tipFile로 사용
    const tipFilePath = changedFolFiles[0];
    const tipFile = chainFiles.find((file) => file.path === tipFilePath);
    if (!tipFile) {
      return NextResponse.json(
        { error: "최신 커밋의 FOL 파일을 체인에서 찾을 수 없습니다." },
        { status: 400 },
      );
    }

    // 5. 부모 체인을 따라 genesis까지 추적 (tipFile부터)
    const chain = []; // Genesis → tip 순으로 저장할 배열
    let currentFile = tipFile;

    // 빠른 검색을 위해, 체인 파일들을 각 파일의 "hash:" (자신의 해시) 값을 키로 매핑
    const fileMap: { [key: string]: { path: string; content: string } } = {};
    for (const file of chainFiles) {
      const ownHash = parseFileHash(file.content);
      if (ownHash) {
        fileMap[ownHash] = file;
      }
    }
    console.log("fileMap", Object.keys(fileMap));
    // 체인 추적: 현재 파일의 컨텐츠에서 "parent_hash:" 값을 읽어 부모 파일를 찾음
    while (currentFile) {
      console.log("currentFile", currentFile.path);
      chain.unshift(currentFile); // unshift하면 결과적으로 Genesis부터 tip 순이 됨
      const parentHash = parseParentHash(currentFile.content);
      console.log("parentHash", parentHash);
      if (!parentHash) break;
      const parentFile = fileMap[parentHash];
      if (!parentFile) break;
      currentFile = parentFile;
    }
    console.log("chain", chain);
    // 6. 역순 정렬된 체인 파일명 배열 생성 (예: ["0_genesis.fol", "1_auto.fol", ...])
    const sortedFolFiles = chain.map((file) => file.path.split("/").pop());
    // docs 폴더 내 HTML 파일명 배열 (같은 순서, 확장자만 .html)
    const sortedDocFiles = sortedFolFiles.map((f) => f?.replace(/\.fol$/, ".html"));
    console.log("sortedDocFiles", sortedDocFiles);
    // 7. docs 폴더 내 HTML 파일들의 실제 컨텐츠를 가져옵니다.
    const docContents = await Promise.all(
      sortedDocFiles.slice(0, -1).map(async (docFile) => {
        const docFilePath = `docs/${docFile}`;
        const docContent = await githubService.getFileContent(docFilePath, branch);
        return docContent;
      }),
    );
    // Anthropic 서비스를 사용해 HTML 스토리 생성
    // 여기서는 두 개의 배열을 전달합니다.
    // folContents: 각 FOL 파일의 원래 내용 배열
    // htmlContents: 각 FOL 파일 내용을 <pre> 태그로 감싼 HTML 형식의 내용 배열
    const folContents = chain.map((file) => file.content);
    console.log("folContents", folContents);
    console.log("htmlContents", docContents);
    
    const pairedFolHtmlContents = folContents
      .map(
        (folContent, index) => `
    FOL file ${index + 1}:
    ${folContent}

    HTML conversion ${index + 1}:
    ${htmlContents[index]}
    `,
      )
      .join("\n");
    try {
      const response = await fetch('/api/gen-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairedFolHtmlContents: pairedFolHtmlContents }),
      });

      const result = await response.json();
      const htmlStory = result.htmlStory;
    } catch (error) {
      console.error("Error fetching HTML data:", error);
      const htmlStory = "";
    }

    // 8. docs 폴더 내 보고서 파일 생성: tip 파일과 동일한 이름(확장자만 .html)
    const tipHtmlFileName =
      tipFilePath
        .split("/")
        .pop()
        ?.replace(/\.fol$/, ".html") || "";
    const htmlFilePath = `docs/${tipHtmlFileName}`;
    const existingFileSha = await githubService.getFileSha(htmlFilePath, branch);
    await githubService.createOrUpdateFile(
      htmlFilePath,
      htmlStory,
      branch,
      existingFileSha || undefined,
    );

    // 9. 최종 결과 응답에 체인 정보 포함
    const result = {
      message: "HTML files committed successfully.",
      htmlFile: htmlFilePath,
      folChain: sortedFolFiles, // 예: ["0_genesis.fol", "1_auto.fol", ...]
      docsChain: sortedDocFiles, // 예: ["0_genesis.html", "1_auto.html", ...]
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
