import OpenAI, { AzureOpenAI } from "openai";

export class OpenAIService {
    private openai: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
        }
        this.openai = new AzureOpenAI({
            endpoint: process.env.AZURE_OPENAI_BASE_URL,
            apiKey: process.env.AZURE_OPENAI_API_KEY,
            apiVersion: process.env.AZURE_OPENAI_API_VERSION,
        });
    }

    async generateHtmlStory(files: Array<{ path: string; content: string }>): Promise<string> {
        const englishPrompt = `The following are the contents of the FOL (first-order logic) files. Please generate an HTML novel based on this content.
        Analyze each file's content and convert it into an interesting HTML novel storyline.
        File list:
        ${files.map((file) => `- ${file.path}`).join("\n")}
        
        The HTML novel should have the following structure:
        1. DOCTYPE declaration
        2. UTF-8 encoding
        3. Connect each file's content into an interesting storyline
        4. Responsive design
        5. Apply syntax highlighting to code blocks
        6. The overall design should be clean and professional`;

        const englishCompletion = await this.openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a professional HTML novel generator. You generate an interesting HTML novel based on the given content.",
                },
                {
                    role: "user",
                    content: englishPrompt,
                },
            ],
            temperature: 0.7,
        });
        return englishCompletion.choices[0].message.content || "";
    }
}
