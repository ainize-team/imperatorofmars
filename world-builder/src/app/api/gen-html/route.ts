import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { folContents, docContents } = await req.json();

  const pairedFolHtmlContents = folContents
      .map(
        (folContent, index) => `
    FOL file ${index + 1}:
    ${folContent}

    HTML conversion ${index + 1}:
    ${docContents[index]}
    `,
      )
      .join("\n");

  const authPayload = {
    account_id: process.env.NEAR_ACCOUNT_ID,
    signature: process.env.NEAR_SIGNATURE,
    public_key: process.env.NEAR_PUBLIC_KEY,
    callback_url: process.env.NEAR_CALLBACK_URL,
    nonce: process.env.NEAR_NONCE,
    recipient: process.env.NEAR_RECIPIENT,
    message: process.env.NEAR_MESSAGE
  };

  // Send a request to the NEAR API to create a new thread
  const threadResponse = await fetch("https://api.near.ai/v1/threads/runs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.stringify(authPayload)}`
    },
    body: JSON.stringify({
      agent_id: "kyungmoonleecomcom.near/FOL2HTML/0.0.4", 
      new_message: pairedFolHtmlContents,
      max_iterations: "1"
    })
  });

  const threadResult = await threadResponse.text();

  // Extract the thread_id from the response
  const threadId = threadResult.replace(/["%]/g, '').trim();

  // Send a request to the NEAR API to get the messages in the thread
  const messageResponse = await fetch(`https://api.near.ai/v1/threads/${threadId}/messages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.stringify(authPayload)}`
    }
  });

  const messageResult = await messageResponse.json();
  const assistantMessage = messageResult.data.find((msg: any) => msg.role === 'assistant');

  let extractedMessage = '';
  if (assistantMessage && assistantMessage.content && assistantMessage.content.length > 0) {
    extractedMessage = assistantMessage.content
      .filter((c: any) => c.type === 'text')
      .map((c: any) => c.text.value)
      .join(' ');
  }

  return NextResponse.json({ htmlStory: extractedMessage });
}

