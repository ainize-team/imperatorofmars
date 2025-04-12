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
    message: process.env.NEAR_MESSAGE,
  };

  console.log("authPayload :>> ", authPayload);

  const runResponse = await fetch("https://api.near.ai/v1/threads/runs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.stringify(authPayload)}`,
    },
    body: JSON.stringify({
      agent_id: "kyungmoonleecomcom.near/fol_generator_v1/0.0.1", // 실제 agent_id
      new_message: message,
      max_iterations: "1",
    }),
  });

  const threadId = await runResponse.text();

  // threadId를 이용하여 실제 agent의 답변 메시지 조회
  const messagesResponse = await fetch(`https://api.near.ai/v1/threads/${threadId}/messages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.stringify(authPayload)}`,
    },
  });

  const messagesResult = await messagesResponse.json();

  return NextResponse.json(messagesResult);
}
