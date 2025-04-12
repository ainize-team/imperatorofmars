import { NextRequest, NextResponse } from "next/server";

interface FolFile {
  path: string;
  content: string;
}

// Example LLM-based consistency check logic (actual implementation would involve external API integration)
function validateFolContent(content: string): { valid: boolean; reason?: string } {
  // Very simple check example: if a forbidden keyword is present, it fails
  if (content.includes("undefinedPredicate")) {
    return {
      valid: false,
      reason: "❌ 'undefinedPredicate' is an undefined predicate.",
    };
  }

  // if (!content.includes("IsPlanet")) {
  //     return {
  //         valid: false,
  //         reason: "❌ At least one 'IsPlanet' definition is required.",
  //     };
  // }

  return { valid: true };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const files: FolFile[] = body.files;

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: "files array is required." }, { status: 400 });
    }

    const results = files.map(({ path, content }) => {
      const result = validateFolContent(content);
      return {
        path,
        valid: result.valid,
        reason: result.reason || "✅ Consistency OK",
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
