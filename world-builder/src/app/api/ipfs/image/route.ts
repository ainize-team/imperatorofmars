import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
    body: formData,
  });

  const json = await res.json();
  return NextResponse.json({ ipfsHash: json.IpfsHash });
}
