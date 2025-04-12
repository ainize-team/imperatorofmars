// app/api/fol/commit-html/route.js
import { NextRequest, NextResponse } from "next/server";
import { GitHubService } from "@/lib/llm/github.service";
import { AnthropicService } from "@/lib/llm/anthropic.service";

// 파일 내용의 첫 줄("parent: {부모해쉬값}")에서 부모 해시를 추출하는 함수
function parseParent(content: string) {
    const lines = content.split("\n");
    if (lines.length > 0) {
        const match = lines[0].trim().match(/^parent:\s*(\S+)/);
        if (match) {
            return match[1];
        }
    }
    return null;
}

// 파일명에서 번호와 해시를 추출 (형식: 숫자_타이틀_해쉬값.fol)
function extractNumberAndHash(fileName: string) {
    const regex = /^(\d+)_([^_]+)_([a-f0-9]+)\.fol$/;
    const match = fileName.match(regex);
    if (match) {
        return { number: parseInt(match[1], 10), hash: match[3] };
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

        // 2. 작업할 브랜치는 "chain"으로 가정할 수도 있지만, 여기서는 branch를 그대로 사용함.
        // GitHubService에서 주어진 branch를 사용할 때, base SHA를 얻어 branch를 생성 또는 획득한다.
        const baseSha = await githubService.getMainBranchSha();
        await githubService.createOrGetBranch(branch, baseSha);

        // 3. 해당 branch의 "fol" 폴더 내 모든 FOL 파일들을 가져옴 (전체 목록)
        const allFolFiles = await githubService.getFolderFiles("fol", branch);
        // 유효한 체인 파일만 필터 (형식: 숫자_타이틀_해쉬값.fol)
        const chainFiles = allFolFiles.filter((file) =>
            /^(\d+)_([^_]+)_([a-f0-9]+)\.fol$/.test(file.path.split("/").pop() || ""),
        );
        if (chainFiles.length === 0) {
            return NextResponse.json(
                { error: "체인에 해당하는 FOL 파일이 없습니다." },
                { status: 400 },
            );
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
        const chain = []; // Genesis -> tip 순으로 저장할 배열
        let currentFile = tipFile;
        // 빠른 검색을 위해 체인 파일을 해시(key)로 매핑
        const fileMap = {};
        for (const file of chainFiles) {
            const fileName = file.path.split("/").pop();
            const info = extractNumberAndHash(fileName || "");
            if (info) {
                fileMap[info.hash] = file;
            }
        }
        while (currentFile) {
            chain.unshift(currentFile); // 앞쪽에 추가: 결국 genesis부터 tip 순이 됨
            const parentHash = parseParent(currentFile.content);
            if (!parentHash) break;
            const parentFile = fileMap[parentHash];
            if (!parentFile) break;
            currentFile = parentFile;
        }

        // 6. 역순 정렬된 체인 파일명 배열 생성 (예: ["0_genesis_abcdef.fol", "1_auto_123456.fol", ...])
        const sortedFolFiles = chain.map((file) => file.path.split("/").pop());
        // docs 폴더 내 HTML 파일명 배열 (같은 순서, 확장자만 .html)
        const sortedDocFiles = sortedFolFiles.map((f) => f?.replace(/\.fol$/, ".html"));

        // 7. Anthropic 서비스를 사용해 HTML 스토리 생성 (체인 전체를 전달)
        const htmlStory = await anthropicService.generateHtmlStory(chain);

        // 8. docs 폴더 내 보고서 파일 생성: FOL 파일 이름과 동일하게
        const tipFileName =
            tipFilePath
                .split("/")
                .pop()
                ?.replace(/\.fol$/, ".html") || "";
        const htmlFilePath = `docs/${tipFileName}`;
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
            folChain: sortedFolFiles,
            docsChain: sortedDocFiles,
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
