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

  async generateHtmlStory(
    folContents: string[],
    htmlContents: string[],
    docFiles: string[],
  ): Promise<string> {
    console.log(docFiles);
    const prevHtmlFile = docFiles[docFiles.length - 1];
    const prevHtmlFileTitle = prevHtmlFile
      .split("/")
      .pop()
      ?.replace(/\.html$/, "");
    console.log(prevHtmlFileTitle);

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


      /* 이전 스토리 버튼 스타일 */
      a.prev-story {
        display: inline-block;
        padding: 8px 16px;
        margin-top: 20px;
        background-color: #d2b48c; /* 황갈색 계열로 버튼 배경 */
        color: #ffffff; /* 흰색 글씨 */
        text-decoration: none;
        border-radius: 4px;
        font-family: 'KoPub Batang', 'Noto Serif KR', serif;
        font-size: 1em;
        font-weight: bold;
        transition: background-color 0.3s ease;
      }

      a.prev-story:hover {
        background-color: #a0522d; /* 호버시 시에나 계열 색상 */
      }

    The novel should have the following structure:
    1. DOCTYPE declaration
    2. UTF-8 encoding
    3. Connect the contents of each FOL file to an interesting story
    4. Clean and professional design
    5. Include a link to the previous story at the top of the HTML content.
    The link should be in the format of 
    <p><a class="prev-story" href="${prevHtmlFile}">Previous: ${prevHtmlFileTitle}</a></p>
    6. Include the following script at the end of the body: <script src="/page-linker.js"></script>

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
