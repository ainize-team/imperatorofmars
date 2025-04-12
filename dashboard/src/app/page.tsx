"use client";
import toast from "react-hot-toast";
import { useState } from "react";
import Navbar from "@/components/sections/Navbar";
import FeedVeiwer from "@/components/feedViewer";
import FOLViewer from "@/components/folViewer";

export default function Home() {
  const [input, setInput] = useState<string>("");

  const handleInput = async () => {
    if (!input.trim()) return;

    const tid1 = toast.loading("Uploading image to IPFS...");
    // TODO(jiyoung): upload image to IPFS
    await new Promise((res) => setTimeout(res, 3000));
    toast.success("IPFS upload completed. URI: https://ipfs.io/ipfs/Qm...", { id: tid1 });

    // toast.loading('Creating NFT metadata...');
    // TODO(jiyoung): create nft metadata
    // TODO(jiyoung): upload json metadata to IPFS
    // await new Promise(res => setTimeout(res, 1000));
    // toast.success('NFT metadata created.');

    const tid2 = toast.loading("Creating IP metadata...");
    // TODO(jiyoung): created ip metadata
    // TODO(jiyoung): upload json metadata to IPFS
    await new Promise((res) => setTimeout(res, 3000));
    toast.success('IP metadata created: { name: "KryptoPlanet #001", description: "화성 에레보스 평원 발견...", image: "ipfs://QmArkData..." }', { id: tid2 });

    // TODO(jiyoung): sign with wallet
    // ...

    const tid3 = toast.loading("Minting and registering an IPA...");
    // TODO(jiyoung): mint and register an IPA with pil terms (using SPG contract)
    // ref1: https://docs.story.foundation/sdk-reference/ipasset#mintandregisteripassetwithpilterms
    // ref2: https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#flavor-%231%3A-non-commercial-social-remixing
    await new Promise((res) => setTimeout(res, 3000));
    toast.success('IPA "KryptoPlanet #001" successfully registered on Story Protocol! IPA ID: 0xArkIPAssetAddress…', { id: tid3 });

    setInput("");
  };

  return (
    <div className="flex flex-col h-full w-full gap-5">
      <Navbar />
      {/* Contents */}
      <div className="flex flex-row gap-4">
        <FOLViewer />
        <div className="flex-1 border-2 border-black h-[80vh]">Dag visualizer</div>
        <FeedVeiwer />
      </div>
      {/* Input */}
      <div className="flex flex-row border-2 border-black w-full justify-between p-1">
        <input
          className="flex-1 bg-gray-200"
          placeholder="Input your next story"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleInput();
            }
          }}
        ></input>
        <button className="">Generate</button>
      </div>
    </div>
  );
}
