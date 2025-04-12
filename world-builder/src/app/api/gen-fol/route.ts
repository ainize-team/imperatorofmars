import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();

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
      agent_id: "kyungmoonleecomcom.near/TEXT2FOL/0.0.1", 
      new_message: message,
      max_iterations: "1"
    })
  });

  const threadResult = await threadResponse.text();
  console.log("Thread Result:", threadResult);

  // Extract the thread_id from the response
  const threadId = threadResult.replace(/["%]/g, '').trim();
  console.log("Thread ID:", threadId);

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

  console.log("Extracted Message:", extractedMessage);
  return NextResponse.json({ threadId, message: extractedMessage });
  // return NextResponse.json({ threadId, message: constantFOL });
}

