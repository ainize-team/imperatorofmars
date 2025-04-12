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

  async verifyFol(
    existingFol: string[],
    newFol: string,
  ): Promise<{ valid: boolean; reason?: string }> {
    const prompt = `
The following are FOL (first-order logic) records in time order and a new FOL sentence.
[Existing FOL records]
${existingFol.map((fol, index) => `${index + 1}. ${fol}`).join("\n")}

[New FOL Sentence]
${newFol}

Please analyze the new FOL sentence in detail by following these steps:

1. **Syntax Check**  
 - Verify that the FOL sentence follows the correct syntax, including proper parentheses pairing and valid tokens.
 - **Validation Rule:** Must adhere to the defined FOL grammatical structure.

2. **Definition/Reference Consistency Check**  
 - Check if the constants and predicates used in the new sentence are already defined in the existing records, or if they can be newly introduced without conflict.
 - **Validation Rule:** Compare against the list of defined constants/predicates from the existing records.

3. **Logical Contradiction Check**  
 - Determine whether the new sentence contradicts any of the existing FOL records.
 - **Validation Rule:** Evaluate logical consistency using inference rules; for example, if "IsPlanet(Mars)" is defined, a statement denying Mars as a planet would be a contradiction.
For each step, if an issue is found, provide a detailed explanation along with the specific validation rule that failed.

Please respond in the following JSON format:
{
  "valid": boolean,
  "reason": string
}`;

    const response = await this.anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1500,
      temperature: 0.0,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    if (response.content[0].type !== "text") {
      return { valid: false, reason: "Invalid response format" };
    }

    try {
      const result = JSON.parse(response.content[0].text);
      return {
        valid: result.valid,
        reason: result.reason,
      };
    } catch (error) {
      console.error("Error in verifyFol:", error);
      return { valid: false, reason: "Failed to parse response" };
    }
  }

  async generateHtmlStory(
    folContents: string[],
    htmlContents: string[],
    docFiles: string[],
  ): Promise<string> {
    console.log("docFiles", docFiles);
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

      <Button Style CSS>
      a.story-btn {
        display: inline-block;
        padding: 8px 16px;
        margin: 10px auto; /* Top and bottom margin for center alignment */
        background-color: #d2b48c; /* Yellow-brown color series */
        color: #ffffff;
        text-decoration: none;
        border-radius: 4px;
        font-family: 'KoPub Batang', 'Noto Serif KR', serif;
        font-size: 1em;
        font-weight: bold;
        transition: background-color 0.3s ease;
        text-align: center;
      }

      a.story-btn:hover {
        background-color: #a0522d; /* Sienna color series on hover */
      }
      </Button Style CSS>

    <Requirements>
    The novel should have the following structure:
    1. DOCTYPE declaration
    2. UTF-8 encoding
    3. Connect the contents of each FOL file to an interesting story
    4. Clean and professional design
    5. Include a link to the previous story at the top of the HTML content.
    The link should be in the format of 
    <div style="text-align: center;">
      <a class="story-btn" href="${prevHtmlFile}">Previous: ${prevHtmlFileTitle}</a>
    </div>
    6. include the button style css in the head section
    7. Include the following script at the end of the body: <script src="/page-linker.js"></script>

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

  async appendNextButton(lastDocContent: string, nextHtmlFileName: string) {
    const prompt = `
    <Existing Content>
    """
    ${lastDocContent}
    """
    <Requirements>
    Please add the button below without changing the existing content.

    <Button Style>
    a.story-btn {
      display: inline-block;
      padding: 8px 16px;
      margin: 10px auto; /* Top and bottom margin for center alignment */
      background-color: #d2b48c; /* Yellow-brown color series */
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-family: 'KoPub Batang', 'Noto Serif KR', serif;
      font-size: 1em;
      font-weight: bold;
      transition: background-color 0.3s ease;
      text-align: center;
    }

    a.story-btn:hover {
      background-color: #a0522d; /* Sienna color series on hover */
    }

    <div style="text-align: center;">
      <a class="story-btn" href="${nextHtmlFileName}">Next: ${nextHtmlFileName.replace(
      ".html",
      "",
    )}</a>
    </div>

    NOTE: Please output only in HTML format. (your output should start with '<!DOCTYPE html>')
   `;

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
