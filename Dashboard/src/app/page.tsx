/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DagVisualizer from "@/components/dagVisualizer";
import Navbar from "@/components/sections/Navbar";
import FeedVeiwer from "@/components/feedViewer";
import FOLViewer from "@/components/folViewer";
import { generateCid } from "@/utils/crypto";
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState<string>("");
  const [nodes, setNodes] = useState<any>([]);
  const [links, setLinks] = useState<any>([]);
  const [selectedNodes, setSelectedNodes] = useState<any>([]); // Change to array

  const handleNodes = (newNode: any) => {
    setNodes((prevNodes: any) => [...prevNodes, newNode]);
  }

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

  return (
    <div className="flex flex-col h-full w-full gap-5">
      <Navbar />
      {/* Contents */}
      <div className="flex flex-row gap-4">
        <FOLViewer />
        <DagVisualizer nodes={nodes} links={links} handleLinks={handleLinks} handleNodes={handleNodes} selectedNodes={selectedNodes} handleSelectedNodes={handleSelectedNodes} />
        <FeedVeiwer />
      </div>
      {/* Input */}
      <div className="flex flex-row border-2 border-black w-full justify-between p-1">
        <input className="flex-1 bg-gray-200" placeholder="Input your next story" value={prompt} onChange={(e: any) => {
          setPrompt(e.target.value);
        }}></input>
        <button className="" onClick={() => {
          const newNode = {
            message: prompt,
            data: [],
            children: [] as any[]
          }
          const cid = generateCid(newNode);
          selectedNodes.forEach((node: any) => {
            newNode.children.push(node.cid);
          });
          setNodes((prevNodes: any) => [...prevNodes, {...newNode, cid, id: cid}])
          selectedNodes.forEach((node: any) => {
            setLinks((prevLinks: any) => [
              ...prevLinks, 
              { source: cid, target: node.id }
            ]);
          })
        }}>Generate</button>
      </div>
    </div>
  );
}
