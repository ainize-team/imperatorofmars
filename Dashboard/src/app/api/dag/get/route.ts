import mockNodes from "@/moks/mockNodes";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const cid = req.nextUrl.searchParams.get("cid");
  if (!cid) return Response.json({"message": "invalid cid"});
  return Response.json({ ...mockNodes[cid] })
}