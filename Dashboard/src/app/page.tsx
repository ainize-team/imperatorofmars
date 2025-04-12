/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DagVisualizer from "@/components/dagVisualizer";
import toast from "react-hot-toast";
import { useState } from "react";
import Navbar from "@/components/sections/Navbar";
import FeedVeiwer from "@/components/feedViewer";
import FOLViewer from "@/components/folViewer";
import { generateCid } from "@/utils/crypto";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [nodes, setNodes] = useState<any>([]);
  const [links, setLinks] = useState<any>([]);
  const [selectedNodes, setSelectedNodes] = useState<any>([]); // Change to array

  const handleNodes = (newNode: any) => {
    setNodes((prevNodes: any) => [...prevNodes, newNode]);
  }

  // const clearHintNodes = () => {
  //   console.log('nodes :>> ', nodes);
  //   setNodes((prevNodes: any) => [...prevNodes.filter((node: any) => node.type !== "hint")])
  //   setLinks((prevLinks: any) => [...prevLinks.filter((link: any) => link.type !== "dotted")]);
  // }

  const handleLinks = (newLink: any) => {
    setLinks((prevLinks: any) => [...prevLinks, newLink]);
  }

  const handleSelectedNodes = (d: any) => {
    setSelectedNodes((prevSelectedNodes: any) => {
      if (prevSelectedNodes.some((node: any) => node.id === d.id)) {
        return prevSelectedNodes.filter((node: any) => node.id !== d.id);
      } else {
        return [...prevSelectedNodes, d];
      }
    });
  }

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

    const newNode = {
      message: input,
      data: [],
      children: [] as any[],
      type: "message",
    }
    const cid = generateCid(newNode);
    selectedNodes.forEach((node: any) => {
      newNode.children.push(node.cid);
    });

    const { hintNodes, hintLinks } = makeHintNode(cid, ["감자 재배하기", "물 찾으러 가기"]);

    setNodes(
      (prevNodes: any) => 
        [
          ...prevNodes.filter((node: any) => node.type === "message"), 
          {...newNode, cid, id: cid}, 
          ...hintNodes
        ]
    );
    selectedNodes.forEach((node: any) => {
      setLinks((prevLinks: any) => [
        ...prevLinks.filter((link: any) => link.type !== "dotted"), 
        { source: cid, target: node.id },
        ...hintLinks
      ]);
    })
    setSelectedNodes([cid]);

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
          selectedNodes={selectedNodes} 
          handleSelectedNodes={handleSelectedNodes}
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
