import { GitHubService } from "@/lib/llm/github.service";
import { NextResponse } from "next/server";

export async function GET() {
  const githubService = new GitHubService();
  const nodePRs = await githubService.getNodePRs();

  // Extract only the necessary core information from each PR.
  const filteredPRs = nodePRs.map((pr) => ({
    number: pr.number,
    state: pr.state,
    title: pr.title,
    html_url: pr.html_url,
    body: pr.body,
    created_at: pr.created_at,
    updated_at: pr.updated_at,
    closed_at: pr.closed_at,
    merge_commit_sha: pr.merge_commit_sha,
    user: {
      login: pr.user?.login || "",
      html_url: pr.user?.html_url || "",
    },
    head: {
      ref: pr.head.ref || "",
      sha: pr.head.sha || "",
    },
    base: {
      ref: pr.base.ref || "",
      sha: pr.base.sha || "",
    },
    diff_url: pr.diff_url || "",
    patch_url: pr.patch_url || "",
  }));

  return NextResponse.json({ nodePRs: filteredPRs });
}
