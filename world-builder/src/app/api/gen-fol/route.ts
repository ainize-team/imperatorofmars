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

  // NEAR AI에 메시지를 보내고 thread_id를 얻기 위한 요청
  const threadResponse = await fetch("https://api.near.ai/v1/threads/runs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${JSON.stringify(authPayload)}`
    },
    body: JSON.stringify({
      agent_id: "kyungmoonleecomcom.near/fol_generator_v1/0.0.2", 
      new_message: message,
      max_iterations: "1"
    })
  });

  const threadResult = await threadResponse.text();
  console.log("Thread Result:", threadResult);

  // thread_id 추출 (결과에서 " 문자를 제거)
  const threadId = threadResult.replace(/["%]/g, '').trim();
  console.log("Thread ID:", threadId);

  // 얻은 thread_id를 사용하여 Agent 답변 메시지 조회
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
      .join(' ');  // 여러 텍스트를 연결할 경우를 고려하여 join
  }

  console.log("Extracted Message:", extractedMessage);

  const constantFOL = `
    # First-Order Logic (FOL) Definition for the SoulFiction: Imperator of Mars World Model
    # Consistent and unified representation
    # Date: 2025-04-12

    # Constants
    Mars
    ImperatorOfMars
    OlympusMons
    VallesMarineris
    GaleCrater
    JezeroCrater
    Perseverance
    Curiosity
    NorthPole
    SouthPole
    WaterIce
    CarbonDioxide
    Rock
    Soil

    # Predicates
    IsPlanet(object)
    IsEntity(object)
    IsMountain(object)
    IsValley(object)
    IsCrater(object)
    IsRover(object)
    IsPole(object)
    IsSubstance(object)
    IsRock(object)
    IsSoil(object)
    HasAtmosphere(planet)
    IsFrozen(substance)
    LocatedOn(feature, planet)
    LocatedIn(entity, location)
    ExistsAt(substance, location)
    PrimaryAtmosphericComponent(planet, substance)

    # Facts
    # Type Assertions
    IsPlanet(Mars)
    IsEntity(ImperatorOfMars)
    IsMountain(OlympusMons)
    IsValley(VallesMarineris)
    IsCrater(GaleCrater)
    IsCrater(JezeroCrater)
    IsRover(Perseverance)
    IsRover(Curiosity)
    IsPole(NorthPole)
    IsPole(SouthPole)
    IsSubstance(WaterIce)
    IsSubstance(CarbonDioxide)

    # Property Assertions
    HasAtmosphere(Mars)
    PrimaryAtmosphericComponent(Mars, CarbonDioxide)
    IsFrozen(WaterIce)

    # Location & Relationship Assertions
    LocatedOn(OlympusMons, Mars)
    LocatedOn(VallesMarineris, Mars)
    LocatedOn(GaleCrater, Mars)
    LocatedOn(JezeroCrater, Mars)
    LocatedOn(NorthPole, Mars)
    LocatedOn(SouthPole, Mars)
    LocatedIn(Perseverance, JezeroCrater)
    LocatedIn(Curiosity, GaleCrater)
    ExistsAt(WaterIce, NorthPole)
    ExistsAt(WaterIce, SouthPole)
    ExistsAt(CarbonDioxide, Mars)
  `
  // 클라이언트로 반환
  // return NextResponse.json({ threadId, message: extractedMessage });
  return NextResponse.json({ threadId, message: constantFOL });
}

