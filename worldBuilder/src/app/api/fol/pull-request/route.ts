// app/api/create-file/route.js
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { GitHubService } from "@/lib/llm/github.service";

export async function POST(request: NextRequest) {
  try {
    // 1. 요청에서 contents, parentHash, title 추출
    const { contents, parentHash, title } = await request.json();
    if (!contents || !parentHash || !title) {
      return NextResponse.json(
        { error: "contents, parentHash, title이 필요합니다." },
        { status: 400 },
      );
    }

    // 2. 작업할 브랜치는 "chain"으로 고정 (FOL 체인을 관리한다고 가정)
    const githubService = new GitHubService();
    const baseSha = await githubService.getMainBranchSha();

    // 3. "fol" 폴더 내 파일 목록을 조회하여, 파일명 형식 "숫자_타이틀_해쉬값.fol"에서
    //    요청한 parentHash와 일치하는 부모 파일을 찾음.
    //    (항상 "0_genesis_{해쉬값}.fol"이 존재한다고 가정)
    const folFiles = await githubService.getFolderFiles("fol", "main");
    const regex = /^(\d+)_([^_]+)_([a-f0-9]+)\.fol$/;
    let parentFileNumber = -1;
    for (const file of folFiles) {
      // file.path 예: "fol/0_genesis_abcdef1234.fol"
      const segments = file.path.split("/");
      const fileName = segments[segments.length - 1];
      const match = fileName.match(regex);
      if (match && match[3] === parentHash) {
        parentFileNumber = parseInt(match[1], 10);
        break;
      }
    }

    if (parentFileNumber === -1) {
      return NextResponse.json(
        { error: "요청한 parentHash에 해당하는 부모 파일이 존재하지 않습니다." },
        { status: 400 },
      );
    }

    // 4. 새 파일 번호는 부모 파일 번호 + 1
    const newNumber = parentFileNumber + 1;

    // 5. 새 파일 해시는 hash(parentHash + contents)로 계산
    const newFileHash = crypto
      .createHash("sha256")
      .update(parentHash + contents)
      .digest("hex");

    // 6. 파일명은 "숫자_타이틀_해쉬값.fol" 형식으로 설정
    const newFileName = `${newNumber}_${title}_${newFileHash}.fol`;
    const filePath = `fol/${newFileName}`;

    // 7. 새 파일 내용: 맨 윗줄에 "parent: {parentHash}" 추가 후 contents 이어붙임
    const newFileContent = `parent: ${parentHash}\n${contents}`;

    // 8. 파일 존재 여부 확인 후, 있으면 업데이트, 없으면 생성
    const branch = `node/${newFileHash}`;
    await githubService.createOrGetBranch(branch, baseSha);
    const fileSha = await githubService.getFileSha(filePath, branch);
    await githubService.createOrUpdateFile(filePath, newFileContent, branch, fileSha || undefined);

    // 9. main 브랜치 대상 PR 생성 (branch "chain"에서 main으로)
    const { data: pullRequest } = await githubService.createPullRequest(
      `Auto PR: Add ${filePath}`,
      branch,
      `자동 생성된 PR입니다. 파일 \`${filePath}\`이 추가되었습니다.`,
    );

    return NextResponse.json({
      message: "PR 생성 성공",
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
