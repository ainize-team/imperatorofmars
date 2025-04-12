// app/api/fol/commit-html/route.js
import { NextRequest, NextResponse } from "next/server";
import { GitHubService } from "@/services/github.service";
import { OpenAIService } from "@/services/openai.service";

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
        const openaiService = new OpenAIService();

        // 해당 branch의 "fol" 디렉토리 내 모든 .fol 파일들을 읽어옴
        const folFiles = await githubService.getFolderFiles("fol", branch);

        // OpenAI를 사용하여 HTML 보고서 생성
        const htmlStory = await openaiService.generateHtmlStory(folFiles);

        // branch 이름을 파일명으로 사용 ("/" → "-" 치환)하여 docs 폴더 내에 저장
        const sanitizedBranchName = branch.replace(/\//g, "-");
        const htmlFilePath = `docs/${sanitizedBranchName}.html`;

        // 기존 파일 SHA 조회 (있다면 업데이트)
        const fileSha = await githubService.getFileSha(htmlFilePath, branch);
        await githubService.createOrUpdateFile(
            htmlFilePath,
            htmlStory,
            branch,
            fileSha || undefined,
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
