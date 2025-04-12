// app/api/create-file/route.js
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { GitHubService } from "@/lib/llm/github.service";

// 파일 내용에서 "hash:" 값을 추출하는 함수 (메타데이터에서 본인의 해시)
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

// 파일명에서 identifier 추출 (파일명 형식: {identifier}_{title}.fol)
// identifier는 숫자들이 "-"로 연결된 문자열 (예: "0", "0-1", "0-1-2")
function extractIdentifier(fileName: string): string | null {
  const regex = /^([\d\-]+)_([^_]+)\.fol$/;
  const match = fileName.match(regex);
  if (match) {
    return match[1];
  }
  return null;
}
/**
 * 부모 identifier와 기존에 사용된 identifier 집합(existingSet)을 받아,
 * 새 identifier를 생성하는 함수.
 *
 * 기본 후보는 부모 identifier의 마지막 숫자 +1입니다.
 * 만약 그 값이 이미 존재하면, 부모 identifier에 분기를 적용하여 고유한 identifier를 반환합니다.
 *
 * 예시:
 *  - 부모가 "3"이면 기본 후보 "4"; 만약 "4"가 존재하면 "3-1-1", "3-2-1", "3-3-1", ...
 *  - 부모가 "3-2-1"이면 기본 후보 "3-2-2"; 만약 "3-2-2"가 존재하면 "3-2-1-1", "3-2-1-2", ...
 */
function generateNewIdentifier(parentIdentifier: string, existingSet: Set<string>): string {
  // 부모 identifier를 "-"로 분할하여 마지막 숫자를 추출
  const parts = parentIdentifier.split("-");
  const lastNum = parseInt(parts[parts.length - 1], 10);

  // 기본 후보: 부모 identifier의 마지막 숫자에 +1 (단, 부모가 단일 숫자이면 그대로, 하이픈 포함이면 마지막 숫자만 증가)
  let baseCandidate: string;
  if (parts.length === 1) {
    baseCandidate = (lastNum + 1).toString();
  } else {
    baseCandidate = parts.slice(0, parts.length - 1).join("-") + "-" + (lastNum + 1).toString();
  }

  // 만약 기본 후보가 사용되지 않았다면 그대로 반환
  if (!existingSet.has(baseCandidate)) {
    return baseCandidate;
  }

  // 기본 후보가 이미 존재하면 분기 로직 적용
  let candidate: string;
  let branchSuffix = 1;
  if (parts.length === 1) {
    // 부모 identifier가 단일 숫자인 경우: 후보 "부모-branch-1" 예: "3" -> "3-1-1", "3-2-1", ...
    candidate = `${parentIdentifier}-${branchSuffix}-1`;
    while (existingSet.has(candidate)) {
      branchSuffix++;
      candidate = `${parentIdentifier}-${branchSuffix}-1`;
    }
  } else {
    // 부모 identifier가 이미 하이픈을 포함하는 경우: 후보 "부모Identifier-1" 예: "3-2-1" -> "3-2-1-1", "3-2-1-2", ...
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
    // 1. 요청에서 contents, parentHash, title, signature 추출
    const { contents, parentHash, title, signature } = await request.json();
    if (!contents || parentHash === undefined || !title || !signature) {
      return NextResponse.json(
        { error: "contents, parentHash, title, signature가 필요합니다." },
        { status: 400 },
      );
    }

    const githubService = new GitHubService();

    const baseSha = await githubService.getMainBranchSha();

    // 3. main 브랜치의 fol 폴더 내 모든 FOL 파일들을 조회
    //    파일명 형식은 {identifier}_{title}.fol
    const folFiles = await githubService.getFolderFiles("fol", "main");
    // 유효한 노드 파일만 필터 (파일명이 지정 형식에 맞는 것)
    const nodeFiles = folFiles.filter((file) => {
      const fileName = file.path.split("/").pop() || "";
      return /^([\d\-]+)_([^_]+)\.fol$/.test(fileName);
    });
    if (nodeFiles.length === 0) {
      return NextResponse.json(
        { error: "노드에 해당하는 FOL 파일이 존재하지 않습니다." },
        { status: 400 },
      );
    }

    // 4. 부모 파일 탐색
    // 요청된 parentHash와 일치하는 부모 파일을 찾기 위해 각 파일의 "hash:" 값을 비교
    let parentIdentifier = null;
    // identifierSet: 이미 존재하는 identifier들을 모은 set
    const identifierSet: Set<string> = new Set();
    for (const file of nodeFiles) {
      const fileName = file.path.split("/").pop() || "";
      const id = extractIdentifier(fileName);
      if (id) {
        identifierSet.add(id);
      }
      // 부모 파일을 찾기 위해, 파일의 "hash:" 값을 읽음
      const fileHash = parseHash(file.content);
      if (fileHash === parentHash) {
        parentIdentifier = id;
      }
    }
    if (parentIdentifier === null || parentIdentifier === "") {
      return NextResponse.json(
        { error: "요청한 parentHash에 해당하는 부모 파일을 찾을 수 없습니다." },
        { status: 400 },
      );
    }

    // 5. 새 identifier 생성: 부모 identifier의 마지막 숫자 +1 (이미 존재하면 분기 추가)
    const newIdentifier = generateNewIdentifier(parentIdentifier, identifierSet);

    // 6. 새 파일 해시 계산: 해시 계산 시, 메타데이터(hash: 줄)는 제외하고,
    //    parentHash, signature, 그리고 실제 contents를 이용
    const newFileHash = crypto
      .createHash("sha256")
      .update(parentHash + signature + contents)
      .digest("hex");

    // 7. 새 파일명은 "{newIdentifier}_{title}.fol" 형식
    const name = `${newIdentifier}_${title}`;
    const newFileName = `${name}.fol`;
    const newFilePath = `fol/${newFileName}`;

    // 8. 새 파일 내용 구성: 상단에 메타데이터 3줄 추가 후 빈 줄, 그 다음 contents
    const newFileContent = `hash: ${newFileHash}
parent_hash: ${parentHash}
signature: ${signature}

${contents}`;

    // 9. 새로운 브랜치는 "node/<name>" 형식으로 생성
    const newBranch = `node/${name}`;
    await githubService.createOrGetBranch(newBranch, baseSha);

    // 10. 해당 브랜치에서 새 FOL 파일 생성 (존재하면 업데이트)
    const fileSha = await githubService.getFileSha(newFilePath, newBranch);
    await githubService.createOrUpdateFile(
      newFilePath,
      newFileContent,
      newBranch,
      fileSha || undefined,
    );

    // 11. main 브랜치 대상으로 PR 생성 (branch newBranch에서 main으로)
    const { data: pullRequest } = await githubService.createPullRequest(
      `World Builder: ${name}`,
      newBranch,
      `A majestic creation from World Builder: the \`${newFilePath}\` has been added to the realm.`,
    );

    return NextResponse.json({
      message: "PR creation successful",
      pullRequestLink: pullRequest.html_url,
    });
  } catch (error) {
    console.error("Error in create-file API:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
