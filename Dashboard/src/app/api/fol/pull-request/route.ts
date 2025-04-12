// app/api/create-file/route.js
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import crypto from "crypto";

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

        // 3. GitHub 인증 및 저장소 정보
        const githubToken = process.env.GITHUB_TOKEN;
        const owner = process.env.GITHUB_OWNER;
        const repo = process.env.GITHUB_REPO;
        if (!githubToken || !owner || !repo) {
            return NextResponse.json(
                { error: "GitHub 인증 정보 또는 저장소 정보가 설정되지 않았습니다." },
                { status: 500 },
            );
        }

        const octokit = new Octokit({ auth: githubToken });

        // 4. main 브랜치의 최신 커밋 SHA 가져오기
        const { data: mainRef } = await octokit.git.getRef({
            owner,
            repo,
            ref: "heads/main",
        });
        const baseSha = mainRef.object.sha;

        // 5. 새 브랜치가 이미 존재하는지 확인 후, 없으면 생성
        try {
            await octokit.git.getRef({
                owner,
                repo,
                ref: `heads/${newBranch}`,
            });
            // 이미 존재하는 경우는 그대로 진행 (업데이트 또는 PR 재사용)
        } catch (error) {
            if ((error as { status: number }).status === 404) {
                // 존재하지 않으면 새 브랜치 생성
                await octokit.git.createRef({
                    owner,
                    repo,
                    ref: `refs/heads/${newBranch}`,
                    sha: baseSha,
                });
            } else {
                throw error;
            }
        }

        // 6. 파일 생성/업데이트 작업
        // 파일 경로 지정: "fol/" 디렉토리에 생성하도록 함.
        const filePath = fileName.startsWith("fol/") ? fileName : `fol/${fileName}`;

        // 파일 내용을 Base64 인코딩
        const contentBase64 = Buffer.from(contents, "utf8").toString("base64");
        const commitMessage = `Add file ${filePath} via API`;

        // 파일이 존재하는지 확인 (존재하면 업데이트, 없으면 생성)
        let fileSha;
        try {
            const { data } = await octokit.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: newBranch,
            });
            fileSha = Array.isArray(data) ? data[0].sha : data.sha;
        } catch (error) {
            if ((error as { status: number }).status !== 404) {
                throw error;
            }
        }

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: filePath,
            message: commitMessage,
            content: contentBase64,
            branch: newBranch,
            ...(fileSha ? { sha: fileSha } : {}), // fileSha가 있으면 업데이트
        });

        // 7. main 브랜치 대상 PR 생성
        const { data: pullRequest } = await octokit.pulls.create({
            owner,
            repo,
            title: `Auto PR: Add ${filePath}`,
            head: newBranch,
            base: "main",
            body: `자동 생성된 PR입니다. 파일 \`${filePath}\`이 추가되었습니다.`,
        });

        return NextResponse.json({ pullRequest });
    } catch (error) {
        console.error("Error in create-file API:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Internal Server Error" },
            { status: 500 },
        );
    }
}
