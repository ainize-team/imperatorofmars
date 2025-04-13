import { AnthropicService } from "@/lib/llm/anthropic.service";
import { NextRequest, NextResponse } from "next/server";

interface FolFile {
  path: string;
  content: string;
}

async function validateFolContent(content: string): Promise<{ valid: boolean; reason?: string }> {
  const anthropicService = new AnthropicService();
  const response = await anthropicService.verifyFol([], content);
  return response;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const files: FolFile[] = body.files;

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: "files array is required." }, { status: 400 });
    }

    const results = await Promise.all(
      files.map(async ({ path, content }) => {
        const result = await validateFolContent(content);
        return {
          path,
          valid: result.valid,
          reason: result.reason || "✅ Consistency OK",
        };
      }),
    );

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
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        error: "Server error occurred",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
