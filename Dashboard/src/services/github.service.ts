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
            return Array.isArray(data) ? data[0].sha : data.sha;
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
}
