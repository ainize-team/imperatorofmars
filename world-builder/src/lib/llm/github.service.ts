import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";

export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor() {
    const githubToken = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    if (!githubToken || !owner || !repo) {
      throw new Error("GitHub 인증 정보 또는 저장소 정보가 설정되지 않았습니다.");
    }

    this.octokit = new Octokit({ auth: githubToken });
    this.owner = owner;
    this.repo = repo;
  }

  async getMainBranchSha(): Promise<string> {
    const { data: mainRef } = await this.octokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: "heads/main",
    });
    return mainRef.object.sha;
  }

  async createOrGetBranch(branchName: string, baseSha: string): Promise<void> {
    try {
      await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branchName}`,
      });
    } catch (error) {
      if ((error as { status: number }).status === 404) {
        await this.octokit.git.createRef({
          owner: this.owner,
          repo: this.repo,
          ref: `refs/heads/${branchName}`,
          sha: baseSha,
        });
      } else {
        throw error;
      }
    }
  }

  async getFileSha(filePath: string, branch: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: filePath,
        ref: branch,
      });
      if (Array.isArray(data)) {
        throw new Error(`The path "${filePath}" corresponds to a directory, not a file.`);
      }
      return data.sha;
    } catch (error) {
      if ((error as { status: number }).status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createOrUpdateFile(
    filePath: string,
    content: string,
    branch: string,
    fileSha?: string,
  ): Promise<void> {
    const contentBase64 = Buffer.from(content, "utf8").toString("base64");
    const commitMessage = `Add file ${filePath} via API`;

    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path: filePath,
      message: commitMessage,
      content: contentBase64,
      branch: branch,
      ...(fileSha ? { sha: fileSha } : {}),
    });
  }

  async createPullRequest(
    title: string,
    head: string,
    body: string,
  ): Promise<RestEndpointMethodTypes["pulls"]["create"]["response"]> {
    return this.octokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title,
      head,
      base: "main",
      body,
    });
  }

  // 지정된 폴더(예: "fol") 내의 모든 .fol 파일을 재귀적으로 읽어 [{ path, content }] 배열을 반환합니다.
  async getFolderFiles(
    folderPath: string,
    branch: string,
  ): Promise<Array<{ path: string; content: string }>> {
    const files: Array<{ path: string; content: string }> = [];

    const traverse = async (currentPath: string) => {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: currentPath,
        ref: branch,
      });
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.type === "file" && item.name.endsWith(".fol")) {
            let content = "";
            if (item.content) {
              content = Buffer.from(item.content, "base64").toString("utf8");
            } else if (item.download_url) {
              const response = await fetch(item.download_url);
              content = await response.text();
            }
            files.push({ path: item.path, content });
          } else if (item.type === "dir") {
            await traverse(item.path);
          }
        }
      } else {
        if (data.type === "file" && data.name.endsWith(".fol")) {
          let content = "";
          if (data.content) {
            content = Buffer.from(data.content, "base64").toString("utf8");
          } else if (data.download_url) {
            const response = await fetch(data.download_url);
            content = await response.text();
          }
          files.push({ path: data.path, content });
        }
      }
    };

    await traverse(folderPath);
    return files;
  }

  /**
   * 지정된 branch의 최신 커밋에서 변경된 파일 경로 목록을 반환합니다.
   * @param branch - 대상 브랜치 이름
   * @returns Promise<string[]> - 최신 커밋에서 변경된 파일 경로의 배열
   */
  async getLatestCommitChangedFiles(branch: string): Promise<string[]> {
    // branch의 최신 커밋 정보를 가져옵니다.
    const { data: commit } = await this.octokit.repos.getCommit({
      owner: this.owner,
      repo: this.repo,
      ref: branch,
    });
    // commit.files 필드에는 해당 커밋에서 변경된 파일 정보가 포함됩니다.
    if (!commit.files) {
      return [];
    }

    // 각 파일의 filename 속성을 추출하여 배열로 반환
    return commit.files.map((file) => file.filename);
  }

  async getFileContent(filePath: string, branch: string): Promise<string> {
    const { data } = await this.octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path: filePath,
      ref: branch,
    });
    if (Array.isArray(data)) {
      throw new Error(`The path "${filePath}" corresponds to a directory, not a file.`);
    }
    if (data.type !== "file" || !data.content) {
      throw new Error(`The path "${filePath}" does not contain file content.`);
    }
    return Buffer.from(data.content, "base64").toString("utf8");
  }

  /**
   * Returns a list of PRs where the head branch starts with "node/".
   * @param state The state of the PR ("open", "closed", "all")
   * @returns Promise<PR[]> - An array of PRs with head branches matching the "node/**" pattern
   */
  async getNodePRs(
    state: "open" | "closed" | "all" = "all",
  ): Promise<RestEndpointMethodTypes["pulls"]["list"]["response"]["data"]> {
    // per_page는 최대 100까지 지정 가능하며, 필요시 pagination을 고려해야 합니다.
    const { data: pullRequests } = await this.octokit.pulls.list({
      owner: this.owner,
      repo: this.repo,
      state,
      per_page: 100,
    });
    // head 브랜치(ref)가 "node/"로 시작하는 PR만 필터링
    const nodePRs = pullRequests.filter((pr) => pr.head.ref.startsWith("node/"));
    return nodePRs;
  }
}
