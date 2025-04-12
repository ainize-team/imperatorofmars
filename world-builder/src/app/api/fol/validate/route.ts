import { NextRequest, NextResponse } from "next/server";

interface FolFile {
    path: string;
    content: string;
}

// 예시 LLM 기반 정합성 검사 로직 (실제로는 외부 API 연동)
function validateFolContent(content: string): { valid: boolean; reason?: string } {
    // 아주 단순한 검사 예: 금지된 키워드가 있으면 실패
    if (content.includes("undefinedPredicate")) {
        return {
            valid: false,
            reason: "❌ 'undefinedPredicate'는 정의되지 않은 술어입니다.",
        };
    }

    if (!content.includes("IsPlanet")) {
        return {
            valid: false,
            reason: "❌ 최소한 하나의 'IsPlanet' 정의가 필요합니다.",
        };
    }

    return { valid: true };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const files: FolFile[] = body.files;

        if (!files || !Array.isArray(files)) {
            return NextResponse.json({ error: "files 배열이 필요합니다." }, { status: 400 });
        }

        const results = files.map(({ path, content }) => {
            const result = validateFolContent(content);
            return {
                path,
                valid: result.valid,
                reason: result.reason || "✅ 정합성 OK",
            };
        });

        const hasError = results.some((r) => !r.valid);

        return NextResponse.json(
            {
                status: hasError ? "invalid" : "valid",
                results,
            },
            {
                status: hasError ? 422 : 200,
            },
        );
    } catch (error: unknown) {
        console.error("Webhook 처리 오류:", error);
        return NextResponse.json(
            {
                error: "서버 오류 발생",
                detail: error instanceof Error ? error.message : "알 수 없는 오류",
            },
            { status: 500 },
        );
    }
}
