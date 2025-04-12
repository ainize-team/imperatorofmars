/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSignMessage } from "wagmi";
import toast from "react-hot-toast";
import Navbar from "@/components/sections/Navbar";
import FeedVeiwer from "@/components/feedViewer";
import FOLViewer from "@/components/folViewer";
import DagVisualizer from "@/components/dagVisualizer";
import { generateCid } from "@/utils/crypto";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [nodes, setNodes] = useState<any>([]);
  const [links, setLinks] = useState<any>([]);
  const [selectedNode, setSelectedNode] = useState<any>();
  const { signMessageAsync } = useSignMessage();

  const handleNodes = (newNode: any) => {
    setNodes((prevNodes: any) => [...prevNodes, newNode]);
  };

  const handleLinks = (newLink: any) => {
    setLinks((prevLinks: any) => [...prevLinks, newLink]);
  };

  const handleSelectedNode = (d: any) => {
    setSelectedNode((prevSelectedNode: any) => {
      console.log('d, prevSelectedNode :>> ', d, prevSelectedNode);
      if (!d) return null;
      if (prevSelectedNode && prevSelectedNode.id === d.id) {
        return null;
      } else {
        console.log('d :>> ', d);
        return d;
      }
    });
  };

  const makeHintNode = (lastNodeCid: string, hintMsgs: string[]) => {
    const hintNodes: any[] = [];
    const hintLinks: any[] = [];
    hintMsgs.forEach((msg) => {
      const newNode = {
        message: msg,
        type: "hint",
        children: [lastNodeCid]
      }
      const cid = generateCid(newNode)
      hintNodes.push({
        ...newNode,
        cid,
        id: cid,
      });

      hintLinks.push({source: cid, target: lastNodeCid, type: "dotted"});
    });
    return {
      hintNodes, hintLinks,
    }
  }
  
  const handleInput = async () => {
    if (!input.trim()) return;

    const signature = await signMessage();
    if (!signature) return;

    const cid = createNewNode(input);
    console.log('cid :>> ', cid);
    setSelectedNode(cid);

    await mintAndRegisterNFT();

    setInput("");
  };

  const signMessage = async () => {
    const message = "Sign this message to verify you’re the owner.";
    try {
      const signature = await signMessageAsync({ message });
      console.log("signature created:", signature);
      return signature;
    } catch (err) {
      console.error("signature failed or was rejected:", err);
      toast.error("Signature is required to continue.");
      return null;
    }
  };

  const createNewNode = (input: string) => {
    const newNode = {
      message: input,
      data: [],
      children: [] as any[],
      type: "message",
    }
    const cid = generateCid(newNode);
    if (selectedNode) {
      newNode.children.push(selectedNode.cid);
    }
    const { hintNodes, hintLinks } = makeHintNode(cid, ["감자 재배하기", "물 찾으러 가기"]);

    setNodes(
      (prevNodes: any) => 
        [
          ...prevNodes.filter((node: any) => node.type === "message"), 
          {...newNode, cid, id: cid}, 
          ...hintNodes
        ]
    );
    setLinks(
      (prevLinks: any) => 
        [
          ...prevLinks.filter((link: any) => link.type !== "dotted"),
          { source: cid, target: selectedNode.id },
          ...hintLinks
        ]
    );
    return cid;
  };

  const mintAndRegisterNFT = async () => {
    const tid = toast.loading("Uploading image to IPFS...");
    await new Promise((res) => setTimeout(res, 3000));
    toast.success("IPFS upload completed. URI: https://ipfs.io/ipfs/Qm...", { id: tid });

    // toast.loading('Creating NFT metadata...');
    // TODO(jiyoung): create nft metadata
    // TODO(jiyoung): upload json metadata to IPFS
    // await new Promise(res => setTimeout(res, 1000));
    // toast.success('NFT metadata created.');

    const tid2 = toast.loading("Creating IP metadata...");
    // TODO(jiyoung): created ip metadata
    // TODO(jiyoung): upload json metadata to IPFS
    await new Promise((res) => setTimeout(res, 3000));
    toast.success(
      'IP metadata created: { name: "KryptoPlanet #001", description: "화성 에레보스 평원 발견...", image: "ipfs://QmArkData..." }',
      { id: tid2 }
    );

    // TODO(jiyoung): sign with wallet
    // ...

    const tid3 = toast.loading("Minting and registering an IPA...");
    // TODO(jiyoung): mint and register an IPA with pil terms (using SPG contract)
    // ref1: https://docs.story.foundation/sdk-reference/ipasset#mintandregisteripassetwithpilterms
    // ref2: https://docs.story.foundation/concepts/programmable-ip-license/pil-flavors#flavor-%231%3A-non-commercial-social-remixing
    await new Promise((res) => setTimeout(res, 3000));
    toast.success(
      'IPA "KryptoPlanet #001" successfully registered on Story Protocol! IPA ID: 0xArkIPAssetAddress…',
      { id: tid3 }
    );
  }

  const handleInputOnChild = (message: string) => {
    setInput(message);
  }

  return (
    <div className="flex flex-col h-full w-full gap-5">
      <Navbar />
      {/* Contents */}
      <div className="flex flex-row gap-4">
        <FOLViewer />
        <DagVisualizer 
          nodes={nodes} 
          links={links} 
          handleLinks={handleLinks} 
          handleNodes={handleNodes} 
          selectedNode={selectedNode} 
          handleSelectedNode={handleSelectedNode}
          handleInput={handleInputOnChild}
        />
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
          }}></input>
        <button className="" onClick={(e) => {
          e.preventDefault();
          handleInput();
        }}>Generate</button>
      </div>
    </div>
  );
}
