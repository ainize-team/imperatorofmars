import Anthropic from "@anthropic-ai/sdk";

export class AnthropicService {
    private anthropic: Anthropic;

    constructor() {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error("ANTHROPIC_API_KEY가 설정되지 않았습니다.");
        }
        this.anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }

    async generateHtmlStory(files: Array<{ path: string; content: string }>): Promise<string> {
        const prompt = `Please generate an HTML novel based on the contents of the FOL (first-order logic) files. Only output HTML.
        Analyze each file's content and convert it into an interesting HTML novel storyline.
        File list:
        ${files.map((file) => `- ${file.path}`).join("\n")}
        
        The HTML novel should have the following structure:
        1. DOCTYPE declaration
        2. UTF-8 encoding
        3. Connect each file's content into an interesting storyline
        4. The overall design should be clean and professional`;

        const completion = await this.anthropic.messages.create({
            model: "claude-3-opus-20240229",
            max_tokens: 4000,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
        });
        return completion.content[0].type === "text" ? completion.content[0].text : "";
    }
}
