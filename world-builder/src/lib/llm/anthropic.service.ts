import Anthropic from "@anthropic-ai/sdk";

export class AnthropicService {
  private anthropic: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not set.");
    }
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateHtmlStory(folContents: string[], htmlContents: string[]): Promise<string> {
    const prompt = `The following are FOL (first-order logic) files and their corresponding HTML conversion contents.
    Please analyze the contents of each FOL file and, referring to the HTML conversion contents, write an interesting novel.
    Please output only in HTML format.

    ${folContents
      .map(
        (folContent, index) => `
    FOL file ${index + 1}:
    ${folContent}

    HTML conversion ${index + 1}:
    ${htmlContents[index]}
    `,
      )
      .join("\n")}

    The novel should have the following structure:
    1. DOCTYPE declaration
    2. UTF-8 encoding
    3. Connect the contents of each FOL file to an interesting story
    4. Clean and professional design

    Important: Each HTML conversion content must naturally connect with the previous content, and the overall storyline must flow consistently.
    Each section must evolve based on the previous section's content, and ultimately become a complete story.`;

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
