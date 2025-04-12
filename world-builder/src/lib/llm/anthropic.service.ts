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

  async generateHtmlStory(folContents: string[], htmlContents: string[]): Promise<string> {
    const prompt = `다음은 FOL (first-order logic) 파일들과 그에 해당하는 HTML 변환 내용입니다.
    각 FOL 파일의 내용을 분석하고, HTML 형식으로 변환된 내용을 참고하여 흥미로운 소설을 작성해주세요.
    HTML 형식으로만 출력해주세요.

    ${folContents
      .map(
        (folContent, index) => `
    FOL 파일 ${index + 1}:
    ${folContent}

    HTML 변환 ${index + 1}:
    ${htmlContents[index]}
    `,
      )
      .join("\n")}

    소설은 다음 구조를 가져야 합니다:
    1. DOCTYPE 선언
    2. UTF-8 인코딩
    3. 각 FOL 파일의 내용을 흥미로운 스토리로 연결
    4. 깔끔하고 전문적인 디자인

    중요: 각 HTML 변환 내용은 이전 내용과 자연스럽게 이어져야 하며, 전체적인 스토리라인이 일관성 있게 흘러가야 합니다.
    각 섹션은 이전 섹션의 내용을 기반으로 발전되어야 하며, 최종적으로 하나의 완성된 이야기가 되어야 합니다.`;

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
