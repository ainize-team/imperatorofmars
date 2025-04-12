import os from "os";
import path from "path";
import { experimental_createMCPClient, streamText } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
import { anthropic } from "@ai-sdk/anthropic";

const homeDir = os.homedir();
const scriptDir = path.join(homeDir, process.env.STORY_MCP_SCRIPT_DIR!);

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  try {
    const transport = new Experimental_StdioMCPTransport({
      command: "uv",
      args: ["--directory", scriptDir, "run", "server.py"],
      env: {
        WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY!,
        RPC_PROVIDER_URL: process.env.RPC_PROVIDER_URL!,
        PINATA_JWT: process.env.PINATA_JWT!,
      },
    });

    const stdioClient = await experimental_createMCPClient({
      transport,
    });

    const tools = await stdioClient.tools();

    const response = await streamText({
      model: anthropic("claude-3-7-sonnet-20250219"),
      tools,
      prompt,
      onFinish: async () => {
        await stdioClient.close();
      },
    });

    return response.toDataStreamResponse();
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
}
