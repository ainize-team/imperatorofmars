import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const json = await req.json();

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  });

  const data = await res.json();
  return NextResponse.json({ ipfsHash: data.IpfsHash });
}
