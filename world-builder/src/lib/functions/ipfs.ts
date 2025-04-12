"use server";
import pinataSDK from "@pinata/sdk";

export async function uploadImageToIPFS(data: FormData) {
  const pinFileRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
    body: data,
  });
  const { IpfsHash } = await pinFileRes.json();
  return IpfsHash;
}

export async function uploadJsonToIPFS(data: Record<string, any>) {
  const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
  const { IpfsHash } = await pinata.pinJSONToIPFS(data);
  return IpfsHash;
}
