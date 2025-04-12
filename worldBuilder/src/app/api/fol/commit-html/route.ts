// app/api/fol/commit-html/route.js
import { NextRequest, NextResponse } from "next/server";
import { GitHubService } from "@/services/github.service";

export async function POST(request: NextRequest) {
    try {
        // 요청에서 branch 이름만 추출
        const { branch } = await request.json();
        if (!branch) {
            return NextResponse.json({ error: "branch가 필요합니다." }, { status: 400 });
        }
        if (branch === "main" || branch === "master" || branch === "dev" || branch === "develop") {
            return NextResponse.json(
                { error: `${branch} 브랜치는 사용할 수 없습니다.` },
                { status: 400 },
            );
        }

        const githubService = new GitHubService();

        // 해당 branch의 "fol" 디렉토리 내 모든 .fol 파일들을 읽어옴
        const files = await githubService.getFolderFiles("fol", branch);

        // HTML 보고서 생성: 각 파일의 경로와 내용을 나열합니다.
        const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FOL Report - ${branch}</title>
</head>
<body>
  <h1>FOL Report for ${branch}</h1>
  <ul>
    ${files
        .map((file) => `<li><strong>${file.path}</strong>: <pre>${file.content}</pre></li>`)
        .join("")}
  </ul>
</body>
</html>
    `;

        // branch 이름을 파일명으로 사용 ("/" → "-" 치환)하여 docs 폴더 내에 저장
        const sanitizedBranchName = branch.replace(/\//g, "-");
        const htmlFilePath = `docs/${sanitizedBranchName}.html`;

        // 기존 파일 SHA 조회 (있다면 업데이트)
        const fileSha = await githubService.getFileSha(htmlFilePath, branch);
        await githubService.createOrUpdateFile(
            htmlFilePath,
            htmlReport,
            branch,
            fileSha || undefined,
        );

        // docs 폴더 내 index.html 파일 생성: 위에서 만든 branch HTML 파일로 리다이렉트
        const indexContent = `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=${sanitizedBranchName}.html" />
  <title>Redirecting...</title>
</head>
<body>
  <p>If you are not redirected automatically, <a href="${sanitizedBranchName}.html">click here</a>.</p>
</body>
</html>
    `;
        const indexFilePath = "docs/index.html";
        const indexSha = await githubService.getFileSha(indexFilePath, branch);
        await githubService.createOrUpdateFile(
            indexFilePath,
            indexContent,
            branch,
            indexSha || undefined,
        );

        return NextResponse.json({
            message: "HTML files committed successfully.",
            htmlFile: htmlFilePath,
        });
    } catch (error) {
        console.error("Error committing HTML files:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Internal Server Error" },
            { status: 500 },
        );
    }
}
