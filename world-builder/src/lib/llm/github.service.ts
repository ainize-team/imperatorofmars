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
      throw new Error("GitHub authentication information or repository information is not set.");
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

  // Reads all .fol files recursively within a specified folder (e.g., "fol") and returns an array of [{ path, content }].
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
   * Returns the list of file paths changed in the latest commit of a specified branch.
   * @param branch - The target branch name
   * @returns Promise<string[]> - An array of file paths changed in the latest commit
   */
  async getLatestCommitChangedFiles(branch: string): Promise<string[]> {
    // Fetches the latest commit information of the branch.
    const { data: commit } = await this.octokit.repos.getCommit({
      owner: this.owner,
      repo: this.repo,
      ref: branch,
    });
    // The commit.files field contains information about the files changed in the commit.
    if (!commit.files) {
      return [];
    }

    // Extracts the filename property of each file and returns as an array.
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
    // per_page can be set up to 100, and pagination should be considered if necessary.
    const { data: pullRequests } = await this.octokit.pulls.list({
      owner: this.owner,
      repo: this.repo,
      state,
      per_page: 100,
    });
    // Filter only PRs where the head branch (ref) starts with "node/".
    const nodePRs = pullRequests.filter((pr) => pr.head.ref.startsWith("node/"));
    return nodePRs;
  }
}
