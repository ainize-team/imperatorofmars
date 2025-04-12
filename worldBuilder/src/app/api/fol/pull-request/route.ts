// app/api/create-file/route.js
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { GitHubService } from "@/services/github.service";

export async function POST(request: NextRequest) {
    try {
        // 1. 요청에서 fileName과 contents 추출
        const { fileName, contents } = await request.json();
        if (!fileName || !contents) {
            return NextResponse.json(
                { error: "fileName과 contents가 필요합니다." },
                { status: 400 },
            );
        }

        // 2. contents 해시 계산 (SHA-256 사용, hex 인코딩)
        const hash = crypto.createHash("sha256").update(contents).digest("hex");
        const newBranch = `node/${hash}`;
        const filePath = fileName.startsWith("fol/") ? fileName : `fol/${fileName}`;

        // 3. GitHub 인증 및 저장소 정보
        const githubService = new GitHubService();
        const baseSha = await githubService.getMainBranchSha();
        await githubService.createOrGetBranch(newBranch, baseSha);

        // 4. 파일이 존재하는지 확인 (존재하면 업데이트, 없으면 생성)
        const fileSha = await githubService.getFileSha(filePath, newBranch);
        await githubService.createOrUpdateFile(filePath, contents, newBranch, fileSha || undefined);

        // 5. main 브랜치 대상 PR 생성
        const { data: pullRequest } = await githubService.createPullRequest(
            `Auto PR: Add ${filePath}`,
            newBranch,
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
