# NEAR AI Bounty

# Req1: Agent must be hosted on the [NEAR Agent Hub](https://app.near.ai/agents)

## Uploaded URL hosted by NEAR Hub: https://app.near.ai/profiles/kyungmoonleecomcom.near

## 🙋‍♂️ Agent ["Text2FOL"](https://app.near.ai/agents/kyungmoonleecomcom.near/Text2FOL/latest)
<p align="center">
  <img src="./src/nearai_agent_text2fol.png" alt="Agent Text2FOL">
</p>
The Text2FOL agent bridges the gap between creative storytelling and precise logical representation. It takes natural language descriptions of new story events, settings, or character actions and automatically translates them into mathematically precise First-Order Logic (FOL). 

## 🙋‍♀️ Agent ["FOL2HTML"](https://app.near.ai/agents/kyungmoonleecomcom.near/FOL2HTML/latest)
<p align="center">
  <img src="./src/nearai_agent_fol2html.png" alt="Agent FOL2HTML">
</p>
The FOL2HTML Agent automatically transforms structured FOL statements into creative, visually appealing HTML stories, ensuring logical coherence and readability.

# Req2: Code must be in a public repository

## 🙋‍♂️ Actual Codes
### [./world-builder/src/app/page.tsx](https://github.com/ainize-team/imperatorofmars/blob/main/world-builder/src/app/page.tsx#L123-L140)
```typescript
const getFOL = async (input: string) => {
  // TODO(kyungmoon): get FOL data using "src/app/api/gen-fol/route.ts" using input 
  console.log("FRONT-END input :>> ", input);
  try {
    const response = await fetch('/api/gen-fol', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching FOL data:", error);
    toast.error("Failed to fetch FOL data.");
    return;
  }
}
```

### [./world-builder/src/app/api/gen-fol/route.ts](https://github.com/ainize-team/imperatorofmars/blob/main/world-builder/src/app/api/gen-fol/route.ts#L17-L44)
```typescript
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
```

## 🙋‍♀️ Actual Codes
### [./world-builder/src/app/api/gen-fol/route.ts](https://github.com/ainize-team/imperatorofmars/blob/feature/kyungmoon/nearai-bounty/world-builder/src/app/api/gen-html/route.ts#L28-L56)
```typescript
// Send a request to the NEAR API to create a new thread
const threadResponse = await fetch("https://api.near.ai/v1/threads/runs", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${JSON.stringify(authPayload)}`
  },
  body: JSON.stringify({
    agent_id: "kyungmoonleecomcom.near/FOL2HTML/0.0.2", 
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
```

# Req3: Quantitative Benchmarks for Agent Performance
### To quantitatively benchmark our agents, we developed an automated pipeline for verifying the logical consistency of First-Order Logic (FOL) outputs from the Text2FOL agent.
### Specifically, our module converts generated FOL statements into SMT-LIB format for direct compatibility with the Z3 theorem prover via its Python API, enabling efficient consistency checks.
### We then evaluated the logical consistency of generated statements across diverse user inputs of varying lengths and complexities.
