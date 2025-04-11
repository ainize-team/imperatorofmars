import mokNodes from "@/moks/mok_nodes";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const cid = req.nextUrl.searchParams.get("cid");
  if (!cid) return Response.json({"message": "invalid cid"});
  return Response.json({ ...mokNodes[cid] })
}